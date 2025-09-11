# 📱 Truck Tracker APK Build & Sharing Guide

## 🚀 Quick APK Generation

### Method 1: Using EAS Build (Recommended)

1. **Create Expo Account** (if you don't have one):
   - Go to [expo.dev](https://expo.dev)
   - Sign up for a free account

2. **Login to EAS**:
   ```bash
   npx eas login
   ```

3. **Build APK**:
   ```bash
   # Build APK for testing
   npx eas build --platform android --profile apk
   
   # Or use preview profile
   npx eas build --platform android --profile preview
   ```

4. **Download APK**:
   - EAS will provide a download link
   - Download the APK file to your computer

### Method 2: Using Expo Development Build

1. **Start development server**:
   ```bash
   npx expo start
   ```

2. **Build development APK**:
   ```bash
   npx eas build --platform android --profile development
   ```

## 📤 Sharing the APK

### Option 1: Direct File Sharing
- **Email**: Attach APK to email
- **Cloud Storage**: Upload to Google Drive, Dropbox, OneDrive
- **File Transfer**: Use WeTransfer, SendAnywhere
- **USB**: Copy to USB drive

### Option 2: QR Code Sharing
1. Upload APK to cloud storage
2. Generate QR code with download link
3. Share QR code for easy download

### Option 3: GitHub Releases
1. Create GitHub repository
2. Upload APK to Releases section
3. Share repository link

## 📲 Installation Instructions for Recipients

### For Android Users:

1. **Enable Unknown Sources**:
   - Go to Settings > Security
   - Enable "Install from Unknown Sources" or "Unknown Apps"
   - Allow installation from the source you're using

2. **Download APK**:
   - Download the APK file from the link you provided
   - Save to Downloads folder

3. **Install APK**:
   - Open Downloads folder
   - Tap on the APK file
   - Follow installation prompts
   - Grant necessary permissions

4. **Launch App**:
   - Find "Truck Tracker" in app drawer
   - Tap to open
   - Login with: `admin` / `password`

## 🔧 Alternative: Web App Sharing

If APK building fails due to disk space:

### Build Web Version:
```bash
npx expo export --platform web
```

### Deploy to Free Hosting:
1. **Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**:
   - Upload `dist` folder to Netlify
   - Get public URL

3. **GitHub Pages**:
   - Push to GitHub repository
   - Enable GitHub Pages

## 📋 APK Features

Your APK will include:
- ✅ Login system (admin/password)
- ✅ Truck type selection
- ✅ Weight input
- ✅ Photo capture (camera/gallery)
- ✅ Data storage
- ✅ Job tracking
- ✅ Offline functionality

## 🛠️ Troubleshooting

### If EAS Build Fails:
1. Check disk space
2. Clear npm cache: `npm cache clean --force`
3. Try web version instead

### If APK Won't Install:
1. Check Android version compatibility
2. Enable Unknown Sources
3. Try different Android device

### If App Crashes:
1. Check device permissions
2. Ensure camera access is granted
3. Try on different device

## 📞 Support

For any issues:
1. Check console logs
2. Test on multiple devices
3. Verify all permissions are granted
4. Contact for technical support

## 🎯 Next Steps

1. **Build APK** using EAS
2. **Test on your device** first
3. **Share with testers**
4. **Gather feedback**
5. **Iterate and improve**
6. **Submit to app stores** when ready

---

**Note**: APK files are perfect for testing and sharing with a small group. For public distribution, consider submitting to Google Play Store or Apple App Store.
