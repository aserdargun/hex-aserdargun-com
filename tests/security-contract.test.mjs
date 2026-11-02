import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * The published security policy has to permit what the shipped laboratory does.
 *
 * The laboratory loads its model through drei's `useGLTF`, and drei installs
 * three's MeshoptDecoder on that loader. The decoder compiles a WebAssembly
 * module, so a policy whose `script-src` forbids WebAssembly compilation makes
 * the browser raise a content-security-policy violation on every page load —
 * while the model still renders, because this model is not meshopt-compressed.
 *
 * The violation is invisible to the local gate: the preview and dev servers
 * send no policy header at all, so only the deployed site ever showed it. These
 * checks read the policy that Azure Static Web Apps actually applies, and the
 * application source that decides whether WebAssembly is needed, so a policy
 * that forbids it fails the build instead of the visitor's browser.
 */

const config = JSON.parse(
  readFileSync("public/staticwebapp.config.json", "utf8"),
);
const policy = config.globalHeaders["Content-Security-Policy"];

const directive = (name) =>
  policy
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name} `));

test("The shipped application compiles WebAssembly when it loads the model", () => {
  // This is the fact the policy has to accommodate: the model is fetched
  // through drei's useGLTF, which installs a WebAssembly decoder.
  const scene = readFileSync("src/scene/RobotScene.tsx", "utf8");
  assert.match(scene, /useGLTF/);
  const drei = readFileSync(
    "node_modules/@react-three/drei/core/Gltf.js",
    "utf8",
  );
  assert.match(drei, /setMeshoptDecoder/);
});

test("The published policy allows the WebAssembly the model loader compiles", () => {
  const scriptSrc = directive("script-src");
  assert.ok(scriptSrc, `no script-src directive in: ${policy}`);
  assert.ok(
    scriptSrc.includes("'wasm-unsafe-eval'"),
    `script-src must allow 'wasm-unsafe-eval' so the model decoder can compile: ${scriptSrc}`,
  );
});

test("The published policy does not open eval to scripts", () => {
  // 'wasm-unsafe-eval' permits the module the decoder needs and nothing else;
  // 'unsafe-eval' would let any script evaluate strings.
  const scriptSrc = directive("script-src");
  assert.ok(scriptSrc, `no script-src directive in: ${policy}`);
  assert.ok(
    !scriptSrc.includes("'unsafe-eval'"),
    `script-src must not allow 'unsafe-eval': ${scriptSrc}`,
  );
});
