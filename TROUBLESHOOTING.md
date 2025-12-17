# Troubleshooting Guide

## EMFILE: Too Many Open Files Error

This is a common macOS issue. Here are several solutions:

### Quick Fix (Temporary - Current Session Only)

Run this command before starting Expo:
```bash
ulimit -n 4096
npx expo start
```

Or use the provided startup script:
```bash
./start.sh
```

### Permanent Fix (Recommended)

#### Option 1: Update Shell Profile (Recommended)

Add this to your `~/.zshrc` or `~/.bash_profile`:

```bash
# Increase file descriptor limit for development
ulimit -n 4096
```

Then reload your shell:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

#### Option 2: System-wide Limit (Advanced)

1. Create or edit `/etc/launchd.conf`:
   ```bash
   sudo nano /etc/launchd.conf
   ```

2. Add this line:
   ```
   limit maxfiles 65536 200000
   ```

3. Restart your Mac (this requires a reboot)

#### Option 3: Install Watchman (Facebook's File Watcher)

Watchman is more efficient than the default file watcher:

```bash
# Install via Homebrew
brew install watchman

# Or via npm
npm install -g watchman
```

Watchman can handle many more files efficiently and is recommended for React Native/Expo development.

### Verify the Fix

Check your current limit:
```bash
ulimit -n
```

It should show 4096 or higher after applying the fix.

### Additional Optimizations

1. **Close unnecessary applications** - Each app uses file descriptors
2. **Restart your terminal** - After updating shell profile
3. **Clear Metro cache** - Use `npx expo start --clear`

### If Problem Persists

1. Restart your Mac
2. Install Watchman (see Option 3 above)
3. Close other development tools that watch files (VS Code extensions, etc.)
4. Consider using a development environment with fewer background processes


