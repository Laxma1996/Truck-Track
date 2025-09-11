# 🚛 Truck Tracker App

A modern React Native mobile application for truck logging and tracking, built with Expo. Track different truck types, record weights, capture photos, and manage job data efficiently.

## ✨ Features

- 🔐 **Secure Login System** - Simple authentication with demo credentials
- 🚛 **Truck Type Selection** - 8 different truck types (Flatbed, Box, Refrigerated, etc.)
- ⚖️ **Weight Recording** - Input and validate truck weights
- 📸 **Photo Capture** - Take photos or select from gallery
- 💾 **Data Storage** - Local storage using AsyncStorage
- 🆔 **Job Tracking** - Unique job IDs for each logging session
- 📱 **Cross-Platform** - Works on Android, iOS, and Web
- 🎨 **Modern UI** - Clean, responsive design with React Native Paper

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/truck-tracker.git
   cd truck-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on different platforms**:
   ```bash
   # Web
   npx expo start --web
   
   # Android
   npx expo start --android
   
   # iOS
   npx expo start --ios
   ```

## 📱 How to Use

### Login
- **Username**: `admin`
- **Password**: `password`

### Truck Logging
1. Select truck type from dropdown
2. Enter weight in kilograms
3. Take or select a photo
4. Click "Start Job" to save data

## 🛠️ Development

### Project Structure
```
truck-tracker/
├── App.js                 # Main app component
├── app.json              # Expo configuration
├── eas.json              # EAS build configuration
├── screens/
│   ├── LoginScreen.js    # Login interface
│   └── LoggingScreen.js  # Truck logging interface
├── utils/
│   └── storage.js        # Data storage utilities
├── web/
│   └── index.html        # Web entry point
└── assets/               # App assets
```

### Key Technologies
- **React Native** - Mobile app framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **React Native Paper** - UI component library
- **Expo Image Picker** - Camera/gallery access
- **AsyncStorage** - Local data storage

## 🌐 Web Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Build web version
npx expo export --platform web

# Deploy
vercel --prod
```

### Deploy to Netlify
1. Build web version: `npx expo export --platform web`
2. Upload `dist` folder to Netlify
3. Get public URL

## 📦 Mobile App Distribution

### Build APK (Android)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build --platform android --profile apk
```

### Build for App Stores
```bash
# Android (Google Play Store)
eas build --platform android --profile production

# iOS (Apple App Store)
eas build --platform ios --profile production
```

## 🔧 Configuration

### App Configuration (`app.json`)
- App name, version, and identifiers
- Platform-specific settings
- Permissions for camera and storage
- Icons and splash screens

### EAS Configuration (`eas.json`)
- Build profiles for different environments
- Android and iOS build settings
- Distribution configurations

## 📋 Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run setup      # Install dependencies
npm run clean      # Clean dependencies
npm run fresh      # Clean and reinstall
```

## 🧪 Testing

### Local Testing
1. Start development server: `npm start`
2. Scan QR code with Expo Go app
3. Test all features on different devices

### Web Testing
1. Run: `npx expo start --web`
2. Open browser to `http://localhost:19006`
3. Test responsive design

## 📱 Screenshots

### Login Screen
- Clean login interface
- Demo credentials display
- Feature highlights

### Truck Logging Screen
- Truck type selection
- Weight input
- Photo capture
- Job management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

## 🚀 Future Enhancements

- [ ] Database integration
- [ ] User authentication system
- [ ] Cloud data sync
- [ ] Push notifications
- [ ] Offline mode improvements
- [ ] Data export features
- [ ] Advanced reporting

## 📞 Contact

- **Developer**: Your Name
- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)

---

**Built with ❤️ using React Native and Expo**