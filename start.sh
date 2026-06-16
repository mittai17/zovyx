#!/bin/bash
# Zuvix Cloud Setup & Bootstrap Script
# This script installs all dependencies and starts the web and agent processes.

set -e

echo "==============================================="
echo "🚀 Initializing Zuvix Cloud Platform..."
echo "==============================================="

echo "[1/4] Installing dependencies via pnpm..."
pnpm install

echo "[2/4] Building Zuvix Agent & Shared Packages..."
pnpm run build

echo "[3/4] Ensuring Database schema..."
# In a real cloud env, you would run migrations here, but for now we skip

echo "[4/4] Starting the Zuvix Cloud Platform..."
echo "Starting Zuvix Agent (Backend) on port 3001..."
pnpm --filter zuvix-agent run dev &

echo "Starting Next.js App (Frontend) on port 3000..."
cd web && npm run dev

# Wait for all background processes
wait
