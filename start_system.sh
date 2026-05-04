#!/bin/bash

# Rent Management System - Next.js Starter
echo "Starting Rent Management System (Next.js)..."

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the Next.js development server
echo "Launching Next.js development server..."
npm run dev
