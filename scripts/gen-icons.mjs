import sharp from "sharp";
import { writeFileSync } from "fs";
import { mkdirSync } from "fs";

// Malaysian navy blue background, yellow crescent + star suggestion
// Simple clean icon: navy bg, white "MY" text as SVG
const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

function makeSvg(size) {
  const fontSize = Math.round(size * 0.32);
  const subSize = Math.round(size * 0.16);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#003893"/>
  <!-- Red stripe accent top -->
  <rect x="0" y="0" width="${size}" height="${Math.round(size * 0.08)}" rx="${Math.round(size * 0.18)}" fill="#CC0001"/>
  <rect x="0" y="0" width="${size}" height="${Math.round(size * 0.06)}" fill="#CC0001"/>
  <!-- MY text -->
  <text x="50%" y="52%" font-family="Arial, sans-serif" font-weight="900" font-size="${fontSize}" fill="white" text-anchor="middle" dominant-baseline="middle" letter-spacing="-1">MY</text>
  <!-- Arrival Card sub-text -->
  <text x="50%" y="76%" font-family="Arial, sans-serif" font-weight="600" font-size="${subSize}" fill="#FFD100" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">ARRIVAL</text>
</svg>`;
}

mkdirSync("public/icons", { recursive: true });

for (const { name, size } of sizes) {
  const svg = Buffer.from(makeSvg(size));
  await sharp(svg).png().toFile(`public/icons/${name}`);
  console.log(`✓ public/icons/${name}`);
}

// Copy apple-touch-icon to public root (iOS looks there)
const atBuf = await sharp("public/icons/apple-touch-icon.png").toBuffer();
writeFileSync("public/apple-touch-icon.png", atBuf);
console.log("✓ public/apple-touch-icon.png");

// Also write a favicon
const favBuf = await sharp("public/icons/icon-192.png").resize(32, 32).png().toBuffer();
writeFileSync("public/favicon.png", favBuf);
console.log("✓ public/favicon.png");
