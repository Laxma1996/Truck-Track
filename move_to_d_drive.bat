@echo off
echo Moving Tracking-App to D drive...

REM Create directory on D drive
mkdir "D:\Tracking-App-Workspace" 2>nul

REM Copy all files to D drive
xcopy "C:\Users\Nishu\Tracking-App\*" "D:\Tracking-App-Workspace\" /E /I /H /Y

echo.
echo Copy completed! Project moved to D:\Tracking-App-Workspace
echo.
echo Next steps:
echo 1. cd D:\Tracking-App-Workspace
echo 2. npm install
echo 3. npm install -g @expo/eas-cli
echo.
pause
