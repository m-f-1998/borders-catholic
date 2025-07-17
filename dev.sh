#!/bin/bash

set -e

# Get the directory of the script to handle relative paths correctly
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ ! -f "$SCRIPT_DIR/docker/docker-compose.yml" ]]; then
  echo "❌ Error: docker/docker-compose.yml file not found"
  exit 1
fi

if [[ ! -f "$SCRIPT_DIR/docker/docker-compose.override.yml" ]]; then
  echo "❌ Error: docker/docker-compose.override.yml file not found"
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo "❌ Error: docker-compose is not installed"
  exit 1
fi

if ! docker info &> /dev/null; then
  echo "❌ Error: Docker is not running"
  exit 1
fi

echo "📦 Compiling project..."
"$SCRIPT_DIR/docker/compile.sh"

echo "🧹 Cleaning up previous Docker containers and images..."
cd "$SCRIPT_DIR/docker"
docker system prune -a --volumes -f

echo "🐳 Starting Docker Compose..."
docker compose up --build -d
