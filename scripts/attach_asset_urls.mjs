import fs from "node:fs/promises";
import path from "node:path";

const manifestPath = "/home/ubuntu/propertymax-flyer-studio/property-assets-manifest.json";
const uploadLogPath = "/home/ubuntu/propertymax-flyer-studio/property-asset-urls.txt";

function parseUploadLog(uploadLog) {
  const lines = uploadLog.split(/\r?\n/);
  const urlsByFilename = new Map();
  let filename = "";

  for (const line of lines) {
    const uploadMatch = line.match(/Uploading file \(webdev private\): (.+?) \(size:/);
    if (uploadMatch) {
      filename = path.basename(uploadMatch[1]);
      continue;
    }

    const storageMatch = line.match(/^Storage Path: (.+)$/);
    if (storageMatch && filename) {
      urlsByFilename.set(filename, storageMatch[1]);
      filename = "";
    }
  }

  return urlsByFilename;
}

async function main() {
  const [manifestRaw, uploadLog] = await Promise.all([
    fs.readFile(manifestPath, "utf8"),
    fs.readFile(uploadLogPath, "utf8"),
  ]);
  const manifest = JSON.parse(manifestRaw);
  const urlsByFilename = parseUploadLog(uploadLog);

  manifest.properties = manifest.properties.map((property) => {
    const filename = `${property.id}-hero${path.extname(property.localImagePath)}`;
    const assetUrl = urlsByFilename.get(filename);
    if (!assetUrl) throw new Error(`Missing managed asset URL for ${property.name}`);
    return { ...property, assetUrl };
  });

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Attached managed asset URLs to ${manifest.properties.length} properties.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
