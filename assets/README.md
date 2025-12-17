
# Asset Creation Instructions

Since Expo requires actual PNG image files, you have two options:

## Option 1: Quick Placeholder (Recommended for Testing)
Download or create simple placeholder images:
- icon.png (1024x1024) - App icon
- splash.png (1242x2436) - Splash screen
- adaptive-icon.png (1024x1024) - Android icon
- favicon.png (48x48) - Web favicon

## Option 2: Use Online Tools
1. Go to https://www.figma.com or https://www.canva.com
2. Create simple colored squares with text/emoji
3. Export as PNG with correct dimensions
4. Place in the assets/ folder

## Option 3: Use Expo Asset Generator
Run: npx expo-asset-generator

## Option 4: Temporary Fix
The app.json has been updated to work without these files for now.
You can add proper assets later before building for production.
