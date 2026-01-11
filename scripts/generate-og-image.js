const sharp = require('sharp');
const path = require('path');

async function generateOGImage() {
  const width = 1200;
  const height = 630;

  // Create a dark background
  const background = Buffer.from(
    `<svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>

      <!-- Logo placeholder in center -->
      <rect x="${width/2 - 200}" y="${height/2 - 150}" width="400" height="120" rx="8" fill="#1a1a1a" stroke="#333" stroke-width="2"/>

      <!-- ProofLocker text -->
      <text x="${width/2}" y="${height/2 - 60}" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle">
        ProofLocker
      </text>

      <!-- Tagline -->
      <text x="${width/2}" y="${height/2 + 20}" font-family="Arial, sans-serif" font-size="32" fill="#888888" text-anchor="middle">
        Time-stamped prediction proofs
      </text>

      <!-- Domain -->
      <text x="${width/2}" y="${height/2 + 80}" font-family="monospace" font-size="24" fill="#06b6d4" text-anchor="middle">
        www.prooflocker.io
      </text>

      <!-- Decorative border -->
      <rect x="30" y="30" width="${width-60}" height="${height-60}" rx="12" fill="none" stroke="#333" stroke-width="2"/>
    </svg>`
  );

  try {
    await sharp(background)
      .png()
      .toFile(path.join(__dirname, '../public/og.png'));

    console.log('✓ OG image generated successfully at public/og.png');
  } catch (error) {
    console.error('Error generating OG image:', error);
    process.exit(1);
  }
}

generateOGImage();
