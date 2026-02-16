#!/bin/bash

# Function to handle script termination
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p)
    exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

echo "================================"
echo " Rent Management System Startup"
echo "================================"

# Database Migration and Testing
echo ""
echo "Running Django migrations..."
cd backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate

echo ""
echo "Running Django tests..."
python manage.py test houses tenants

# Start Backend
echo ""
echo "Starting Backend Server..."
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Start Frontend
echo ""
echo "Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================"
echo " Both servers are running!"
echo " Backend: http://localhost:8000"
echo " Frontend: http://localhost:5173"
echo " Press Ctrl+C to stop"
echo "================================"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
