# ProofLocker Brand Assets

Official brand assets for ProofLocker product.

## Brand Colors

### Primary Palette
```
Background:      #0B0B12
Surface:         #141428
Primary Purple:  #7C3AED
Accent Purple:   #A855F7
Text Primary:    #FFFFFF
Text Muted:      #9CA3AF
```

## Design System

### Logo Rules
- Logo text: "ProofLocker"
- Icon: LD mark (monogram)
- **Flat design only** - no gradients, glows, or shadows
- Tagline is separate and should not be baked into logo

### Official Tagline
"Say it now. Prove it later."

*(For UI use only, not part of logo)*

---

## Logo Files

Located in `/logos/`:

### Full Logos
- `prooflocker-logo-dark.svg` - White logo on transparent (for dark backgrounds)
- `prooflocker-logo-light.svg` - Black logo on transparent (for light backgrounds)

### Marks (Icon Only)
- `prooflocker-mark.svg` - White LD mark
- `prooflocker-mark-purple.svg` - Purple (#7C3AED) LD mark
- `prooflocker-mark-black.svg` - Black LD mark

### Usage Guidelines
- Use `logo-dark.svg` on dark backgrounds (#0B0B12, #141428)
- Use `logo-light.svg` on light backgrounds
- Marks can be used independently for app icons, favicons, social media
- Maintain minimum clear space around logo (equal to height of "L" in mark)

---

## Favicon Files

Located in `/favicons/`:

### SVG (Scalable)
- `favicon.svg` - Main favicon source (256x256 viewBox)

### PNG Sizes
- `favicon-16x16.png` - Browser tab icon (16×16)
- `favicon-32x32.png` - Browser tab icon (32×32)
- `apple-touch-icon.png` - iOS home screen (180×180)
- `icon-192.png` - Android home screen (192×192)
- `icon-512.png` - Android splash screen (512×512)

### Favicon Design Specs
- Background: #0B0B12 (brand background)
- Icon: White LD mark
- High contrast for readability
- Optimized for small sizes (16px+)
- No gradients or blue tones

---

## HTML Implementation

### Favicon Links
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

### PWA Manifest Icons
```json
{
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## Color Usage Confirmation

All assets use **exact brand colors**:

✅ Background: `#0B0B12`
✅ Primary Purple: `#7C3AED`
✅ White: `#FFFFFF`
✅ Black: `#000000`

**No deviations. No gradients. No glows.**

---

## File Structure

```
brand-assets/
├── logos/
│   ├── prooflocker-logo-dark.svg
│   ├── prooflocker-logo-light.svg
│   ├── prooflocker-mark.svg
│   ├── prooflocker-mark-purple.svg
│   └── prooflocker-mark-black.svg
└── favicons/
    ├── favicon.svg
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    ├── apple-touch-icon.png
    ├── icon-192.png
    └── icon-512.png
```

---

## Design Principles

1. **Flat & Minimal** - No gradients, shadows, or 3D effects
2. **High Contrast** - Readable at any size
3. **Consistent** - Use exact brand colors only
4. **Scalable** - SVG-first approach
5. **Accessible** - Meets WCAG contrast requirements

---

## Version

**v1.0** - Initial brand asset package
**Date:** 2026-01-17
**Status:** Production ready

---

## Notes

- All assets are production-ready
- SVG files are optimized and clean
- PNG files generated from SVG source
- All colors verified against brand palette
- No external dependencies or fonts required
