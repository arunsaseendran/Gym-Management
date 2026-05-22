#!/bin/bash
# ── Smart Gym Unified Startup Script ─────────────────────────────────────────

echo "🚀 Starting Smart Gym System..."

# Function to stop servers on CTRL+C
cleanup() {
    echo -e "\n🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT

# 1. Start Python Django backend (Port 8000)
echo "🐍 Starting Python Django backend on http://localhost:8000..."
python3 backend/manage.py runserver 8000 &
BACKEND_PID=$!

# 2. Wait for Django to start
sleep 2

# 3. Start Vite Node frontend (Port 5173)
echo "⚡ Starting Vite Node frontend on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!

# Keep script running
wait
