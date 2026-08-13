import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const out = path.join(ROOT, 'build');
fs.mkdirSync(out, { recursive: true });

const WHALE = fs.readFileSync(
  path.join(ROOT, 'node_modules', '@deepseek-ai', 'dsh-web-frontend', 'dist', 'favicon.svg'),
  'utf8'
).match(/<path[^>]*d="([^"]+)"/)[1];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a2233"/>
      <stop offset="1" stop-color="#0b0e17"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>
  <g transform="translate(512,512) scale(15)">
    <g transform="translate(-25,-25)">
      <path d="${WHALE}" fill="#e6e8ee"/>
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(out, 'icon.svg'), svg);

await sharp(Buffer.from(svg))
  .png()
  .toFile(path.join(out, 'icon.png'));

const png = fs.readFileSync(path.join(out, 'icon.png'));
const pngToIco = (await import('png-to-ico')).default;
const ico = await pngToIco(png);
fs.writeFileSync(path.join(out, 'icon.ico'), ico);

console.log('icons written to', out);
