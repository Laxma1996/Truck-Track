Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Truck Tracker - Mobile App Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking EAS CLI installation..." -ForegroundColor Yellow
try {
    $version = eas --version
    Write-Host "EAS CLI version: $version" -ForegroundColor Green
} catch {
    Write-Host "EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g eas-cli
}

Write-Host ""
Write-Host "Checking login status..." -ForegroundColor Yellow
try {
    $user = eas whoami
    Write-Host "Logged in as: $user" -ForegroundColor Green
} catch {
    Write-Host "Please login to Expo first:" -ForegroundColor Red
    Write-Host "Run: eas login" -ForegroundColor Red
    Write-Host "Then run this script again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Android APK..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
eas build --platform android --profile android-apk --non-interactive

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building iOS App..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
eas build --platform ios --profile ios-app --non-interactive

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app files will be available for download from:" -ForegroundColor Yellow
Write-Host "https://expo.dev/accounts/[your-username]/projects/truck-tracker/builds" -ForegroundColor Blue
Write-Host ""
Write-Host "APK files can be installed directly on Android devices." -ForegroundColor Green
Write-Host "iOS files need to be distributed through TestFlight or App Store." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
