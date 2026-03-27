#!/bin/bash

# Script to build Android APK using EAS

echo "🚀 Starting EAS build for Android APK (Preview)..."
echo ""

# Check if EAS is logged in
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to EAS. Please run: eas login"
    exit 1
fi

# Initialize EAS project if not already configured
if ! grep -q '"projectId"' app.json 2>/dev/null; then
    echo "📦 Initializing EAS project..."
    eas init
fi

# Build the APK
echo ""
echo "🔨 Building Android APK (Preview profile)..."
eas build --platform android --profile preview

echo ""
echo "✅ Build process started! Check the EAS dashboard for progress."
echo "📱 You'll receive a notification when the build is complete."




