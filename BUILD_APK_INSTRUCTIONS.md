# Building Android APK with EAS

## Quick Start

Run these commands in your terminal:

```bash
# 1. Initialize EAS project (if not already done)
# This will prompt you to create a project - answer 'y' or 'yes'
eas init

# 2. Build the Android APK (Preview)
eas build --platform android --profile preview
```

## What happens:

1. **EAS Init**: Creates an EAS project linked to your Expo account
2. **EAS Build**: Starts a cloud build that will:
   - Create an Android APK
   - Use the "preview" profile (configured in `eas.json`)
   - Build type: APK (installable on any Android device)

## Build Status

- You'll see a build URL in the terminal
- Check progress at: https://expo.dev/accounts/asad_ahmad/projects/kids-learning-app/builds
- You'll receive an email when the build completes
- Download the APK from the build page or use the provided link

## Alternative: Use the script

If you prefer, you can run:
```bash
./build-apk.sh
```

But you'll still need to answer the interactive prompts when they appear.

## Notes

- The build runs on Expo's servers (cloud build)
- Build time: Usually 10-20 minutes
- The APK will be available for download once complete
- No Android SDK or local build tools needed!




