import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  chapterCoverage,
  chapters,
  exportBoundary,
  lessonCoverage,
  lessons,
  modes,
  bodies,
  sources,
  spine,
  spineContext,
  uncoveredLessons,
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
test("Source coverage is legible, bilingual and never padded", () => {
  const chapterIds = new Set(chapters.map((chapter) => chapter.id));
  assert.equal(chapterIds.size, chapters.length);
  for (const source of sources) {
    for (const chapter of source.covers.chapters)
      assert.ok(chapterIds.has(chapter), `${source.name} → ${chapter}`);
    for (const lesson of source.covers.lessons)
      assert.ok(lessons[lesson], `${source.name} → ${lesson}`);
  }
  for (const chapter of chapters) {
    assert.ok(spine.some((s) => s.year === chapter.year), chapter.id);
    if (chapter.source !== undefined)
      assert.ok(
        sources[chapter.source].covers.chapters.includes(chapter.id),
        `${chapter.id} is not listed by source ${chapter.source}`,
      );
  }
  for (const [id, lesson] of Object.entries(lessons)) {
    if (lesson.source === undefined) continue;
    assert.ok(
      sources[lesson.source].covers.lessons.includes(id),
      `${id} is not listed by source ${lesson.source}`,
    );
  }
  assert.equal(lessonCoverage.covered + lessonCoverage.uncovered, lessonCoverage.total);
  assert.equal(
    chapterCoverage.covered + chapterCoverage.uncovered,
    chapterCoverage.total,
  );
  assert.equal(lessonCoverage.covered, lessonCoverage.total - uncoveredLessons.length);
});
test("Bilingual strings stay complete on new surfaces", () => {
  const pairs = [spineContext, exportBoundary, ...spine.flatMap((s) => [s.discipline, s.focus])];
  for (const pair of pairs) {
    assert.equal(pair.length, 2);
    assert.ok(pair.every((text) => typeof text === "string" && text.trim()));
  }
});
