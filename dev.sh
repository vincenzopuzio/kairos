#!/bin/bash
# AI-OS Ultimate Local Dev Runner
echo "==================================="
echo "🚀 Booting Personal AI-OS Engine 🚀"
echo "==================================="

# Error handling mapping
trap 'kill %1; kill %2' SIGINT

echo "[1/3] Applying database migrations..."
cd backend
source .venv/bin/activate
alembic upgrade head
echo "✅ Schema up to date."

echo "[2/3] Spinning up FastAPI Core..."
uvicorn main:app --reload &
sleep 2

echo "[3/3] Igniting React Frontend UI..."
cd ../frontend
npm run dev &

echo "==================================="
echo "📡 BACKEND ACTIVE: http://localhost:8000/docs"
echo "🖥️  FRONTEND ACTIVE: http://localhost:5173"
echo "==================================="

# Wait sequentially for forced loop blocks
wait
