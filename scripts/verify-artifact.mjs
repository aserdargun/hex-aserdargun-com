import assert from "node:assert/strict";
import { MOTION_VERSION } from "../src/core/motion.ts";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync,copyFileSync,readdirSync } from "node:fs";
import { resolve, sep } from "node:path";

const root = resolve("dist");
copyFileSync("lab.manifest.json",resolve(root,"lab.manifest.json"));
const html = readFileSync(resolve(root, "index.html"), "utf8");
assert.match(html, /HEX/);
for (const [, asset] of html.matchAll(/(?:src|href)="(\.[^\"]+)"/g)) {
  const file = resolve(root, asset);
  assert.ok(file.startsWith(root + sep), `Asset outside dist: ${asset}`);
  assert.ok(existsSync(file), `Missing built asset: ${asset}`);
}
for (const asset of [
  "models/HEX_Web.glb",
  "renders/hero.webp",
  "staticwebapp.config.json",
]) {
  assert.ok(
    readFileSync(resolve(root, asset)).equals(
      readFileSync(resolve("public", asset)),
    ),
    `Published asset differs from its verified source: ${asset}`,
  );
}
const config = JSON.parse(
  readFileSync(resolve(root, "staticwebapp.config.json"), "utf8"),
);
assert.equal(config.mimeTypes[".glb"], "model/gltf-binary");
assert.equal(config.mimeTypes[".webp"], "image/webp");

const releaseSha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
assert.match(releaseSha, /^[a-f0-9]{40}$/);
if (process.env.GITHUB_SHA) assert.equal(releaseSha, process.env.GITHUB_SHA);
const release = {
  schemaVersion: 1,
  motionVersion: MOTION_VERSION,
  app: "hex-aserdargun-com",
  releaseSha,
  builtAt: new Date().toISOString(),
  sourceDirty: Boolean(
    execFileSync("git", ["status", "--porcelain", "--untracked-files=normal"], {
      encoding: "utf8",
    }).trim(),
  ),
  artifactHashes: Object.fromEntries(
    readdirSync(root,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&e.name!=="release.json").map(e=>(e.parentPath+"/"+e.name).slice(root.length+1)).sort().map(
      (asset) => [
        asset,
        createHash("sha256")
          .update(readFileSync(resolve(root, asset)))
          .digest("hex"),
      ],
    ),
  ),
  workflowRun: process.env.GITHUB_RUN_ID
    ? `https://github.com/aserdargun/hex-aserdargun-com/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null,
};
writeFileSync(
  resolve(root, "release.json"),
  JSON.stringify(release, null, 2) + "\n",
);
console.log(`Verified static artifact; release ${releaseSha}`);
