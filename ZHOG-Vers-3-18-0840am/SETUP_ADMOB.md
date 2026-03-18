# Android Build & AdMob Setup Guide

## Quick Start (Development)

```bash
cd ZombieHOG
npm install
npx cap add android
npx cap sync
npx cap open android
```

Then in Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**

---

## AdMob Setup for Play Store

### Step 1: Create AdMob Account
1. Go to https://admob.google.com/
2. Sign in with your Google account
3. Accept the terms and conditions

### Step 2: Create an App in AdMob
1. Click **Apps** in the sidebar
2. Click **Add App**
3. Select **Android**
4. If not published yet, select "No" for "Is the app listed on a supported app store?"
5. Enter app name: "Dead Zone: Escape"
6. Click **Add App**
7. **Copy your App ID** (looks like: `ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`)

### Step 3: Create a Rewarded Ad Unit
1. In your app, click **Ad units**
2. Click **Add ad unit**
3. Select **Rewarded**
4. Name it: "Hint Reward"
5. Click **Create ad unit**
6. **Copy your Ad Unit ID** (looks like: `ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY`)

### Step 4: Update Your Code

**File: `admob.js`** - Update these lines:
```javascript
config: {
  appId: 'ca-app-pub-YOUR_APP_ID_HERE',
  rewardedAdUnitId: 'ca-app-pub-YOUR_AD_UNIT_ID_HERE',
  testMode: false,  // Change to false for production!
}
```

**File: `capacitor.config.json`** - Update this:
```json
"AdMob": {
  "appIdAndroid": "ca-app-pub-YOUR_APP_ID_HERE",
  "initializeForTesting": false
}
```

**File: `android/app/src/main/AndroidManifest.xml`** - Add inside `<application>`:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-YOUR_APP_ID_HERE"/>
```

### Step 5: Rebuild
```bash
npx cap sync
npx cap open android
# Build > Generate Signed Bundle / APK
```

---

## Play Store Checklist

Before uploading to Play Store:

- [ ] Replace all test Ad IDs with real ones
- [ ] Set `testMode: false` in admob.js
- [ ] Set `initializeForTesting: false` in capacitor.config.json
- [ ] Generate a signed release APK/AAB
- [ ] Create app screenshots (phone + tablet)
- [ ] Write app description
- [ ] Create privacy policy (required for apps with ads)
- [ ] Set content rating
- [ ] Set pricing (free with ads)

---

## Test IDs (for Development)

These are Google's official test IDs - safe to use during development:

- **App ID**: `ca-app-pub-3940256099942544~3347511713`
- **Rewarded Ad**: `ca-app-pub-3940256099942544/5224354917`

?? **Never use test IDs in production!** Your account may be suspended.

---

## Troubleshooting

### Ads not showing?
1. Make sure you're using real IDs (not test IDs) for production
2. Wait 24-48 hours after creating ad units
3. Check Android Logcat for AdMob errors

### App crashes on ad load?
1. Verify the App ID in AndroidManifest.xml matches AdMob
2. Run `npx cap sync` after config changes

### Need help?
- AdMob Help: https://support.google.com/admob/
- Capacitor AdMob: https://github.com/capacitor-community/admob
