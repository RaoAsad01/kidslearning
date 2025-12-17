# Debug Guide - App Stuck on Splash Screen

## Quick Checks

1. **Check Console Logs**
   - Look for these messages:
     - "App: Starting initialization..."
     - "App: Initialization complete"
     - "App: Splash screen hidden"
     - "✅ Navigation ready"

2. **Check for Red Screen**
   - If you see a red error screen, note the error message
   - Common errors:
     - Component import errors
     - Missing dependencies
     - Context errors

3. **Test with Simple App**
   - Temporarily rename `App.js` to `App.original.js`
   - Rename `App.test.js` to `App.js`
   - Reload app - should show green success message
   - If this works, issue is in main App.js

## Common Issues

### 1. ParentalControlContext Blocking
The context might be blocking render. Check if `isReady` is set.

### 2. Navigation Error
NavigationContainer might fail. Check navigation logs.

### 3. Screen Component Error
One of the screen components might have an error. Try removing screens one by one.

### 4. Theme/Paper Provider Error
React Native Paper theme might be incompatible. Try removing PaperProvider temporarily.

## Testing Steps

1. **Minimal Test** (rename files):
   ```bash
   mv App.js App.original.js
   mv App.test.js App.js
   # Reload app
   ```

2. **Without Context**:
   Comment out `<ParentalControlProvider>` wrapper

3. **Without Paper**:
   Comment out `<PaperProvider>` wrapper

4. **Simple Navigation**:
   Replace MainTabs with a simple View/Text

## Get Logs

In Expo terminal, look for:
- Console.log outputs
- Error messages
- Stack traces

Or check device logs:
- iOS: Xcode console
- Android: `adb logcat | grep -i "error\|exception"`


