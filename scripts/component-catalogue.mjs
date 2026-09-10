import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
const glb = readFileSync("public/models/HEX_Web.glb");
const model = JSON.parse(glb.toString("utf8", 20, 20 + glb.readUInt32LE(12)));
const components = model.nodes
  .filter((node) => node.mesh !== undefined)
  .map(({ name, extras }) => ({
    name,
    category: extras.category,
    region: extras.region,
    lesson: extras.lesson,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));
const path = "src/data/components.json";
const output = JSON.stringify(components, null, 2) + "\n";
if (process.argv.includes("--check")) {
  assert.equal(
    readFileSync(path, "utf8"),
    output,
    "Component catalogue is stale; run npm run model:catalogue",
  );
} else writeFileSync(path, output);
console.log(
  `Verified ${components.length} selectable components against the web GLB`,
);
