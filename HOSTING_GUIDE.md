# 🌐 Host Your Truck Tracker App on GitHub Pages

## Your App Will Be Live At:
**https://gnana151.github.io/Tracking-App/**

## 🚀 Step-by-Step Hosting Process

### Step 1: Enable GitHub Pages

1. **Go to your repository**: https://github.com/Gnana151/Tracking-App
2. **Click "Settings"** tab
3. **Scroll down to "Pages"** section (left sidebar)
4. **Under "Source"**, select **"Deploy from a branch"**
5. **Select "gh-pages"** branch
6. **Click "Save"**

### Step 2: Upload Web Build to GitHub

Since we have authentication issues, let's upload manually:

1. **Go to your repository**: https://github.com/Gnana151/Tracking-App
2. **Click "uploading an existing file"**
3. **Upload the entire `dist` folder contents**:
   - `index.html`
   - `metadata.json`
   - `_expo/` folder
4. **Add commit message**: "Deploy web version to GitHub Pages"
5. **Click "Commit changes"**

### Step 3: Alternative - Use GitHub Actions (Recommended)

I'll create a GitHub Actions workflow that automatically builds and deploys your app:

1. **Create `.github/workflows/deploy.yml`** in your repository
2. **Upload the workflow file**
3. **GitHub Actions will automatically build and deploy**

## 📱 Your App Features

Once hosted, your app will have:
- ✅ **Login System** (admin/password)
- ✅ **Truck Type Selection** (8 different types)
- ✅ **Weight Input** with validation
- ✅ **Photo Capture** (file selection)
- ✅ **Data Storage** (local storage)
- ✅ **Job Tracking** with unique IDs
- ✅ **Responsive Design** (mobile-friendly)
- ✅ **Cross-Platform** (works on all devices)

## 🔧 GitHub Actions Workflow

Here's the workflow file you need to create:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main, gh-pages ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Expo CLI
      run: npm install -g @expo/cli

    - name: Build web version
      run: npx expo export --platform web

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/gh-pages'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 🎯 Quick Hosting Options

### Option 1: Manual Upload (Fastest)
1. Upload `dist` folder contents to your repository
2. Enable GitHub Pages in settings
3. Your app will be live in 5 minutes

### Option 2: GitHub Actions (Best)
1. Create the workflow file above
2. Push to repository
3. Automatic deployment on every update

### Option 3: Direct File Upload
1. Go to repository
2. Upload files via web interface
3. No authentication needed

## 📋 Files Ready for Upload

Your `dist` folder contains:
- `index.html` - Main web page
- `metadata.json` - App metadata
- `_expo/static/js/web/` - JavaScript bundle
- All necessary assets

## 🔍 Testing Your Hosted App

After deployment:
1. **Wait 5-10 minutes** for GitHub Pages to deploy
2. **Visit**: https://gnana151.github.io/Tracking-App/
3. **Test all features**:
   - Login with admin/password
   - Select truck types
   - Input weights
   - Upload photos
   - Save data

## 🛠️ Troubleshooting

### If the page doesn't load:
1. Check GitHub Pages settings
2. Verify gh-pages branch has content
3. Wait for deployment to complete

### If features don't work:
1. Check browser console for errors
2. Ensure all files are uploaded correctly
3. Test on different browsers

## 🎉 Success!

Once deployed, you can:
- **Share the URL** with anyone
- **Add to home screen** for app-like experience
- **Use on any device** (phone, tablet, computer)
- **Update easily** by pushing new changes

---

**Your app will be live at: https://gnana151.github.io/Tracking-App/**
