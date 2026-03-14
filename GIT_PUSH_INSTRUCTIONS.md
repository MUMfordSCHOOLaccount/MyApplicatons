# Git Cleanup and Push Instructions

## Problem
Git keeps restoring `bin/` and `obj/` folders because they were previously tracked in the repository.

## Solution - Run These Commands

### Step 1: Run the cleanup script
```cmd
cd E:\GitHub\MyApplicatons
cleanup_git.bat
```

This script will:
- Delete bin/obj folders from RTTFinal and ZHOGFinal
- Remove them from Git tracking
- Clean up old tracked folders

### Step 2: Manual Git Commands (Alternative)

If the batch file doesn't work, run these PowerShell commands:

```powershell
cd E:\GitHub\MyApplicatons

# Remove build folders physically
Remove-Item RTTFinal\bin -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item RTTFinal\obj -Recurse -Force -ErrorAction SilentlyContinue

# Tell Git to stop tracking them (even if they don't exist now)
git rm -r --cached RTTFinal/bin --ignore-unmatch
git rm -r --cached RTTFinal/obj --ignore-unmatch
git rm -r --cached Rick-Tac-Toe/bin --ignore-unmatch
git rm -r --cached Rick-Tac-Toe/obj --ignore-unmatch
git rm -r --cached Rick-Tac-Toe/.vs --ignore-unmatch

# For ZombieHOG
git rm -r --cached ZombieHOG/node_modules --ignore-unmatch
git rm -r --cached ZombieHOG/.idea --ignore-unmatch

# Stage the .gitignore files
git add .gitignore
git add RTTFinal/.gitignore
git add ZHOGFinal/.gitignore

# Stage the new clean folders
git add RTTFinal/
git add ZHOGFinal/

# Commit
git commit -m "Add clean game packages, remove build artifacts from tracking"

# Push
git push origin main
```

### Step 3: Verify Clean Status

After committing, verify no build artifacts are staged:
```powershell
git status
```

You should NOT see:
- bin/
- obj/
- node_modules/
- .vs/
- .idea/

## What's Been Done

✅ Created `.gitignore` in root directory (E:\GitHub\MyApplicatons)
✅ Updated `.gitignore` in RTTFinal with comprehensive rules
✅ `.gitignore` already exists in ZHOGFinal
✅ Created `cleanup_git.bat` script to automate the process
✅ Removed bin/obj folders from RTTFinal

## Files Ready to Commit

- RTTFinal/ (clean, no build artifacts)
- ZHOGFinal/ (clean, no node_modules)
- .gitignore (root level)
- GIT_VERIFICATION_REPORT.md
- cleanup_git.bat

## Optional: Remove Old Folders

After successfully pushing the new folders, you can delete:
- Rick-Tac-Toe/ (old version)
- ZombieHOG/ (old version)  
- NewGameImages/ (images copied to ZHOGFinal)

```powershell
git rm -r Rick-Tac-Toe
git rm -r ZombieHOG
git rm -r NewGameImages
git commit -m "Remove old project folders, keeping only final versions"
git push origin main
```

---

**Note:** The .gitignore files will prevent bin/obj from being committed in the future, but you must remove them from Git's tracking first using `git rm --cached`.
