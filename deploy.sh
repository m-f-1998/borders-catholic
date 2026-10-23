#!/bin/bash

set -e

# Get the directory of the script to handle relative paths correctly
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Optional local deploy secrets (CR_PAT, Portainer webhooks). Not used by the app server.
if [[ -f "$SCRIPT_DIR/.deploy.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/.deploy.env"
  set +a
fi

USERNAME="m-f-1998"
REPO_NAME="borders-catholic"
MODE="${1:-local}"

if [[ "$MODE" == "latest" ]]; then
  TAG="latest"
  echo "🚀 Building for PRODUCTION (tag: $TAG)"
elif [[ "$MODE" == "dev" ]]; then
  TAG="dev"
  echo "🧪 Building for DEVELOPMENT (tag: $TAG)"
else
  echo "❌ Invalid mode specified. Use 'latest' or 'dev'."
  exit 1
fi

if [ -z "$CR_PAT" ]; then
  echo "❌ CR_PAT (GitHub Container Registry Personal Access Token) not provided."
  echo "Example: CR_PAT=your_token_here ./deploy.sh dev"
  exit 1
fi

IMAGE="ghcr.io/$USERNAME/$REPO_NAME:$TAG"

echo "📦 Compiling project..."
"$SCRIPT_DIR/docker/compile.sh"

if ! docker buildx inspect multiarch > /dev/null 2>&1; then
  echo "🔧 Creating new buildx builder..."
  docker buildx create --name multiarch --use
fi

if ! docker info 2>/dev/null | grep -q 'ghcr.io'; then
  echo "🔐 Logging into GitHub Container Registry..."
  echo $CR_PAT | docker login ghcr.io -u $USERNAME --password-stdin
else
  echo "🔓 Already logged into GitHub Container Registry."
fi

echo "🐳 Building and Pushing Multi-Arch Docker image: $IMAGE"
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f docker/Dockerfile \
  -t $IMAGE \
  --push .

echo "✅ Success! Image pushed to: $IMAGE"

IMAGE_REPO="ghcr.io/$USERNAME/$REPO_NAME"
IMAGE_REF="$IMAGE_REPO:$TAG"

CF_ACCESS_HEADERS=()
if [[ -n "$CF_ACCESS_CLIENT_ID" && -n "$CF_ACCESS_CLIENT_SECRET" ]]; then
  CF_ACCESS_HEADERS=(-H "CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID" -H "CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET")
fi

portainer_base_url() {
  if [[ -n "$PORTAINER_URL" ]]; then
    echo "${PORTAINER_URL%/}"
    return 0
  fi
  if [[ -n "$PORTAINER_WEBHOOK" ]]; then
    echo "$PORTAINER_WEBHOOK" | sed -E 's|(https?://[^/]+).*|\1|'
    return 0
  fi
  return 1
}

portainer_api() {
  local method="$1"
  local path="$2"
  local base_url endpoint_id
  base_url=$(portainer_base_url) || return 1
  endpoint_id="${PORTAINER_ENDPOINT_ID:-1}"
  curl -s -w "\n%{http_code}" -X "$method" \
    "${CF_ACCESS_HEADERS[@]}" \
    -H "X-API-Key: $PORTAINER_API_TOKEN" \
    "${base_url}/api/endpoints/${endpoint_id}/docker${path}"
}

portainer_api_error_hint() {
  local status="$1"
  if [[ "$status" == "403" ]]; then
    echo "⚠️  Portainer API HTTP 403 — the access token must belong to an Administrator account."
    echo "   Create one under Portainer → My account → Access tokens (admin user)."
    echo "   Check PORTAINER_ENDPOINT_ID matches your environment (Portainer → Environments → URL #/endpoints/N)."
    echo "   Test: curl -s -H \"X-API-Key: \$PORTAINER_API_TOKEN\" \"\$PORTAINER_URL/api/endpoints/1/docker/info\""
  else
    echo "⚠️  Portainer API HTTP $status"
  fi
}

# Remember the image currently tagged :latest or :dev before redeploy replaces it.
portainer_capture_old_image() {
  if [[ -z "$PORTAINER_API_TOKEN" ]]; then
    return 0
  fi
  if ! command -v python3 >/dev/null 2>&1; then
    echo "⚠️  Skipping image capture (python3 required)."
    return 0
  fi

  local out http_status body
  out=$(portainer_api GET "/images/json?all=true") || return 0
  http_status=$(echo "$out" | tail -n1)
  body=$(echo "$out" | sed '$d')

  if [[ "$http_status" != "200" ]]; then
    portainer_api_error_hint "$http_status"
    return 0
  fi

  IMAGE_REF="$IMAGE_REF" BODY="$body" python3 <<'PY'
import json, os
images = json.loads(os.environ["BODY"])
target = os.environ["IMAGE_REF"]
for image in images:
    tags = image.get("RepoTags") or []
    if target in tags:
        print(image["Id"])
        break
PY
}

# Delete only the previous image for the tag that was just deployed.
portainer_prune_old_image() {
  local old_image_id="$1"

  if [[ -z "$PORTAINER_API_TOKEN" ]]; then
    echo "ℹ️  Skipping image prune (set PORTAINER_API_TOKEN in .deploy.env)."
    return 0
  fi
  if [[ -z "$old_image_id" ]]; then
    echo "ℹ️  No previous $IMAGE_REF image on the host to remove."
    return 0
  fi
  if ! command -v python3 >/dev/null 2>&1; then
    echo "⚠️  Skipping image prune (python3 required)."
    return 0
  fi

  local max_wait="${PORTAINER_PRUNE_WAIT_SECONDS:-60}"
  local poll=5
  local elapsed=0
  local containers_body="" running_count=0

  echo "⏳ Waiting for redeploy (up to ${max_wait}s) before removing old $IMAGE_REF image..."

  while [[ "$elapsed" -lt "$max_wait" ]]; do
    local out http_status
    out=$(portainer_api GET "/containers/json?all=true") || return 0
    http_status=$(echo "$out" | tail -n1)
    containers_body=$(echo "$out" | sed '$d')
    if [[ "$http_status" != "200" ]]; then
      portainer_api_error_hint "$http_status"
      return 0
    fi

    running_count=$(OLD_IMAGE_ID="$old_image_id" BODY="$containers_body" python3 <<'PY'
import json, os
old_id = os.environ["OLD_IMAGE_ID"]
containers = json.loads(os.environ["BODY"])
print(sum(
    1 for c in containers
    if (c.get("ImageID") or c.get("Image")) == old_id and c.get("State") == "running"
))
PY
)

    if [[ "$running_count" -eq 0 ]]; then
      break
    fi

    sleep "$poll"
    elapsed=$((elapsed + poll))
  done

  if [[ "$running_count" -gt 0 ]]; then
    echo "ℹ️  Previous image still used by a running container after ${max_wait}s — skipping delete."
    echo "   Try increasing PORTAINER_PRUNE_WAIT_SECONDS if redeploys are slow."
    return 0
  fi

  # Stopped containers from the old deploy still block image deletion — remove them first.
  local stopped_ids
  stopped_ids=$(OLD_IMAGE_ID="$old_image_id" BODY="$containers_body" python3 <<'PY'
import json, os
old_id = os.environ["OLD_IMAGE_ID"]
containers = json.loads(os.environ["BODY"])
for c in containers:
    if (c.get("ImageID") or c.get("Image")) != old_id:
        continue
    if c.get("State") != "running":
        print(c["Id"])
PY
)

  if [[ -n "$stopped_ids" ]]; then
    echo "🧹 Removing stopped containers still referencing the old image..."
    while IFS= read -r container_id; do
      [[ -z "$container_id" ]] && continue
      out=$(portainer_api DELETE "/containers/${container_id}?v=true") || continue
      http_status=$(echo "$out" | tail -n1)
      if [[ "$http_status" == "204" || "$http_status" == "200" ]]; then
        echo "   Removed stopped container ${container_id:0:12}"
      fi
    done <<< "$stopped_ids"
  fi

  local encoded
  encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$old_image_id', safe=''))")
  echo "🧹 Removing previous $IMAGE_REF image..."
  out=$(portainer_api DELETE "/images/${encoded}?force=false") || return 0
  http_status=$(echo "$out" | tail -n1)
  body=$(echo "$out" | sed '$d')

  if [[ "$http_status" == "200" || "$http_status" == "204" ]]; then
    echo "✅ Removed previous image for $IMAGE_REF"
  elif [[ "$http_status" == "404" ]]; then
    echo "ℹ️  Previous image already gone (likely untagged and collected)."
  elif [[ "$http_status" == "409" ]]; then
    echo "ℹ️  Previous image still referenced — redeploy may not have finished yet."
    echo "   Try increasing PORTAINER_PRUNE_WAIT_SECONDS (currently ${max_wait}s)."
  else
    portainer_api_error_hint "$http_status"
    [[ -n "$body" ]] && echo "   $body"
  fi
}

# Webhooks stay pinned to one container id. If that container was removed,
# pull and recreate whichever container is actually running this image.
portainer_recreate_current ( ) {
  if [[ -z "$PORTAINER_API_TOKEN" ]]; then
    echo "⚠️  Cannot recreate container (set PORTAINER_API_TOKEN in .deploy.env)."
    return 1
  fi

  local out http_status body container_id base_url endpoint_id
  out=$(portainer_api GET "/containers/json?all=true") || return 1
  http_status=$(echo "$out" | tail -n1)
  body=$(echo "$out" | sed '$d')
  if [[ "$http_status" != "200" ]]; then
    portainer_api_error_hint "$http_status"
    return 1
  fi

  container_id=$(IMAGE_REF="$IMAGE_REF" REPO_NAME="$REPO_NAME" TAG="$TAG" BODY="$body" python3 <<'PY'
import json, os
containers = json.loads(os.environ["BODY"])
image_ref = os.environ["IMAGE_REF"]
repo = os.environ["REPO_NAME"]
tag = os.environ["TAG"]
wanted_name = f"/{repo}" if tag == "latest" else f"/{repo}-{tag}"
for container in containers:
    if container.get("State") != "running":
        continue
    names = container.get("Names") or []
    image = container.get("Image") or ""
    if image == image_ref and wanted_name in names:
        print(container["Id"])
        break
PY
)

  if [[ -z "$container_id" ]]; then
    echo "⚠️  No running container named ${REPO_NAME} for $IMAGE_REF."
    return 1
  fi

  base_url=$(portainer_base_url) || return 1
  endpoint_id="${PORTAINER_ENDPOINT_ID:-1}"
  echo "🔄 Recreating ${container_id:0:12} and pulling $IMAGE_REF..."
  out=$(curl -s -w "\n%{http_code}" -X POST \
    "${CF_ACCESS_HEADERS[@]}" \
    -H "X-API-Key: $PORTAINER_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"PullImage":true}' \
    "${base_url}/api/docker/${endpoint_id}/containers/${container_id}/recreate") || return 1
  http_status=$(echo "$out" | tail -n1)
  body=$(echo "$out" | sed '$d')
  if [[ "$http_status" == "200" ]]; then
    echo "✅ Container recreated from $IMAGE_REF."
    return 0
  fi

  portainer_api_error_hint "$http_status"
  [[ -n "$body" ]] && echo "   ${body:0:300}"
  return 1
}

if [[ "$TAG" == "latest" && -n "$PORTAINER_WEBHOOK_LATEST" ]]; then
  PORTAINER_WEBHOOK="$PORTAINER_WEBHOOK_LATEST"
elif [[ "$TAG" == "dev" && -n "$PORTAINER_WEBHOOK_DEV" ]]; then
  PORTAINER_WEBHOOK="$PORTAINER_WEBHOOK_DEV"
fi

if [[ -n "$PORTAINER_WEBHOOK" ]]; then
  PORTAINER_OLD_IMAGE_ID=""
  if [[ -n "$PORTAINER_API_TOKEN" ]]; then
    PORTAINER_OLD_IMAGE_ID=$(portainer_capture_old_image)
    if [[ -n "$PORTAINER_OLD_IMAGE_ID" ]]; then
      echo "📸 Previous $IMAGE_REF image: ${PORTAINER_OLD_IMAGE_ID:0:20}..."
    fi
  fi

  echo "🔄 Triggering Portainer redeploy for tag: $TAG"
  HTTP_STATUS=$(curl -s -o /tmp/portainer-webhook.out -w "%{http_code}" "${CF_ACCESS_HEADERS[@]}" -X POST "$PORTAINER_WEBHOOK")
  if [[ "$HTTP_STATUS" == "204" || "$HTTP_STATUS" == "200" ]]; then
    echo "✅ Portainer redeploy triggered."
    portainer_prune_old_image "$PORTAINER_OLD_IMAGE_ID"
  else
    echo "⚠️  Portainer webhook returned HTTP $HTTP_STATUS:"
    cat /tmp/portainer-webhook.out
    if grep -q "No such container" /tmp/portainer-webhook.out && portainer_recreate_current; then
      portainer_prune_old_image "$PORTAINER_OLD_IMAGE_ID"
    else
      exit 1
    fi
  fi
else
  echo "ℹ️  No Portainer webhook configured for tag '$TAG' (set PORTAINER_WEBHOOK_LATEST or PORTAINER_WEBHOOK_DEV)."
fi