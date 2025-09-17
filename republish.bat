@echo off
echo Starting republish process...

echo Step 1: Switch to main branch
git checkout main

echo Step 2: Build the app
npx expo export --platform web

echo Step 2.1: Fix script paths for GitHub Pages
powershell -Command "(Get-Content dist\index.html) -replace 'src=\"/_expo/', 'src=\"./_expo/' | Set-Content dist\index.html"

echo Step 3: Copy built files
xcopy /E /Y dist\* .

echo Step 4: Add all changes
git add .

echo Step 5: Commit changes
git commit -m "Republish: Fix landing page and update deployment"

echo Step 6: Push to main
git push origin main

echo Step 7: Switch to gh-pages
git checkout gh-pages

echo Step 8: Merge main into gh-pages
git merge main

echo Step 9: Push to gh-pages
git push origin gh-pages

echo Step 10: Switch back to main
git checkout main

echo Republish complete! Check https://laxma1996.github.io/Truck-Track/
pause
