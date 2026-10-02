import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // RGB raw scanlines
  // Each scanline: 1 byte filter (0) + width * 3 bytes (R, G, B)
  const rowLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None

    // Teal gradient from top-left (#0f766e: 15, 118, 110) to bottom-right (#042f2e: 4, 47, 46)
    const factorY = y / height;

    for (let x = 0; x < width; x++) {
      const factorX = x / width;
      const t = (factorX + factorY) / 2;

      // Base background color
      let r = Math.round(15 * (1 - t) + 4 * t);
      let g = Math.round(118 * (1 - t) + 47 * t);
      let b = Math.round(110 * (1 - t) + 46 * t);

      // Check if pixel is within center "RT" or medical cross motif
      const nx = x / width;
      const ny = y / height;

      // Inner ring if not maskable
      if (!isMaskable) {
        const borderDist = Math.min(nx, 1 - nx, ny, 1 - ny);
        if (borderDist > 0.04 && borderDist < 0.046) {
          r = 45; g = 212; b = 191; // Teal accent ring
        }
      }

      // Draw stylized "R" (left half)
      // vertical bar: nx in [0.24, 0.31], ny in [0.32, 0.68]
      const inR_bar = nx >= 0.24 && nx <= 0.31 && ny >= 0.32 && ny <= 0.68;
      // top bar: nx in [0.24, 0.44], ny in [0.32, 0.38]
      const inR_top = nx >= 0.24 && nx <= 0.44 && ny >= 0.32 && ny <= 0.38;
      // mid bar: nx in [0.24, 0.44], ny in [0.47, 0.53]
      const inR_mid = nx >= 0.24 && nx <= 0.44 && ny >= 0.47 && ny <= 0.53;
      // right curve: nx in [0.38, 0.45], ny in [0.32, 0.53]
      const inR_curve = nx >= 0.38 && nx <= 0.45 && ny >= 0.32 && ny <= 0.53;
      // diagonal leg: nx in [0.32, 0.45], ny in [0.53, 0.68] with diagonal condition
      const inR_leg = ny >= 0.53 && ny <= 0.68 && nx >= 0.28 + (ny - 0.53) * 0.9 && nx <= 0.35 + (ny - 0.53) * 0.9;

      // Draw stylized "T" (right half)
      // top bar: nx in [0.55, 0.78], ny in [0.32, 0.39]
      const inT_top = nx >= 0.55 && nx <= 0.78 && ny >= 0.32 && ny <= 0.39;
      // vertical post: nx in [0.63, 0.70], ny in [0.32, 0.68]
      const inT_post = nx >= 0.63 && nx <= 0.70 && ny >= 0.32 && ny <= 0.68;

      // Medical cross in top right corner
      const crossCenterX = 0.78;
      const crossCenterY = 0.22;
      const inCrossV = Math.abs(nx - crossCenterX) < 0.015 && Math.abs(ny - crossCenterY) < 0.045;
      const inCrossH = Math.abs(nx - crossCenterX) < 0.045 && Math.abs(ny - crossCenterY) < 0.015;

      // EKG pulse line below letters
      const inEKG_baseline = ny >= 0.73 && ny <= 0.745;
      const inEKG_peak = (nx >= 0.44 && nx <= 0.48 && ny >= 0.69 && ny <= 0.745) ||
                         (nx >= 0.48 && nx <= 0.52 && ny >= 0.73 && ny <= 0.78);

      if (inR_bar || inR_top || inR_mid || inR_curve || inR_leg || inT_top || inT_post) {
        r = 255; g = 255; b = 255; // White
      } else if (inCrossV || inCrossH || inEKG_baseline || inEKG_peak) {
        r = 45; g = 212; b = 191; // Bright Teal accent #2dd4bf
      }

      const pixelOffset = rowOffset + 1 + x * 3;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
    }
  }

  // Compress with zlib
  const compressed = zlib.deflateSync(rawData);

  // Build PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 2; // Color type: 2 (Truecolor RGB)
  ihdrData[10] = 0; // Compression: Deflate
  ihdrData[11] = 0; // Filter: 0
  ihdrData[12] = 0; // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
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

// Standard CRC32 table
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

// Write files to public
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, false));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, false));
fs.writeFileSync('public/favicon.ico', createPNG(48, 48, false));

console.log('Successfully generated all PWA PNG icons in public/');
