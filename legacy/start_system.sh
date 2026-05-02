#!/bin/bash

# Rent Management System - Network Startup Script
# Starts everything needed to run the system on the local network

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

LOCAL_IP=""
FRONTEND_URL=""
BROWSER_PID=""
BROWSER_PROFILE_DIR=""

detect_local_ip() {
    local ip
    ip=$(hostname -I 2>/dev/null | tr ' ' '\n' | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' | grep -v '^127\.' | head -n1)

    if [ -z "$ip" ]; then
        return 1
    fi

    echo "$ip"
}

# Resolve default browser executable from xdg desktop entry
get_default_browser_command() {
    if ! command -v xdg-settings >/dev/null 2>&1; then
        return 1
    fi

    local desktop_entry
    desktop_entry=$(xdg-settings get default-web-browser 2>/dev/null)
    if [ -z "$desktop_entry" ]; then
        return 1
    fi

    local desktop_file=""
    if [ -f "$HOME/.local/share/applications/$desktop_entry" ]; then
        desktop_file="$HOME/.local/share/applications/$desktop_entry"
    elif [ -f "/usr/share/applications/$desktop_entry" ]; then
        desktop_file="/usr/share/applications/$desktop_entry"
    fi

    if [ -z "$desktop_file" ]; then
        return 1
    fi

    local exec_line
    exec_line=$(grep -m1 '^Exec=' "$desktop_file")
    if [ -z "$exec_line" ]; then
        return 1
    fi

    exec_line=${exec_line#Exec=}
    echo "$exec_line" | sed -E 's/%[a-zA-Z]//g' | awk '{print $1}' | sed 's/^"//; s/"$//'
}

open_browser_window() {
    echo -e "${YELLOW}Opening system in a dedicated browser window...${NC}"

    local browser_cmd
    browser_cmd=$(get_default_browser_command)

    if [ -n "$browser_cmd" ] && command -v "$browser_cmd" >/dev/null 2>&1; then
        case "$browser_cmd" in
            *chrome*|*chromium*|*brave*|*microsoft-edge*|*msedge*)
                BROWSER_PROFILE_DIR=$(mktemp -d)
                "$browser_cmd" --user-data-dir="$BROWSER_PROFILE_DIR" --new-window --app="$FRONTEND_URL" >/dev/null 2>&1 &
                BROWSER_PID=$!
                echo -e "${GREEN}✓ Opened dedicated app window (${browser_cmd})${NC}"
                return 0
                ;;
            *firefox*)
                BROWSER_PROFILE_DIR=$(mktemp -d)
                "$browser_cmd" -profile "$BROWSER_PROFILE_DIR" -new-window "$FRONTEND_URL" >/dev/null 2>&1 &
                BROWSER_PID=$!
                echo -e "${GREEN}✓ Opened new browser window (${browser_cmd})${NC}"
                return 0
                ;;
        esac
    fi

    echo -e "${RED}Dedicated window mode is not supported by your default browser setup.${NC}"
    echo -e "${RED}Set a supported default browser (Chromium/Chrome/Brave/Edge/Firefox) and retry.${NC}"
    return 1
}

# Function to handle script termination
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"

    if [ -n "$BROWSER_PID" ] && ps -p "$BROWSER_PID" >/dev/null 2>&1; then
        kill -TERM "$BROWSER_PID" 2>/dev/null
        sleep 1
        if ps -p "$BROWSER_PID" >/dev/null 2>&1; then
            kill -9 "$BROWSER_PID" 2>/dev/null
        fi
        echo -e "${GREEN}✓ Browser window and tab closed${NC}"
    fi

    if [ -n "$BROWSER_PROFILE_DIR" ] && [ -d "$BROWSER_PROFILE_DIR" ]; then
        rm -rf "$BROWSER_PROFILE_DIR"
    fi

    kill $(jobs -p) 2>/dev/null
    echo -e "${GREEN}Cleanup complete${NC}"
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE} Rent Management System - Network Mode${NC}"
echo -e "${BLUE}======================================${NC}"

