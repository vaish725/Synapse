# Placeholder Icon Files

The `icons/` directory should contain the following PNG files:
- `icon16.png` (16x16px)
- `icon32.png` (32x32px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

## Quick Icon Generation Options

### Option 1: Use an Icon Generator
Visit: https://www.favicon-generator.org/
Upload a 512x512 logo and download all sizes

### Option 2: Create Simple Placeholder Icons
Use any image editor to create simple colored squares with the Synapse brain emoji (🧠) or text

### Option 3: Use ImageMagick (if installed)
```bash
# Create placeholder icons with gradient background
convert -size 128x128 gradient:#6366f1-#764ba2 -gravity center -pointsize 60 -annotate +0+0 "🧠" icons/icon128.png
convert icons/icon128.png -resize 48x48 icons/icon48.png
convert icons/icon128.png -resize 32x32 icons/icon32.png
convert icons/icon128.png -resize 16x16 icons/icon16.png
```

For now, you can test the extension without icons - Chrome will use default placeholders.
