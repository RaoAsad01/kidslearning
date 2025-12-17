# Quick Start Guide 🚀

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- Expo Go app on your phone (iOS/Android) OR iOS Simulator / Android Emulator

## Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   ```
   
   Or use Expo CLI directly:
   ```bash
   npx expo start
   ```

3. **Run on your device/emulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app (iOS/Android)

## First Run

1. The app will open with the **Home** screen
2. Browse videos, learning modules, and downloads
3. Set up parental controls in **Settings** tab

## Testing Features

### Videos
- Navigate to **Videos** tab
- Browse different categories (Funny, Cartoons, Poems, Cocomelon)
- Tap any video to play
- Download videos for offline viewing

### Learning
- Go to **Learn** tab
- Select a learning category (ABC, 123, Urdu, etc.)
- Interact with learning content

### Downloads
- Download videos from the Videos section
- View all downloaded videos in **Downloads** tab
- Play videos offline

### Parental Controls
1. Open **Settings** tab
2. Set a 4-digit PIN
3. Configure daily time limits (optional)
4. Monitor usage

## Troubleshooting

### Issue: App won't start
- Make sure all dependencies are installed: `npm install`
- Clear cache: `npx expo start -c`
- Check Node.js version: `node --version` (should be 14+)

### Issue: Fonts not loading
- Fonts are optional - app works with system fonts
- To add custom fonts, place them in `assets/fonts/` directory

### Issue: Videos not playing
- Check internet connection for online videos
- Ensure video URLs are accessible
- For offline videos, make sure they're downloaded first

### Issue: Downloads not working
- Check device storage permissions
- Ensure sufficient storage space
- Verify FileSystem permissions in app.json

## Building for Production

### Android
```bash
npx expo build:android
```

### iOS
```bash
npx expo build:ios
```

Or use EAS Build:
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

## Configuration

### API Endpoints
Update `src/services/videoService.js` to use your API:
```javascript
const API_BASE_URL = 'https://your-api.com/api/videos';
```

### App Info
Edit `app.json` to customize:
- App name
- Package identifier
- Icons and splash screen

## Next Steps

1. Replace mock data with real API integration
2. Add your video content URLs
3. Customize colors and theme in `src/theme/colors.js`
4. Add app icons and splash screens
5. Test on real devices
6. Set up content moderation system

Enjoy building! 🎉


