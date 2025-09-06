# Simple Mobile App 📱

A simple Hello World app that runs on both Android and iOS for free using React Native and Expo.

## 🚀 Quick Start (30 seconds)

```bash
# Clone and setup
git clone https://github.com/Gnana151/Tracking-App.git
cd Tracking-App
./setup.sh

# Start the app
npm start

# Scan QR code with Expo Go app on your phone
```

## Features

- ✅ Cross-platform (Android & iOS)
- ✅ Completely free to develop and test
- ✅ Interactive button with alert
- ✅ Modern, clean UI design
- ✅ Easy to set up and run
- ✅ Clean codebase (no large files committed to Git)

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **Expo Go app** on your phone:
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)

## Quick Start

### **Method 1: Using Setup Script (Recommended)**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Gnana151/Tracking-App.git
   cd Tracking-App
   ```

2. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

3. **Start the app:**
   ```bash
   npm start
   ```

4. **Test on your device:**
   - Open the Expo Go app on your phone
   - Scan the QR code that appears in your terminal/browser
   - The app will load on your device!

### **Method 2: Manual Setup**

1. **Clone and navigate to the repository:**
   ```bash
   git clone https://github.com/Gnana151/Tracking-App.git
   cd Tracking-App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Expo CLI globally:**
   ```bash
   npm install -g @expo/cli
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

## Alternative Testing Methods

### Android Emulator
```bash
npm run android
```
*Requires Android Studio and Android SDK setup*

### iOS Simulator (Mac only)
```bash
npm run ios
```
*Requires Xcode and iOS Simulator*

### Web Browser
```bash
npm run web
```
*Opens the app in your web browser*

## Project Structure

```
Tracking-App/
├── App.js              # Main app component
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
├── babel.config.js     # Babel configuration
├── setup.sh            # Automated setup script
├── Dockerfile          # Docker configuration (optional)
├── .nvmrc              # Node.js version specification
├── .gitignore          # Git ignore rules
└── README.md          # This file
```

## Available Scripts

```bash
# Setup environment (install dependencies)
npm run setup

# Start the development server
npm start

# Start for specific platforms
npm run android    # Android emulator
npm run ios        # iOS simulator (Mac only)
npm run web        # Web browser

# Clean environment (remove dependencies)
npm run clean

# Fresh start (clean + setup)
npm run fresh
```

## Customization

### Changing the App Name
Edit the `name` field in `app.json`:
```json
{
  "expo": {
    "name": "Your App Name"
  }
}
```

### Adding Icons
Replace the icon files in the `assets/` folder:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen (1242x2436)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)

### Modifying the UI
Edit `App.js` to change the text, colors, or layout. The app uses React Native's StyleSheet for styling.

## Virtual Environment & Dependency Management

This project uses a clean approach to dependency management:

- **No large files in Git** - `node_modules/` and `package-lock.json` are ignored
- **Easy setup** - Run `./setup.sh` or `npm run setup` to install dependencies
- **Version control** - `.nvmrc` ensures consistent Node.js version
- **Clean environment** - Dependencies are installed locally, not globally

### Environment Setup Options

1. **Setup Script (Recommended):**
   ```bash
   ./setup.sh
   ```

2. **npm Scripts:**
   ```bash
   npm run setup    # Install dependencies
   npm run clean    # Remove dependencies
   npm run fresh    # Clean + setup
   ```

3. **Docker (Complete Isolation):**
   ```bash
   docker build -t simple-mobile-app .
   docker run -p 8081:8081 simple-mobile-app
   ```

## Free Testing Options

### 1. Expo Go (Recommended - 100% Free)
- Install Expo Go on your physical device
- Scan QR code to test instantly
- No setup required, works immediately

### 2. Expo Snack (Online Testing)
- Visit [snack.expo.dev](https://snack.expo.dev)
- Copy and paste the App.js code
- Test directly in your browser

### 3. Web Version
- Run `npm run web`
- Test in any modern web browser
- Great for quick development

## Building for Production

### Free Options:
1. **Expo Build Service (EAS Build)** - Free tier available
2. **Expo Snack** - Share and test online
3. **Web deployment** - Deploy to any web hosting service

### Paid Options (if you need app store distribution):
- EAS Build for app store builds
- Expo Application Services (EAS)

## Troubleshooting

### Common Issues:

1. **"Expo CLI not found"**
   ```bash
   npm install -g @expo/cli
   # Or run the setup script
   ./setup.sh
   ```

2. **"Metro bundler not starting"**
   ```bash
   npx expo start --clear
   # Or clean and reinstall
   npm run fresh
   ```

3. **"Dependencies not found"**
   ```bash
   # Install dependencies
   npm run setup
   # Or use the setup script
   ./setup.sh
   ```

4. **QR code not working**
   - Make sure your phone and computer are on the same WiFi network
   - Try the "tunnel" option: `expo start --tunnel`

5. **App not loading on device**
   - Check that Expo Go is up to date
   - Restart the Expo development server
   - Try: `npm run fresh` then `npm start`

6. **Node.js version issues**
   - Use Node.js 18 or higher
   - If using nvm: `nvm use 18`
   - Check version: `node --version`

## Next Steps

Once you have the basic app running, you can:

1. Add more screens and navigation
2. Integrate with APIs
3. Add state management (Redux, Context API)
4. Implement native features (camera, location, etc.)
5. Add animations and gestures
6. Deploy to app stores

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Snack](https://snack.expo.dev/) - Online testing
- [Expo Go App](https://expo.dev/client) - Mobile testing

## Support

If you run into any issues:
1. Check the [Expo troubleshooting guide](https://docs.expo.dev/troubleshooting/)
2. Search [Expo forums](https://forums.expo.dev/)
3. Check [React Native troubleshooting](https://reactnative.dev/docs/troubleshooting)

Happy coding! 🚀
