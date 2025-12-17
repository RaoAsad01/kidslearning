# Fix 404 Error - Development Server

If you're getting a 404 error from the development server, follow these steps:

## Quick Fix

1. **Stop all Expo/Metro processes:**
   ```bash
   pkill -f "expo|metro"
   ```

2. **Clear cache and restart:**
   ```bash
   npx expo start --clear
   ```

3. **If that doesn't work, fully reset:**
   ```bash
   # Kill processes
   pkill -f "expo|metro"
   
   # Clear caches
   rm -rf .expo node_modules/.cache
   
   # Restart with cleared cache
   npx expo start --clear
   ```

## Common Causes

### 1. Port Conflict
Another process might be using port 8081:
```bash
# Check what's using port 8081
lsof -ti:8081

# Kill it
kill -9 $(lsof -ti:8081)
```

### 2. Stale Metro Bundler
The Metro bundler might be serving old/corrupted files:
```bash
# Stop server, clear cache, restart
npx expo start --clear
```

### 3. Wrong Entry Point
Make sure `package.json` has the correct main entry:
```json
{
  "main": "node_modules/expo/AppEntry.js"
}
```

### 4. Network Issues
If using Expo Go:
- Make sure your device and computer are on the same WiFi network
- Try using tunnel mode: `npx expo start --tunnel`
- Or use LAN mode: `npx expo start --lan`

### 5. App Entry File Missing
Ensure `App.js` exists in the root directory.

## Full Reset

If nothing works, do a complete reset:

```bash
# 1. Stop everything
pkill -f "expo|metro"
kill -9 $(lsof -ti:8081) 2>/dev/null || true

# 2. Clear all caches
rm -rf .expo
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# 3. Restart
npx expo start --clear
```

## Alternative: Use Different Port

If port 8081 is permanently occupied:

```bash
# Start on different port
npx expo start --port 8082
```

## Check Server Status

After starting, you should see:
- QR code in terminal
- Metro bundler running on port 8081
- No 404 errors when accessing the bundle URL

## Still Not Working?

1. Check Expo CLI version: `npx expo --version`
2. Update Expo: `npm install -g expo-cli@latest`
3. Check Node.js version: `node --version` (should be 14+)
4. Try reinstalling dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```


