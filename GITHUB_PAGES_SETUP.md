# 🚀 GitHub Pages Deployment Guide

## Your Truck Tracker App URL

Once deployed, your app will be available at:
**https://gnana151.github.io/Tracking-App/**

## 📋 Manual Setup Steps

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/Gnana151/Tracking-App
2. Click on **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select **"Deploy from a branch"**
5. Select **"gh-pages"** branch
6. Click **Save**

### Step 2: Create gh-pages Branch

Run these commands in your terminal:

```bash
# Create and switch to gh-pages branch
git checkout -b gh-pages

# Copy the dist folder contents to root
cp -r dist/* .

# Add all files
git add .

# Commit changes
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages branch
git push origin gh-pages
```

### Step 3: Access Your App

After a few minutes, your app will be live at:
**https://gnana151.github.io/Tracking-App/**

## 🔄 Automatic Updates

To update your deployed app:

1. Make changes to your code
2. Build web version: `npx expo export --platform web`
3. Switch to gh-pages branch: `git checkout gh-pages`
4. Copy new files: `cp -r dist/* .`
5. Commit and push: `git add . && git commit -m "Update app" && git push origin gh-pages`

## 📱 Features Available on GitHub Pages

- ✅ **Login System** (admin/password)
- ✅ **Truck Type Selection**
- ✅ **Weight Input**
- ✅ **Photo Upload** (file selection)
- ✅ **Data Storage** (local storage)
- ✅ **Job Tracking**
- ✅ **Responsive Design**

## 🎯 Sharing Your App

Share this URL with anyone:
**https://gnana151.github.io/Tracking-App/**

They can:
- Access it from any device
- Add to home screen for app-like experience
- Use all features without installation

## 🛠️ Troubleshooting

### If the page doesn't load:
1. Wait 5-10 minutes for GitHub Pages to deploy
2. Check the Actions tab for any errors
3. Ensure gh-pages branch exists and has content

### If you need to rebuild:
```bash
npx expo export --platform web
git checkout gh-pages
cp -r dist/* .
git add .
git commit -m "Rebuild app"
git push origin gh-pages
```

## 📞 Support

If you encounter any issues:
1. Check GitHub Pages settings
2. Verify gh-pages branch has content
3. Check Actions tab for deployment status

---

**Your app will be live at: https://gnana151.github.io/Tracking-App/**
