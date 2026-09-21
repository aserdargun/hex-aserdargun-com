import test from "node:test";
import assert from "node:assert/strict";
import { validateCatalog } from "@aserdargun/lab-core";
import {
  manifest,
  experiments,
  guidedLesson,
  initialRoute,
  pair,
} from "../src/ils/catalog.ts";
import concepts from "../src/ils/concepts.json" with { type: "json" };
import {
  modes,
  chapters,
  lessons,
  investigations,
} from "../src/data/content.ts";
test("ILS mirrors the ten real modes and twelve authored chapters", () => {
  assert.deepEqual(
    validateCatalog(
      manifest,
      experiments,
      [guidedLesson],
      concepts.map((c) => c.id),
    ),
    [],
  );
  assert.deepEqual(
    experiments.map((e) => e.id),
    modes.map((m) => m.id),
  );
  assert.deepEqual(
    guidedLesson.steps.map((s) => s.explanation),
    chapters.map((c) => pair(lessons[c.lesson].summary)),
  );
  assert.equal(
    manifest.evidence.some((e) => e.kind === "measured"),
    false,
  );
  for (const experiment of experiments) {
    const mode = modes.find((m) => m.id === experiment.id);
    assert.deepEqual(experiment.title, pair(mode.name));
    assert.deepEqual(experiment.description, pair(mode.subtitle));
    assert.deepEqual(experiment.learningObjectives, [
      pair(investigations[mode.id].observation),
    ]);
    assert.deepEqual(
      experiment.observations[0].explanation,
      pair(investigations[mode.id].action),
    );
  }
});
test("unknown contexts cannot select an unauthored robot mode", () => {
  assert.equal(initialRoute("?mode=joints&lang=tr").mode, "joints");
  assert.equal(initialRoute("?mode=constructor&ils=bad").mode, "explore");
  assert.equal(
    initialRoute("?mode=joints&lesson=humanoid-systems").mode,
    "explore",
  );
});
