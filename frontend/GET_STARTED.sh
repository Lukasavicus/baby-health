#!/bin/bash

echo "================================"
echo "BabyHealth Frontend - Get Started"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "📥 Install from https://nodejs.org"
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo "✅ npm $(npm --version) found"
echo ""

# Navigate to frontend
cd "$(dirname "$0")" || exit 1

echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation complete!"
    echo ""
    echo "🚀 Starting development server..."
    echo ""
    echo "The app will open at: http://localhost:5173"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
else
    echo "❌ Installation failed"
    exit 1
fi
