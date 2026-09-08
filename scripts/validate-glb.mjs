import validator from "gltf-validator";
import { readFileSync, writeFileSync } from "node:fs";
const output = {};
let failed = false;
for (const file of ["HEX/export/HEX_Web.glb", "HEX/export/HEX_High.glb"]) {
  const r = await validator.validateBytes(new Uint8Array(readFileSync(file)), {
    uri: file,
    maxIssues: 0,
  });
  output[file] = {
    errors: r.issues.numErrors,
    warnings: r.issues.numWarnings,
    infos: r.issues.numInfos,
    messages: r.issues.messages,
  };
  failed ||= r.issues.numErrors > 0 || r.issues.numWarnings > 0;
  console.log(
    `${file}: ${r.issues.numErrors} errors, ${r.issues.numWarnings} warnings, ${r.issues.numInfos} informational messages`,
  );
}
writeFileSync(
  "docs/glb-validation.json",
  JSON.stringify(output, null, 2) + "\n",
);
if (failed) process.exitCode = 1;
