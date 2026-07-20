import fs from "node:fs/promises";
import path from "node:path";

const rawSource = "/home/ubuntu/console_outputs/exec_result_2026-07-20_22-40-05_142.txt";
const assetRoot = "/home/ubuntu/webdev-static-assets/Property Photos";
const manifestPath = "/home/ubuntu/propertymax-flyer-studio/property-assets-manifest.json";

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extensionFromUrl(url) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".png")) return ".png";
  if (pathname.endsWith(".webp")) return ".webp";
  return ".jpg";
}

async function loadPortfolio() {
  const raw = await fs.readFile(rawSource, "utf8");
  return JSON.parse(JSON.parse(raw));
}

async function downloadPropertyAsset(property) {
  const id = slugify(property.name);
  const propertyFolder = path.join(assetRoot, id);
  const extension = extensionFromUrl(property.image);
  const imagePath = path.join(propertyFolder, `hero${extension}`);

  await fs.mkdir(propertyFolder, { recursive: true });
  const response = await fetch(property.image, {
    headers: { "User-Agent": "PropertyMaxFlyerStudio/1.0" },
  });

  if (!response.ok) {
    throw new Error(`${property.name}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(imagePath, buffer);

  return {
    id,
    name: property.name,
    cardText: property.text,
    sourceImageUrl: property.image,
    sourcePage: "https://apartmentcorp.com/portfolio",
    localImagePath: imagePath,
    mediaType: response.headers.get("content-type") || "image/*",
  };
}

async function runWithLimit(items, limit, worker) {
  const results = [];
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  const portfolio = await loadPortfolio();
  const manifest = await runWithLimit(portfolio, 5, downloadPropertyAsset);
  await fs.writeFile(
    manifestPath,
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      source: "Apartment Corp public portfolio page",
      totalProperties: manifest.length,
      properties: manifest,
    }, null, 2)}\n`,
  );
  console.log(`Collected ${manifest.length} property photos.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
