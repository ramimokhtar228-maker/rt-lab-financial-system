import fs from 'fs';
import zlib from 'zlib';

// High-Fidelity Financial System Icon: Deep Red (#881337) & Gold/Amber Coin & RT Monogram
function createFinancialPNG(width, height, isMaskable = false) {
  const rowLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None
    const ny = y / height;

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      // Background gradient: Deep Crimson Red (#881337: 136, 19, 55) to Obsidian Navy (#0f172a: 15, 23, 42)
      const t = (nx + ny) / 2;
      let r = Math.round(136 * (1 - t) + 15 * t);
      let g = Math.round(19 * (1 - t) + 23 * t);
      let b = Math.round(55 * (1 - t) + 42 * t);

      // Outer golden border if not maskable
      if (!isMaskable) {
        const borderDist = Math.min(nx, 1 - nx, ny, 1 - ny);
        if (borderDist > 0.035 && borderDist < 0.05) {
          // Gold accent #f59e0b
          r = 245; g = 158; b = 11;
        }
      }

      // Golden Financial Coin / Vault Shield in top-right
      const coinCx = 0.76;
      const coinCy = 0.24;
      const coinDist = Math.hypot(nx - coinCx, ny - coinCy);
      if (coinDist <= 0.12) {
        if (coinDist <= 0.10) {
          // Inner gold coin #fbbf24
          r = 251; g = 191; b = 36;
          // Currency symbol / bar inside coin
          if (Math.abs(nx - coinCx) < 0.015 && Math.abs(ny - coinCy) < 0.055) {
            r = 136; g = 19; b = 55; // Red inner bar
          } else if (Math.abs(ny - coinCy) < 0.012 && Math.abs(nx - coinCx) < 0.045) {
            r = 136; g = 19; b = 55; // Red cross bar
          }
        } else {
          // Darker gold border #d97706
          r = 217; g = 119; b = 6;
        }
      }

      // Draw stylized "R" (left side)
      const inR_bar = nx >= 0.20 && nx <= 0.27 && ny >= 0.35 && ny <= 0.72;
      const inR_top = nx >= 0.20 && nx <= 0.42 && ny >= 0.35 && ny <= 0.41;
      const inR_mid = nx >= 0.20 && nx <= 0.42 && ny >= 0.49 && ny <= 0.55;
      const inR_curve = nx >= 0.36 && nx <= 0.43 && ny >= 0.35 && ny <= 0.55;
      const inR_leg = ny >= 0.53 && ny <= 0.72 && nx >= 0.26 + (ny - 0.53) * 0.9 && nx <= 0.33 + (ny - 0.53) * 0.9;

      // Draw stylized "T" (right side)
      const inT_top = nx >= 0.50 && nx <= 0.74 && ny >= 0.35 && ny <= 0.42;
      const inT_post = nx >= 0.59 && nx <= 0.66 && ny >= 0.35 && ny <= 0.72;

      // Underline wave swoosh (red & gold)
      const inWave = ny >= 0.76 && ny <= 0.785 && nx >= 0.18 && nx <= 0.82;

      if (inR_bar || inR_top || inR_mid || inR_curve || inR_leg || inT_top || inT_post) {
        // Bright metallic white
        r = 255; g = 255; b = 255;
      } else if (inWave) {
        // Gold accent #f59e0b
        r = 245; g = 158; b = 11;
      }

      const pixelOffset = rowOffset + 1 + x * 3;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createFinancialPNG(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', createFinancialPNG(512, 512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', createFinancialPNG(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', createFinancialPNG(180, 180, false));
fs.writeFileSync('public/favicon.ico', createFinancialPNG(48, 48, false));

console.log('Successfully generated RT Lab FINANCIAL PWA icons in public/');
