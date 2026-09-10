import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  lessons,
  modes,
  chapters,
  bodies,
  sources,
} from "../src/data/content.ts";
const catalogue = JSON.parse(readFileSync("src/data/components.json", "utf8"));
test("Every physical component resolves to a bilingual lesson and a body region", () => {
  const buffer = readFileSync("public/models/HEX_Web.glb");
  const glb = JSON.parse(
    buffer.toString("utf8", 20, 20 + buffer.readUInt32LE(12)),
  );
  const meshes = glb.nodes.filter((node) => node.mesh !== undefined);
  assert.equal(catalogue.length, meshes.length);
  assert.equal(new Set(catalogue.map((part) => part.name)).size, meshes.length);
  for (const part of catalogue) {
    const mesh = meshes.find((node) => node.name === part.name);
    assert.ok(mesh, part.name);
    for (const key of ["lesson", "category", "region"])
      assert.equal(part[key], mesh.extras[key]);
    assert.ok(
      lessons[part.lesson],
      `${part.name} has no lesson: ${part.lesson}`,
    );
    assert.ok(
      bodies.some((body) => body.id === part.region),
      part.name,
    );
  }
});
test("All modes, chapters and source references resolve without fallback content", () => {
  for (const mode of modes) assert.ok(lessons[mode.id], mode.id);
  for (const chapter of chapters) {
    assert.ok(modes.some((mode) => mode.id === chapter.mode));
    assert.ok(lessons[chapter.lesson], chapter.lesson);
  }
  for (const [id, lesson] of Object.entries(lessons)) {
    for (const field of [
      "title",
      "summary",
      "why",
      "receives",
      "produces",
      "observes",
      "influences",
    ]) {
      assert.equal(lesson[field].length, 2, `${id}.${field}`);
      assert.ok(
        lesson[field].every((text) => typeof text === "string" && text.trim()),
        `${id}.${field}`,
      );
    }
    assert.ok(lesson.chain.length > 0, id);
    if (lesson.source !== undefined) assert.ok(sources[lesson.source], id);
  }
});
