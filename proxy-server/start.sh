#!/bin/bash

echo "🚀 Starting NBG Merchant Insights Proxy Server"
echo "=============================================="

# Navigate to proxy-server directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate SSL certificates if they don't exist
if [ ! -f "certs/localhost-key.pem" ] || [ ! -f "certs/localhost.pem" ]; then
    echo "🔐 Generating SSL certificates..."
    npm run generate-certs
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Environment file not found. Copying from example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before running in production."
fi

# Check if React app is built
if [ ! -d "../dist" ]; then
    echo "⚠️  React application not built. Building now..."
    cd ..
    if [ -f "package.json" ]; then
        npm install
        npm run build
    else
        echo "❌ No package.json found in parent directory. Please build the React app first."
        exit 1
    fi
    cd proxy-server
fi

echo "✅ Setup complete. Starting proxy server..."
echo ""

# Start the server
npm start