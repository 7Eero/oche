const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure Node.js PNG encoder
function createPNG(width, height, getPixel) {
  // CRC table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
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

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcBuf = Buffer.alloc(4 + len);
    buf.copy(crcBuf, 0, 4, 8 + len);
    buf.writeUInt32BE(crc32(crcBuf), 8 + len);
    return buf;
  }

  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with scanline filter byte (0)
  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowStride);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate Darts Icon
function drawDartsIcon(isMaskable) {
  return (x, y, width, height) => {
    // normalized coordinates -1 to 1
    const cx = (x - width / 2) / (width / 2);
    const cy = (y - height / 2) / (height / 2);
    const dist = Math.sqrt(cx * cx + cy * cy);
    const maxRadius = isMaskable ? 0.95 : 0.88;

    // Background
    if (dist > maxRadius) {
      return isMaskable ? [26, 26, 46, 255] : [0, 0, 0, 0];
    }

    // Outer ring border
    if (dist > maxRadius - 0.05) {
      return [233, 69, 96, 255]; // Accent red border
    }

    // Concentric rings dartboard style
    if (dist > 0.65) {
      // Outer doubles ring area
      const angle = Math.atan2(cy, cx);
      const segment = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 20);
      return segment % 2 === 0 ? [16, 185, 129, 255] : [233, 69, 96, 255]; // green / red
    }

    if (dist > 0.58) {
      // Inner bed border
      return [30, 30, 50, 255];
    }

    if (dist > 0.40) {
      // Trebles ring area
      const angle = Math.atan2(cy, cx);
      const segment = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 20);
      return segment % 2 === 0 ? [16, 185, 129, 255] : [233, 69, 96, 255]; // green / red
    }

    if (dist > 0.18) {
      // Main dark body with segments
      const angle = Math.atan2(cy, cx);
      const segment = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 20);
      return segment % 2 === 0 ? [22, 33, 62, 255] : [15, 23, 42, 255];
    }

    // Outer bull
    if (dist > 0.08) {
      return [16, 185, 129, 255]; // Emerald Bull
    }

    // Double bull
    return [233, 69, 96, 255]; // Red Bullseye
  };
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 192x192 regular
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPNG(192, 192, drawDartsIcon(false)));
console.log('✓ Created icon-192.png');

// 512x512 regular
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPNG(512, 512, drawDartsIcon(false)));
console.log('✓ Created icon-512.png');

// 192x192 maskable
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192.png'), createPNG(192, 192, drawDartsIcon(true)));
console.log('✓ Created icon-maskable-192.png');

// 512x512 maskable
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), createPNG(512, 512, drawDartsIcon(true)));
console.log('✓ Created icon-maskable-512.png');
