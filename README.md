# Kids Learning App 🎓👶

A comprehensive, kid-safe educational app built with React Native and Expo. Features videos, interactive learning modules, offline capabilities, and parental controls.

## Features

### 🎬 Video Content
- **Funny Kids Videos** - Safe, entertaining content for kids
- **Cartoons** - Age-appropriate cartoon shows
- **Poems & Songs** - Educational rhymes (ABC, 123, Urdu rhymes)
- **Cocomelon-style Content** - Popular kids' entertainment
- **Kid-Safe Filtering** - All content is curated for children

### 📚 Learning Modules
- **ABC** - English alphabet with interactive learning
- **123** - Numbers and counting
- **Urdu Alif Bay Pay** - اردو الف بے پے learning
- **Shapes** - Geometric shapes recognition
- **Colors** - Color learning with examples
- **Animals** - Animal names and sounds
- **Fruits & Vegetables** - Healthy food learning
- **Phonics** - Sound and letter association

### 💾 Offline Features
- **Download Videos** - Save videos for offline viewing
- **Downloads Section** - Manage downloaded content
- **Local Storage** - Efficient file management using Expo FileSystem

### 🔒 Parental Controls
- **PIN Lock** - Secure settings with 4-digit PIN
- **Daily Time Limits** - Set usage limits (e.g., 3 hours/day)
- **Usage Tracking** - Monitor daily app usage
- **Reset Options** - Reset usage counters

### 🎨 Modern UI/UX
- Beautiful, kid-friendly design
- Smooth animations and transitions
- Colorful, engaging interface
- Responsive layout for all devices

## Installation

1. **Clone the repository**
   ```bash
   cd "KidsApp"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install fonts (Optional)**
   - Place Poppins font files in `assets/fonts/` directory:
     - Poppins-Bold.ttf
     - Poppins-Regular.ttf
     - Poppins-SemiBold.ttf
   - Or modify `App.js` to use system fonts

4. **Create assets directory**
   ```bash
   mkdir -p assets/fonts
   mkdir -p assets/images
   ```

5. **Run the app**
   ```bash
   npm start
   ```
   Then press:
   - `i` for iOS simulator
   - `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
KidsApp/
├── App.js                 # Main app entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── src/
│   ├── components/       # Reusable components
│   │   ├── VideoCard.js
│   │   └── TabIcon.js
│   ├── context/          # React Context providers
│   │   └── ParentalControlContext.js
│   ├── screens/          # App screens
│   │   ├── HomeScreen.js
│   │   ├── VideosScreen.js
│   │   ├── VideoPlayerScreen.js
│   │   ├── LearningScreen.js
│   │   ├── LearningDetailScreen.js
│   │   ├── DownloadsScreen.js
│   │   ├── SettingsScreen.js
│   │   └── PinLockScreen.js
│   ├── services/         # Business logic
│   │   ├── videoService.js
│   │   └── learningService.js
│   └── theme/            # Theme and colors
│       ├── colors.js
│       └── theme.js
└── assets/               # Images, fonts, etc.
```

## Configuration

### API Integration

The app currently uses mock data. To integrate with a real API:

1. Update `src/services/videoService.js`
2. Replace `API_BASE_URL` with your endpoint
3. Modify `getVideosByCategory()` to fetch from your API

Example:
```javascript
async getVideosByCategory(category) {
  const response = await fetch(`${API_BASE_URL}/videos?category=${category}`);
  const data = await response.json();
  return data.videos;
}
```

### Video Sources

Update video URLs in `videoService.js` to point to your content:
- Ensure all videos are kid-safe
- Support both online streaming and download
- Consider using CDN for better performance

## Key Technologies

- **React Native** - Mobile app framework
- **Expo** - Development platform and tooling
- **React Navigation** - Navigation library
- **Expo AV** - Video playback
- **Expo FileSystem** - File storage and downloads
- **AsyncStorage** - Data persistence
- **Expo SecureStore** - Secure PIN storage
- **React Native Paper** - UI components
- **Expo Linear Gradient** - Gradient backgrounds

## Parental Controls Setup

1. Navigate to **Settings** tab
2. Set a 4-digit PIN under "PIN Lock"
3. Configure "Daily Time Limit" (optional)
4. App will lock after time limit is reached
5. Settings require PIN to access after setup

## Offline Usage

1. Browse videos in the **Videos** tab
2. Tap the download button (⬇) on any video card
3. Videos are saved to device storage
4. Access offline videos in the **Downloads** tab
5. Play videos without internet connection

## Safety Features

- ✅ No adult content
- ✅ Kid-safe UI design
- ✅ Parental control PIN protection
- ✅ Usage time limits
- ✅ Secure storage of sensitive data

## Future Enhancements

- [ ] Quiz games for learning modules
- [ ] Progress tracking for learning
- [ ] Multi-language support
- [ ] Custom video playlists
- [ ] Parent dashboard
- [ ] Cloud sync for downloads
- [ ] Push notifications for new content

## Development Notes

- Mock data is used for demonstration
- Replace with real API endpoints for production
- Add proper error handling for network requests
- Implement proper video encoding for mobile
- Add analytics tracking
- Set up content moderation system

## License

This project is created for educational purposes.

## Support

For issues or questions, please contact the development team.

---

**Made with ❤️ for kids' learning and entertainment**


# kidslearning
