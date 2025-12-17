// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Explicitly set project root to avoid path resolution issues
const projectRoot = __dirname;
config.projectRoot = projectRoot;
config.watchFolders = [projectRoot];

// Ensure correct path resolution
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts],
  platforms: ['ios', 'android', 'native', 'web'],
};

module.exports = config;


