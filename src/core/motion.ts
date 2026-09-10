/** Educational motion only; these values are not hardware limits. */
export const MOTION_VERSION = 1;
export const BALANCE_DURATION = (2 * Math.PI) / 1.1;
export const REACH_DURATION = 2.5;
const JOINT_SPEED = 1.6;
export const clamp = (value: number, max: number) =>
  Math.max(0, Math.min(Number.isFinite(value) ? value : 0, max));
export function jointLimit(joint: string) {
  if (joint.startsWith("ANKLE")) return 20;
  if (joint.startsWith("HIP")) return 35;
  if (joint.startsWith("SHOULDER")) return 60;
  return 65;
}
export function jointAngle(phase: number, joint: string) {
  return ((1 - Math.cos(phase * JOINT_SPEED)) / 2) * jointLimit(joint);
}
export function jointPhase(angle: number, joint: string, previousPhase = 0) {
  const phase = Math.acos(
    1 - (2 * clamp(angle, jointLimit(joint))) / jointLimit(joint),
  );
  // Preserve the direction when pausing on the return half of a cycle.
  return (
    (Math.sin(previousPhase * JOINT_SPEED) < 0 ? 2 * Math.PI - phase : phase) /
    JOINT_SPEED
  );
}
export function sequenceDuration(behavior: string) {
  return behavior === "reach" ? REACH_DURATION : BALANCE_DURATION;
}
export function sequenceProgress(phase: number, behavior: string) {
  const duration = sequenceDuration(behavior);
  return (
    ((behavior === "reach"
      ? clamp(phase, duration)
      : ((phase % duration) + duration) % duration) /
      duration) *
    100
  );
}
