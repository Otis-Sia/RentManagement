#!/bin/bash

# Deployment script for Rent Management System with NGINX

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "======================================"
echo " Rent Management System - Deployment"
echo "======================================"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Do not run this script as root/sudo${NC}"
   exit 1
fi

# Build frontend
echo ""
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Frontend build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Frontend built successfully!${NC}"
cd ..

# Setup NGINX configuration
echo ""
echo -e "${YELLOW}Setting up NGINX configuration...${NC}"

NGINX_CONF_SRC="./nginx.conf"
NGINX_CONF_DEST="/etc/nginx/sites-available/rent-management"
NGINX_CONF_LINK="/etc/nginx/sites-enabled/rent-management"

# Copy configuration (requires sudo)
echo "Copying NGINX configuration (requires sudo)..."
sudo cp "$NGINX_CONF_SRC" "$NGINX_CONF_DEST"

# Create symlink if it doesn't exist
if [ ! -L "$NGINX_CONF_LINK" ]; then
    echo "Creating symlink..."
    sudo ln -s "$NGINX_CONF_DEST" "$NGINX_CONF_LINK"
fi

# Test NGINX configuration
echo ""
echo -e "${YELLOW}Testing NGINX configuration...${NC}"
sudo nginx -t

if [ $? -ne 0 ]; then
    echo -e "${RED}NGINX configuration test failed!${NC}"
    exit 1
fi

# Restart NGINX
echo ""
echo -e "${YELLOW}Restarting NGINX...${NC}"
sudo systemctl restart nginx

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to restart NGINX!${NC}"
    exit 1
fi

echo -e "${GREEN}NGINX restarted successfully!${NC}"

# Check NGINX status
echo ""
echo -e "${YELLOW}NGINX Status:${NC}"
sudo systemctl status nginx --no-pager | head -n 10

# Display access information
echo ""
echo "======================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "Your application is now accessible at:"
echo -e "  ${GREEN}http://192.168.100.242${NC}"
echo ""
echo "From any device on your local network:"
echo "  1. Open a web browser"
echo "  2. Navigate to http://192.168.100.242"
echo "  3. Install as PWA (optional)"
echo ""
echo "Backend API:"
echo "  http://192.168.100.242/api/"
echo ""
echo "To view NGINX logs:"
echo "  sudo tail -f /var/log/nginx/error.log"
echo "  sudo tail -f /var/log/nginx/access.log"
echo ""
