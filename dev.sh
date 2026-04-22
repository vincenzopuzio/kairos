#!/bin/bash
# AI-OS Ultimate Local Dev Runner
echo "==================================="
echo "🚀 Booting Personal AI-OS Engine 🚀"
echo "==================================="

# Error handling mapping
trap 'kill %1; kill %2' SIGINT

# 1. Database Safety & Migrations
echo "[1/3] Securing database & applying migrations..."
cd backend
source .venv/bin/activate

# Automated backup of the current database state
if [ -f "sql_app.db" ]; then
    mkdir -p backups
    cp sql_app.db backups/sql_app_$(date +%Y%m%d_%H%M%S).db
    # Keep only the last 10 backups to save space
    ls -t backups/sql_app_*.db | tail -n +11 | xargs -r rm
    echo "💾 Database backup created in backend/backups/"
fi

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
