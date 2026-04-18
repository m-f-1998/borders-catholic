#!/bin/bash

set -e

# Get the directory of the script to handle relative paths correctly
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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