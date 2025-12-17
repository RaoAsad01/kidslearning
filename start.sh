#!/bin/bash
# Ensure we're in the correct directory
cd "$(dirname "$0")" || exit 1

# Increase file descriptor limit for Expo/Metro
ulimit -n 4096

# Clear Metro cache
echo "Clearing Metro cache..."
rm -rf .expo node_modules/.cache .metro 2>/dev/null

# Start Expo with clear cache
echo "Starting Expo from: $(pwd)"
npx expo start --clear


