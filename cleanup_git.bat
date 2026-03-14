@echo off
echo Cleaning up Git tracking for build artifacts...
cd /d E:\GitHub\MyApplicatons

REM Remove bin/obj from RTTFinal if they exist
if exist RTTFinal\bin rd /s /q RTTFinal\bin
if exist RTTFinal\obj rd /s /q RTTFinal\obj

REM Remove bin/obj from ZHOGFinal if they exist
if exist ZHOGFinal\bin rd /s /q ZHOGFinal\bin
if exist ZHOGFinal\obj rd /s /q ZHOGFinal\obj

REM Untrack these folders from Git (ignore errors if not tracked)
git rm -r --cached RTTFinal/bin 2>nul
git rm -r --cached RTTFinal/obj 2>nul
git rm -r --cached ZHOGFinal/node_modules 2>nul
git rm -r --cached ZHOGFinal/.idea 2>nul

REM Also remove from old folders if they're still being tracked
git rm -r --cached Rick-Tac-Toe/bin 2>nul
git rm -r --cached Rick-Tac-Toe/obj 2>nul
git rm -r --cached Rick-Tac-Toe/.vs 2>nul
git rm -r --cached ZombieHOG/node_modules 2>nul
git rm -r --cached ZombieHOG/.idea 2>nul

echo.
echo Done! Now you can stage and commit:
echo   git add RTTFinal/ ZHOGFinal/ .gitignore
echo   git commit -m "Add clean game packages, remove build artifacts"
echo   git push origin main
echo.
pause
