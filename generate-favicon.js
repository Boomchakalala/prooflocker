const sharp = require('sharp');
const fs = require('fs');

async function createGradientFavicon() {
  const size = 32;

  // Create gradient background (blue to purple)
  // Colors: blue-600 (#2563eb) to purple-600 (#9333ea)
  const svgGradient = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="6"/>

      <!-- Lock icon (simplified) -->
      <g transform="translate(8, 8)" fill="white" opacity="0.95">
        <!-- Lock body -->
        <rect x="2" y="7" width="12" height="9" rx="1.5" fill="white"/>
        <!-- Lock shackle -->
        <path d="M 5 7 L 5 5 Q 5 2 8 2 Q 11 2 11 5 L 11 7"
              stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Keyhole -->
        <circle cx="8" cy="11" r="1.5" fill="#2563eb" opacity="0.4"/>
      </g>
    </svg>
  `;

  // Convert SVG to PNG
  await sharp(Buffer.from(svgGradient))
    .resize(32, 32)
    .png()
    .toFile('/home/vibecode/workspace/src/app/favicon.ico');

  console.log('Favicon generated successfully!');
}

createGradientFavicon().catch(console.error);
