# Hello World Mobile App 📱

A simple Hello World app that runs on both Android and iOS for free using React Native and Expo.

## Features

- ✅ Cross-platform (Android & iOS)
- ✅ Completely free to develop and test
- ✅ Interactive button with alert
- ✅ Modern, clean UI design
- ✅ Easy to set up and run

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
2. **Expo CLI** - Install globally with: `npm install -g @expo/cli`
3. **Expo Go app** on your phone:
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)

## Quick Start

1. **Navigate to the app directory:**
   ```bash
   cd hello-world-mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Test on your device:**
   - Open the Expo Go app on your phone
   - Scan the QR code that appears in your terminal/browser
   - The app will load on your device!

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
hello-world-mobile/
├── App.js              # Main app component
├── app.json            # Expo configuration
├── package.json        # Dependencies and scripts
├── babel.config.js     # Babel configuration
└── README.md          # This file
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
   ```

2. **"Metro bundler not starting"**
   ```bash
   npx expo start --clear
   ```

3. **QR code not working**
   - Make sure your phone and computer are on the same WiFi network
   - Try the "tunnel" option: `expo start --tunnel`

4. **App not loading on device**
   - Check that Expo Go is up to date
   - Restart the Expo development server

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
