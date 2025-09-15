@echo off
echo ========================================
echo    TRUCK TRACKER - COMPLETE SETUP
echo ========================================
echo.

echo Step 1: Creating D drive workspace...
mkdir "D:\Tracking-App-Workspace" 2>nul

echo Step 2: Copying project to D drive...
xcopy "C:\Users\Nishu\Tracking-App\*" "D:\Tracking-App-Workspace\" /E /I /H /Y

echo Step 3: Cleaning up C drive...
cd /d "C:\Users\Nishu\Tracking-App"
if exist "node_modules" rmdir /s /q "node_modules"
if exist "dist" rmdir /s /q "dist"
if exist ".git" rmdir /s /q ".git"

echo Step 4: Setting up D drive workspace...
cd /d "D:\Tracking-App-Workspace"
call npm install
call npm install -g @expo/eas-cli

echo.
echo ========================================
echo    SETUP COMPLETED!
echo ========================================
echo.
echo Your project is now on D drive: D:\Tracking-App-Workspace
echo.
echo Next steps:
echo 1. cd D:\Tracking-App-Workspace
echo 2. eas login
echo 3. eas build:configure
echo 4. eas build --platform android --profile preview
echo.
pause
