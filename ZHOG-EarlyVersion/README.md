# Dead Zone: Escape ??

A zombie survival hidden object game. Find supplies, manage your backpack, and escape to the safe zone!

## ?? Story

The zombie outbreak started three months ago. You've been hiding in your house, but supplies are running out. Now you must venture through 10 dangerous locations to reach the military safe zone.

**Levels:**
1. Your Home - Search for supplies before leaving
2. The Neighborhood - Navigate zombie-infested streets  
3. Dark Woods - Find your scattered supplies after an ambush
4. Abandoned Manor - Shelter for the night
5. The Basement - Something lurks below...
6. Upstairs - Clear the upper floors
7. Haunted Streets - Push through the city
8. The School - Raid the cafeteria
9. The Hospital - The most dangerous location
10. The Safe Zone - Almost there!

## ?? How to Play

### Desktop (Browser)
```bash
# Option 1: Use Python server
cd ZombieHOG
python -m http.server 5500
# Open http://localhost:5500

# Option 2: Use npm
npm install
npm start
```

### Build for Android
```bash
npm install
npx cap add android
npx cap sync
npx cap open android
# Build APK in Android Studio
```

## ?? Project Structure

```
ZombieHOG/
??? index.html          # Main page
??? game.js             # Game logic
??? styles.css          # Styles
??? package.json        # npm config
??? capacitor.config.json
??? manifest.json       # PWA manifest
??? assets/
    ??? icons/          # Item icons
    ?   ??? WeaponObjects/
    ?   ??? FoodObjects/
    ?   ??? WaterObjects/
    ?   ??? RandomObjects/
    ??? levels/         # Level backgrounds
    ??? cutscenes/      # Story images
    ??? levels.json     # Level definitions
```

## ?? Features

- ? 10 story-driven levels
- ? Cutscenes between levels
- ? Backpack inventory system
- ? Item categories (Weapons, Food, Water, Supplies)
- ? Encounters that require specific items
- ? Touch support for mobile
- ? Hint system with ad support
- ? Save/load progress
- ? Multiple endings

## ?? Requirements

- **Desktop**: Any modern browser (Chrome, Firefox, Edge)
- **Android Build**: 
  - Node.js 18+
  - Android Studio
  - JDK 17

## ?? License

MIT
