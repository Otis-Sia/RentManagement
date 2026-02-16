#!/bin/bash

# One-time setup script to allow passwordless sudo for NGINX commands
# This is safe because it only allows specific NGINX-related commands

SUDOERS_FILE="/etc/sudoers.d/rent-management-nginx"
USERNAME=$(whoami)

echo "Setting up passwordless sudo for NGINX commands..."
echo "This will allow start_system.sh to run without password prompts"
echo ""

# Create the sudoers configuration
sudo tee "$SUDOERS_FILE" > /dev/null << EOF
# Passwordless sudo for NGINX commands for Rent Management System
# User: $USERNAME

$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/cp * /etc/nginx/sites-available/rent-management
$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/ln -sf /etc/nginx/sites-available/rent-management /etc/nginx/sites-enabled/rent-management
$USERNAME ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
$USERNAME ALL=(ALL) NOPASSWD: /usr/bin/systemctl status nginx*
EOF

# Validate the sudoers file
sudo visudo -c -f "$SUDOERS_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Sudoers configuration created successfully!"
    echo ""
    echo "You can now run start_system.sh without entering your password"
    echo "for NGINX-related commands."
    echo ""
    echo "To remove this configuration later, run:"
    echo "  sudo rm $SUDOERS_FILE"
else
    echo "✗ Error in sudoers configuration!"
    sudo rm "$SUDOERS_FILE" 2>/dev/null
    exit 1
fi
