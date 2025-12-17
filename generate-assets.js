const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Primary color for the app
const primaryColor = '#FF6B9D';
const backgroundColor = '#FF6B9D';

// Create a simple colored image with emoji/text
async function createImage(width, height, filename, emoji = '👶') {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${primaryColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 3}" 
            fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${emoji}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(assetsDir, filename));

  console.log(`✓ Created ${filename} (${width}x${height})`);
}

async function generateAssets() {
  console.log('Generating placeholder assets...\n');

  try {
    // App icon (1024x1024)
    await createImage(1024, 1024, 'icon.png', '👶');

    // Splash screen (1242x2436 - iPhone X size)
    await createImage(1242, 2436, 'splash.png', '🎓');

    // Android adaptive icon (1024x1024)
    await createImage(1024, 1024, 'adaptive-icon.png', '👶');

    // Favicon (48x48)
    await createImage(48, 48, 'favicon.png', '👶');

    console.log('\n✅ All assets generated successfully!');
    console.log('You can replace these with your custom designs later.');
  } catch (error) {
    console.error('Error generating assets:', error.message);
    console.log('\nAlternative: Install sharp with: npm install --save-dev sharp');
    process.exit(1);
  }
}

generateAssets();


