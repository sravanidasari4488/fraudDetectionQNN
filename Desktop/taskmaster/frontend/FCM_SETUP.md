# Firebase Cloud Messaging Setup Guide

## 📋 Prerequisites

1. Firebase project created with Cloud Messaging enabled
2. Android app registered in Firebase Console with package name: `com.onlyclick.serviceprovider`

## 🚀 Setup Steps

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Generate Native Folders

Since you're using Expo development builds, you need to generate the native `android` folder:

```bash
npx expo prebuild --clean
```

This command will:
- Create the `android/` folder
- Set up native Android project structure
- Configure Expo modules

**Note:** The `android` folder will be created in your `frontend` directory after running this command.

### Step 3: Get google-services.json from Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ > **Project Settings**
4. Scroll down to **Your apps** section
5. Find your Android app (or add one if needed)
   - Package name: `com.onlyclick.serviceprovider`
   - App nickname: TaskMaster (or any name)
6. Click **Download google-services.json**

### Step 4: Place google-services.json

After running `expo prebuild`, place the downloaded file:

**Location:** `frontend/android/app/google-services.json`

**Important:** 
- The `android` folder must exist first (created in Step 2)
- The file must be named exactly `google-services.json`
- Place it in `android/app/` directory

### Step 5: Rebuild Development Build

After adding `google-services.json`, rebuild your app:

```bash
npx expo run:android
```

Or if using EAS Build:

```bash
eas build --profile development --platform android
```

## ✅ Verification

After rebuilding, check the logs:

```bash
npx react-native log-android
```

Look for:
- ✅ "Firebase Messaging initialized successfully"
- ✅ "FCM Token retrieved: ..."

## 🔧 Troubleshooting

### Issue: "android folder not found"
**Solution:** Run `npx expo prebuild --clean` first

### Issue: "Firebase initialization error"
**Solution:** 
- Verify `google-services.json` is in `android/app/` directory
- Check package name matches in `google-services.json` and `app.config.js`
- Rebuild after adding the file

### Issue: "Permission denied"
**Solution:** 
- Check AndroidManifest.xml has POST_NOTIFICATIONS permission (should be auto-added)
- Request permission at runtime (handled automatically by the code)

## 📝 Important Notes

1. **Don't commit `google-services.json`** - Add to `.gitignore`:
   ```
   android/app/google-services.json
   ```

2. **Rebuild required** - After adding `google-services.json`, you must rebuild the app

3. **Development build only** - FCM won't work with Expo Go, only with development builds

4. **Backend endpoint** - Update the token save endpoint in `notificationService.ts` (line ~121) to match your backend API

## 🎯 Next Steps

1. Run `npx expo prebuild --clean`
2. Add `google-services.json` to `android/app/`
3. Run `npx expo run:android`
4. Test notifications from Firebase Console

