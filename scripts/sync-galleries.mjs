import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const configPath = path.join(rootDir, 'config.json');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function isImage(fileName) {
  return IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function sortNatural(a, b) {
  return a.localeCompare(b, 'ro', { numeric: true, sensitivity: 'base' });
}

async function listImages(dirName, filterFn = null) {
  const dirPath = path.join(rootDir, dirName);
  const entries = await readdir(dirPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter(isImage)
    .filter((name) => (filterFn ? filterFn(name) : true))
    .sort(sortNatural)
    .map((name) => `${dirName}/${name}`);
}

async function main() {
  const raw = await readFile(configPath, 'utf8');
  const config = JSON.parse(raw);

  // Poster gallery: only event promo images like img1.jpg, img2.jpg...
  config.gallery = await listImages('resources', (name) => /^img\d+\.(jpg|jpeg|png|webp|gif)$/i.test(name));

  // Atmosphere carousel: all images from atmosfera/
  config.atmosphereGallery = await listImages('atmosfera');

  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  console.log(`Updated config.json: gallery=${config.gallery.length}, atmosphereGallery=${config.atmosphereGallery.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
