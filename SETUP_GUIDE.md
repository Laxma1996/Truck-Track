# 🚀 Setup Guide for New Repository

## Step 1: Create New Repository on GitHub

1. **Go to GitHub.com** and sign in to your Gnana151 account
2. **Click the "+" icon** → **"New repository"**
3. **Repository name**: `truck-tracker`
4. **Description**: "A React Native truck logging and tracking app built with Expo"
5. **Visibility**: Public
6. **DO NOT** initialize with README, .gitignore, or license
7. **Click "Create repository"**

## Step 2: Upload Files to GitHub

### Option A: Using GitHub Web Interface
1. Go to your new repository: `https://github.com/Gnana151/truck-tracker`
2. Click **"uploading an existing file"**
3. Upload these files/folders:
   - `App.js`
   - `app.json`
   - `babel.config.js`
   - `eas.json`
   - `package.json`
   - `README.md`
   - `.gitignore`
   - `screens/` folder
   - `utils/` folder
   - `web/` folder
   - `.github/` folder
4. Add commit message: "Initial commit: Truck Tracker App"
5. Click **"Commit changes"**

### Option B: Using Git Commands
```bash
# Initialize git (if not already done)
git init

# Add remote origin
git remote add origin https://github.com/Gnana151/truck-tracker.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Truck Tracker App"

# Push to main branch
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to repository **Settings**
2. Scroll to **Pages** section
3. Under **Source**, select **"GitHub Actions"**
4. Click **Save**

## Step 4: Verify Deployment

1. Go to **Actions** tab in your repository
2. You should see the workflow running
3. Wait 2-3 minutes for deployment
4. Visit: **https://gnana151.github.io/truck-tracker/**

## Step 5: Test Your App

Your truck tracker app will be live with:
- ✅ Login system (admin/password)
- ✅ Truck type selection
- ✅ Weight input and validation
- ✅ Photo capture/upload
- ✅ Data storage
- ✅ Responsive design

## 🎯 Your App URL
**https://gnana151.github.io/truck-tracker/**

## 📱 Features
- Cross-platform (Android, iOS, Web)
- Professional UI with Material Design
- Camera integration for truck photos
- Local data storage
- Job tracking system
- Weight validation

---
**Ready to deploy! Follow the steps above to get your app live on GitHub Pages.**
