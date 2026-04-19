#!/bin/bash
# AI-OS Ultimate Local Dev Runner
echo "==================================="
echo "🚀 Booting Personal AI-OS Engine 🚀"
echo "==================================="

# Error handling mapping
trap 'kill %1; kill %2' SIGINT

echo "[1/2] Spinning up FastAPI Core..."
cd backend
source .venv/bin/activate
uvicorn main:app --reload &
sleep 2

echo "[2/2] Igniting React Frontend UI..."
cd ../frontend
npm run dev &

echo "==================================="
echo "📡 BACKEND ACTIVE: http://localhost:8000/docs"
echo "🖥️ FRONTEND ACTIVE: http://localhost:5173"
echo "==================================="

# Wait sequentially for forced loop blocks
wait
