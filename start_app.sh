#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Studion Application...${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${RED}🛑 Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Check if directories exist
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Frontend directory not found!${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Installing dependencies if needed...${NC}"

# Install backend dependencies if node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

echo -e "${GREEN}🔧 Starting Backend...${NC}"
cd backend && npm run dev &
BACKEND_PID=$!

echo -e "${GREEN}🎨 Starting Frontend...${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!

# Go back to root directory
cd ..

echo -e "${GREEN}✅ Both services are starting...${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:5173${NC}"
echo -e "${BLUE}🔗 Backend: http://localhost:3000${NC}"
echo -e "${RED}Press Ctrl+C to stop both services${NC}"

# Wait for both processes
wait