LOCAL_IP=$(detect_local_ip)
if [ -z "$LOCAL_IP" ]; then
    echo -e "${RED}Could not detect a LAN IPv4 address automatically.${NC}"
    echo -e "${YELLOW}Falling back to localhost mode for browser URL output.${NC}"
    LOCAL_IP="127.0.0.1"
fi
FRONTEND_URL="http://${LOCAL_IP}"

# Step 1: Database Migration
echo ""
echo -e "${YELLOW}[1/4] Running database migrations...${NC}"
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../.venv" ]; then
    source ../.venv/bin/activate
else
    echo -e "${RED}No virtual environment found! Create one with: python -m venv venv${NC}"
    exit 1
fi

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



# Step 2: Build Frontend
echo ""
echo -e "${YELLOW}[2/4] Building frontend for production...${NC}"
cd ../frontend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Frontend built successfully${NC}"
cd ..

# Step 3: Configure and Start NGINX
echo ""
echo -e "${YELLOW}[3/4] Configuring NGINX...${NC}"

# Check if NGINX config needs to be installed
if [ ! -f /etc/nginx/sites-available/rent-management ]; then
    echo "Installing NGINX configuration (requires sudo)..."
    sudo cp nginx.conf /etc/nginx/sites-available/rent-management
    echo -e "${GREEN}✓ NGINX configuration installed${NC}"
else
    echo "Updating NGINX configuration..."
    sudo cp nginx.conf /etc/nginx/sites-available/rent-management
    echo -e "${GREEN}✓ NGINX configuration updated${NC}"
fi

# Ensure our site is enabled and default site is disabled
sudo ln -sf /etc/nginx/sites-available/rent-management /etc/nginx/sites-enabled/rent-management
if [ -e /etc/nginx/sites-enabled/default ]; then
    echo "Disabling default NGINX site..."
    sudo rm -f /etc/nginx/sites-enabled/default
fi

# Test NGINX configuration
echo "Testing NGINX configuration..."
sudo nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}NGINX configuration test failed!${NC}"
    exit 1
fi

# Fix permissions for NGINX to access frontend files
echo "Setting directory permissions for NGINX access..."
chmod +x $HOME $HOME/Desktop $HOME/Desktop/Code $HOME/Desktop/Code/RentManagement $HOME/Desktop/Code/RentManagement/frontend $HOME/Desktop/Code/RentManagement/frontend/dist

# Restart NGINX
echo "Restarting NGINX..."
sudo systemctl restart nginx
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to restart NGINX!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ NGINX started successfully${NC}"

# Step 4: Start Django Backend
echo ""
echo -e "${YELLOW}[4/4] Starting Django backend...${NC}"

# Kill any existing Django servers on the port
echo "Checking for existing Django processes..."
pkill -f "python manage.py runserver" 2>/dev/null
sleep 1

cd backend
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Wait for backend to start and verify
sleep 3

# Check if the process is still running
if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend server started successfully${NC}"
else
    echo -e "${RED}✗ Backend server failed to start${NC}"
    echo -e "${RED}Check if port 8000 is in use or check logs for errors${NC}"
    exit 1
fi

# Display access information
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  System Running on Network!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo -e "  📱 Frontend:  ${GREEN}${FRONTEND_URL}${NC}"
echo -e "  🔌 Backend:   ${GREEN}${FRONTEND_URL}/api/${NC}"
echo -e "  ⚙️  Admin:    ${GREEN}${FRONTEND_URL}/admin/${NC}"
echo ""
echo -e "${BLUE}Features:${NC}"
echo "  ✓ Local network broadcasting"
echo "  ✓ PWA installable on devices"
echo "  ✓ Auto-updates on network reconnection"
echo "  ✓ Offline support with service worker"
echo ""
echo -e "${YELLOW}How to Access:${NC}"
echo "  1. From any device on your network"
echo "  2. Open browser and go to: ${FRONTEND_URL}"
echo "  3. Install as PWA for best experience"
echo ""

if ! open_browser_window; then
    cleanup
fi
echo ""

echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for backend process
wait $BACKEND_PID
cleanup
