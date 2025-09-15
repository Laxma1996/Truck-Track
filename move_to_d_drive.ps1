# PowerShell script to move Tracking-App to D drive
Write-Host "Moving Tracking-App to D drive..." -ForegroundColor Green

# Create directory on D drive
New-Item -ItemType Directory -Path "D:\Tracking-App-Workspace" -Force | Out-Null

# Copy all files to D drive
Copy-Item -Path "C:\Users\Nishu\Tracking-App\*" -Destination "D:\Tracking-App-Workspace\" -Recurse -Force

Write-Host "Copy completed! Project moved to D:\Tracking-App-Workspace" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd D:\Tracking-App-Workspace" -ForegroundColor Cyan
Write-Host "2. npm install" -ForegroundColor Cyan
Write-Host "3. npm install -g @expo/eas-cli" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
