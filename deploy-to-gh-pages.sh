#!/bin/bash

echo "🚀 Deploying Truck Tracker to GitHub Pages..."

# Build web version
echo "📦 Building web version..."
npx expo export --platform web

# Switch to gh-pages branch
echo "🌿 Switching to gh-pages branch..."
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Copy dist contents to root
echo "📋 Copying files..."
cp -r dist/* .

# Add and commit
echo "💾 Committing changes..."
git add .
git commit -m "Deploy Truck Tracker to GitHub Pages"

# Push to gh-pages
echo "🚀 Pushing to GitHub..."
git push origin gh-pages

echo "✅ Deployment complete!"
echo "🌐 Your app will be available at: https://gnana151.github.io/Tracking-App/"
echo "⏰ Please wait 5-10 minutes for GitHub Pages to update."
