const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'brand-assets/favicons/favicon.svg');
const outputDir = path.join(__dirname, 'brand-assets/favicons');

// Read SVG content
const svgBuffer = fs.readFileSync(svgPath);

// Generate PNG files at different sizes
async function generateFavicons() {
  console.log('Generating favicon PNGs...');

  // favicon-32x32.png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, 'favicon-32x32.png'));
  console.log('✓ favicon-32x32.png');

  // favicon-16x16.png
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(outputDir, 'favicon-16x16.png'));
  console.log('✓ favicon-16x16.png');

  // apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (180x180)');

  // icon-192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(outputDir, 'icon-192.png'));
  console.log('✓ icon-192.png');

  // icon-512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'icon-512.png'));
  console.log('✓ icon-512.png');

  console.log('\n✅ All favicons generated successfully!');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
