/**
 * Exports every procedural jewellery model to a binary glTF (.glb) file in
 * src/assets/models. Run with `npm run generate:models`.
 * This is an offline asset-generation tool — the storefront itself has no backend.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { buildJewellery, DISPLAY_ROTATION } from '../src/utils/jewellery/builders.js';
import { MODEL_SPECS } from '../src/data/modelSpecs.js';

// GLTFExporter relies on the browser FileReader API; provide a tiny Node shim.
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buffer).toString('base64')}`;
      this.onloadend?.();
    });
  }
};

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'src/assets/models');
await mkdir(outDir, { recursive: true });

const only = process.argv.slice(2);
const exporter = new GLTFExporter();
let total = 0;
for (const [id, spec] of Object.entries(MODEL_SPECS)) {
  if (only.length && !only.includes(id)) continue;
  const group = buildJewellery(spec);
  group.name = id;
  group.userData = { ...group.userData, displayRotation: DISPLAY_ROTATION[spec.kind] };
  const glb = await exporter.parseAsync(group, { binary: true });
  const file = resolve(outDir, `${id}.glb`);
  await writeFile(file, Buffer.from(glb));
  total += glb.byteLength;
  const tris = group.children.reduce((s, m) => s + (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3, 0);
  console.log(`${id.padEnd(26)} ${(glb.byteLength / 1024).toFixed(0).padStart(5)} KB  ${Math.round(tris)} tris  [${group.children.map((m) => m.name).join(', ')}]`);
}
console.log(`Total ${(total / 1024 / 1024).toFixed(2)} MB`);
