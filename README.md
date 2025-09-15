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

## 🚀 Live Demo

**Web Version**: [https://gnana151.github.io/truck-tracker/](https://gnana151.github.io/truck-tracker/)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Gnana151/truck-tracker.git
   cd truck-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on different platforms**:
   ```bash
   # Web
   npm run web
   
   # Android
   npm run android
   
   # iOS
   npm run ios
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

## 🛠️ Project Structure

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
└── dist/                 # Built web version
```

## 🌐 Web Deployment

This app is automatically deployed to GitHub Pages using GitHub Actions. The web version is available at:
**https://gnana151.github.io/truck-tracker/**

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

## 🔧 Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run setup      # Install dependencies
npm run clean      # Clean dependencies
npm run fresh      # Clean and reinstall
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

---

**Built with ❤️ using React Native and Expo**