#!/bin/bash

# Hello World Mobile App - Setup Script
echo "🚀 Setting up Simple Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version $NODE_VERSION detected. Recommended: Node.js 18+"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI globally..."
    npm install -g @expo/cli
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Run: npm start"
echo "   2. Install Expo Go app on your phone"
echo "   3. Scan the QR code to test the app"
echo ""
echo "📱 Download Expo Go:"
echo "   Android: https://play.google.com/store/apps/details?id=host.exp.exponent"
echo "   iOS: https://apps.apple.com/app/expo-go/id982107779"
