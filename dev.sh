#!/bin/bash

set -e

# Get the directory of the script to handle relative paths correctly
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 Compiling project..."
"$SCRIPT_DIR/docker/compile.sh"

echo "🧹 Cleaning up previous Docker containers and images..."
cd "$SCRIPT_DIR/docker"
docker system prune -a --volumes -f

echo "🐳 Starting Docker Compose..."
docker compose up --build -d
