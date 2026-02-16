#!/bin/bash

# Rent Management System - Network Startup Script
# Starts everything needed to run the system on the local network

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to handle script termination
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
    kill $(jobs -p) 2>/dev/null
    echo -e "${GREEN}Cleanup complete${NC}"
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE} Rent Management System - Network Mode${NC}"
echo -e "${BLUE}======================================${NC}"

# Step 1: Database Migration
echo ""
echo -e "${YELLOW}[1/5] Running database migrations...${NC}"
cd backend
source venv/bin/activate

python manage.py makemigrations
if [ $? -ne 0 ]; then
    echo -e "${RED}Migrations failed!${NC}"
    exit 1
fi

python manage.py migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}Migration failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database migrations complete${NC}"

# Step 2: Run Tests
echo ""
echo -e "${YELLOW}[2/5] Running system tests...${NC}"
python manage.py test houses tenants
if [ $? -ne 0 ]; then
    echo -e "${RED}Tests failed! Continue anyway? (y/n)${NC}"
    read -p "" continue_choice
    if [ "$continue_choice" != "y" ]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ All tests passed${NC}"
fi

# Step 3: Build Frontend
echo ""
echo -e "${YELLOW}[3/5] Building frontend for production...${NC}"
cd ../frontend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend built successfully${NC}"
cd ..

# Step 4: Configure and Start NGINX
echo ""
echo -e "${YELLOW}[4/5] Configuring NGINX...${NC}"

# Check if NGINX config needs to be installed
if [ ! -f /etc/nginx/sites-available/rent-management ]; then
    echo "Installing NGINX configuration (requires sudo)..."
    sudo cp nginx.conf /etc/nginx/sites-available/rent-management
    sudo ln -sf /etc/nginx/sites-available/rent-management /etc/nginx/sites-enabled/rent-management
    echo -e "${GREEN}✓ NGINX configuration installed${NC}"
else
    echo "Updating NGINX configuration..."
    sudo cp nginx.conf /etc/nginx/sites-available/rent-management
    echo -e "${GREEN}✓ NGINX configuration updated${NC}"
fi

# Test NGINX configuration
echo "Testing NGINX configuration..."
sudo nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}NGINX configuration test failed!${NC}"
    exit 1
fi

# Restart NGINX
echo "Restarting NGINX..."
sudo systemctl restart nginx
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to restart NGINX!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ NGINX started successfully${NC}"

# Step 5: Start Django Backend
echo ""
echo -e "${YELLOW}[5/5] Starting Django backend...${NC}"
cd backend
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2
echo -e "${GREEN}✓ Backend server started${NC}"

# Display access information
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  System Running on Network!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  📱 Frontend:  ${GREEN}http://192.168.100.242${NC}"
echo -e "  🔌 Backend:   ${GREEN}http://192.168.100.242/api/${NC}"
echo -e "  ⚙️  Admin:    ${GREEN}http://192.168.100.242/admin/${NC}"
echo ""
echo -e "${BLUE}Features:${NC}"
echo "  ✓ Local network broadcasting"
echo "  ✓ PWA installable on devices"
echo "  ✓ Auto-updates on network reconnection"
echo "  ✓ Offline support with service worker"
echo ""
echo -e "${YELLOW}How to Access:${NC}"
echo "  1. From any device on your network"
echo "  2. Open browser and go to: http://192.168.100.242"
echo "  3. Install as PWA for best experience"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for backend process
wait $BACKEND_PID
