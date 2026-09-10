import test from "node:test";
import assert from "node:assert/strict";
import {
  jointAngle,
  jointPhase,
  jointLimit,
  sequenceDuration,
  sequenceProgress,
  BALANCE_DURATION,
} from "../src/core/motion.ts";

test("Pausing and resuming joint motion preserves angle and direction on both half cycles", () => {
  for (const joint of ["KNEE_L", "ANKLE_L", "HIP_L", "SHOULDER_L", "ELBOW_L"]) {
    for (const phase of [0.4, 1.4, 2.4, 3.6, 6.4]) {
      const angle = jointAngle(phase, joint);
      const resumed = jointPhase(angle, joint, phase);
      assert.ok(Math.abs(jointAngle(resumed, joint) - angle) < 1e-10);
      assert.equal(
        Math.sign(jointAngle(resumed + 0.01, joint) - angle),
        Math.sign(jointAngle(phase + 0.01, joint) - angle),
      );
    }
  }
});
test("Joint seeking clamps invalid values to the illustrative range", () => {
  for (const value of [-100, 10000, NaN, Infinity]) {
    const phase = jointPhase(value, "ANKLE_L");
    assert.ok(Number.isFinite(phase));
    assert.ok(jointAngle(phase, "ANKLE_L") <= jointLimit("ANKLE_L"));
  }
});
test("Balance progress round-trips without a pose jump after repeated cycles", () => {
  for (const phase of [1, 5, 10, 60, 120]) {
    const restored =
      (sequenceProgress(phase, "balance") / 100) * sequenceDuration("balance");
    assert.ok(
      Math.abs(Math.cos(phase * 1.1) - Math.cos(restored * 1.1)) < 1e-10,
    );
  }
  assert.ok(Math.abs(Math.cos(BALANCE_DURATION * 1.1) - 1) < 1e-10);
});
test("Reach has a bounded terminal state instead of wrapping back to its start", () => {
  assert.equal(sequenceProgress(0, "reach"), 0);
  assert.equal(sequenceProgress(sequenceDuration("reach") / 2, "reach"), 50);
  assert.equal(sequenceProgress(sequenceDuration("reach") + 20, "reach"), 100);
});
