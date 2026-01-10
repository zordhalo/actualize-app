import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BRAND = join(ROOT, '..', '..', 'brand');
const PUBLIC = join(ROOT, 'public');

const SOURCE_LOGO = join(BRAND, 'actualizeLogoNBG.avif');

async function generateFavicons() {
  console.log('🎨 Generating favicons from:', SOURCE_LOGO);
  
  // Ensure public directory exists
  await mkdir(PUBLIC, { recursive: true });
  
  // Load the source image
  const sourceImage = sharp(SOURCE_LOGO);
  const metadata = await sourceImage.metadata();
  console.log(`📐 Source image: ${metadata.width}x${metadata.height}`);
  
  // Generate favicon.ico (multi-size ICO file) - 16x16, 32x32, 48x48
  // We'll create a 32x32 PNG as the main favicon for simplicity
  // Modern browsers prefer PNG favicons anyway
  
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon.png', size: 32 }, // Default favicon
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
    { name: 'mstile-150x150.png', size: 150 },
  ];
  
  for (const { name, size } of sizes) {
    const outputPath = join(PUBLIC, name);
    await sharp(SOURCE_LOGO)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    console.log(`✅ Generated: ${name} (${size}x${size})`);
  }
  
  // Generate favicon.ico (32x32 PNG saved as .ico for basic compatibility)
  // For a proper multi-resolution ICO, we'd need a different library
  // but most modern browsers prefer PNG anyway
  const icoPath = join(PUBLIC, 'favicon.ico');
  await sharp(SOURCE_LOGO)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(icoPath);
  console.log('✅ Generated: favicon.ico (32x32)');
  
  // Generate site.webmanifest
  const manifest = {
    name: 'Actualize',
    short_name: 'Actualize',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone'
  };
  
  await writeFile(
    join(PUBLIC, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('✅ Generated: site.webmanifest');
  
  // Generate browserconfig.xml for Windows tiles
  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>#ffffff</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  
  await writeFile(join(PUBLIC, 'browserconfig.xml'), browserConfig);
  console.log('✅ Generated: browserconfig.xml');
  
  console.log('\n🎉 All favicons generated successfully!');
  console.log('\n📝 Add these tags to your <head>:');
  console.log(`
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="msapplication-TileColor" content="#ffffff" />
<meta name="theme-color" content="#ffffff" />
`);
}

generateFavicons().catch(console.error);
