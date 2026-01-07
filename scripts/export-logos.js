const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSVGtoPNG() {
  const publicDir = path.join(__dirname, '../public');

  // Convert logo icon (square, 512x512 for high quality)
  const iconSvg = fs.readFileSync(path.join(publicDir, 'logo-icon.svg'));
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'logo-icon.png'));

  console.log('✓ Created logo-icon.png (512x512)');

  // Convert horizontal logo (wider, keeping aspect ratio)
  const horizontalSvg = fs.readFileSync(path.join(publicDir, 'logo-horizontal.svg'));
  await sharp(horizontalSvg)
    .resize(1000, 200)
    .png()
    .toFile(path.join(publicDir, 'logo-horizontal.png'));

  console.log('✓ Created logo-horizontal.png (1000x200)');

  // Also create a favicon size (32x32)
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'icon.png'));

  console.log('✓ Created icon.png (32x32) for favicon');
}

convertSVGtoPNG()
  .then(() => console.log('\nAll PNG exports complete!'))
  .catch(err => console.error('Error:', err));
