#!/bin/bash
# Run this script to set up the PostgreSQL database and user
echo "Creating PostgreSQL user 'RentManagement'..."
sudo -u postgres psql -c "CREATE USER \"RentManagement\" WITH PASSWORD 'root';" || echo "User might already exist (ignoring error)"

echo "Creating Database 'rent_management'..."
sudo -u postgres psql -c "CREATE DATABASE rent_management OWNER \"RentManagement\";" || echo "Database might already exist (ignoring error)"

echo "Granting privileges..."
sudo -u postgres psql -c "ALTER USER \"RentManagement\" CREATEDB;"

echo "Database setup complete!"
