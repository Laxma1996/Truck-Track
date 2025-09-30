@echo off
echo ========================================
echo    Truck Tracker - Mobile App Builder
echo ========================================
echo.

echo Checking EAS CLI installation...
eas --version
if %errorlevel% neq 0 (
    echo EAS CLI not found. Installing...
    npm install -g eas-cli
)

echo.
echo Checking login status...
eas whoami
if %errorlevel% neq 0 (
    echo Please login to Expo first:
    echo Run: eas login
    echo Then run this script again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Building Android APK...
echo ========================================
echo.
eas build --platform android --profile android-apk --non-interactive

echo.
echo ========================================
echo Building iOS App...
echo ========================================
echo.
eas build --platform ios --profile ios-app --non-interactive

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Your app files will be available for download from:
echo https://expo.dev/accounts/[your-username]/projects/truck-tracker/builds
echo.
echo APK files can be installed directly on Android devices.
echo iOS files need to be distributed through TestFlight or App Store.
echo.
pause
