import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  const crc = Buffer.alloc(4);

  length.writeUInt32BE(data.length);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function setPixel(pixels, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) {
    return;
  }

  const index = (y * size + x) * 4;
  pixels[index] = color[0];
  pixels[index + 1] = color[1];
  pixels[index + 2] = color[2];
  pixels[index + 3] = color[3];
}

function fillCircle(pixels, size, cx, cy, radius, color) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) {
        setPixel(pixels, size, x, y, color);
      }
    }
  }
}

function strokeLine(pixels, size, x1, y1, x2, y2, width, color) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1) * 2);

  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    fillCircle(pixels, size, x, y, width / 2, color);
  }
}

function createIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const ocean = [8, 125, 143, 255];
  const lagoon = [19, 168, 168, 255];
  const sand = [255, 245, 220, 255];
  const sun = [244, 185, 66, 255];
  const white = [255, 253, 247, 255];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const blend = (x + y) / (size * 2);
      setPixel(pixels, size, x, y, [
        Math.round(ocean[0] * (1 - blend) + sun[0] * blend),
        Math.round(ocean[1] * (1 - blend) + sun[1] * blend),
        Math.round(ocean[2] * (1 - blend) + sun[2] * blend),
        255,
      ]);
    }
  }

  fillCircle(pixels, size, center, center, size * 0.35, sand);
  fillCircle(pixels, size, center, size * 0.29, size * 0.08, sun);

  strokeLine(pixels, size, size * 0.24, size * 0.61, size * 0.39, size * 0.43, size * 0.06, ocean);
  strokeLine(pixels, size, size * 0.39, size * 0.43, size * 0.5, size * 0.62, size * 0.06, ocean);
  strokeLine(pixels, size, size * 0.5, size * 0.62, size * 0.63, size * 0.45, size * 0.06, ocean);
  strokeLine(pixels, size, size * 0.63, size * 0.45, size * 0.78, size * 0.61, size * 0.06, ocean);
  strokeLine(pixels, size, size * 0.24, size * 0.69, size * 0.42, size * 0.73, size * 0.045, lagoon);
  strokeLine(pixels, size, size * 0.42, size * 0.73, size * 0.58, size * 0.68, size * 0.045, lagoon);
  strokeLine(pixels, size, size * 0.58, size * 0.68, size * 0.76, size * 0.72, size * 0.045, lagoon);

  fillCircle(pixels, size, center, size * 0.49, size * 0.055, white);

  const raw = Buffer.alloc((size * 4 + 1) * size);

  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

writeFileSync("public/icons/icon-192.png", createIcon(192));
writeFileSync("public/icons/icon-512.png", createIcon(512));
writeFileSync("public/icons/apple-touch-icon.png", createIcon(180));
