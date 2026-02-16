#!/bin/bash

# Rent Management System - Development Mode
# Hot-reloading for both frontend (Vite HMR) and backend (Django auto-reload)

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping dev servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    echo -e "${GREEN}Cleanup complete${NC}"
    exit
}

trap cleanup SIGINT

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE} Rent Management System - DEV MODE${NC}"
echo -e "${BLUE}======================================${NC}"

# Step 1: Database migrations
echo ""
echo -e "${YELLOW}[1/3] Running database migrations...${NC}"
cd backend
source venv/bin/activate

python manage.py makemigrations --check > /dev/null 2>&1
if [ $? -ne 0 ]; then
    python manage.py makemigrations
fi
python manage.py migrate
echo -e "${GREEN}✓ Database ready${NC}"

# Step 2: Kill any existing servers on our ports
echo ""
echo -e "${YELLOW}[2/3] Cleaning up old processes...${NC}"
pkill -f "python manage.py runserver" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1
echo -e "${GREEN}✓ Ports cleared${NC}"

# Step 3: Start both servers
echo ""
echo -e "${YELLOW}[3/3] Starting dev servers...${NC}"

# Start Django backend (auto-reloads on Python file changes)
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Start Vite dev server (HMR - instant browser updates on file changes)
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for servers to start
sleep 3

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Dev Servers Running!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  📱 Frontend (HMR):  ${GREEN}http://192.168.100.242:5173${NC}"
echo -e "  🔌 Backend API:     ${GREEN}http://localhost:8000/api/${NC}"
echo -e "  ⚙️  Admin:          ${GREEN}http://localhost:8000/admin/${NC}"
echo ""
echo -e "${BLUE}Live Reload:${NC}"
echo "  ✓ Frontend changes update instantly (no refresh needed)"
echo "  ✓ CSS changes apply immediately"
echo "  ✓ Backend restarts automatically on Python changes"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
