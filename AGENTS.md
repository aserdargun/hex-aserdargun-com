# HEX working contract

- Build the bilingual interactive humanoid engineering learning object that serves the ENG curriculum, with the Blender-authored GLB as the single source of model truth.
- Keep engineering truth in `HEX/blender/HEX_Master.blend` and `src/scene/RobotScene.tsx`; `src/data/content.ts` owns bilingual modes, lessons, joints, references and chapters. A rendered image is never a substitute for the interactive robot. No dynamics simulation, no trained policy, no inverse-kinematics solver — animations are kinematic teaching aids.
- A learner receives local observations only: visible joint axes, picked materials, slider state, manual angle controls, and selected teaching overlays. COM/CoP markers and the angle/progress controls are explicitly illustrative; they are not engineering claims and must not feed back as decision input.
- Behavior, experiment, world, simulation, metric, and export schema versions are explicit. Update affected versions when semantics change.
- The web model (`HEX/export/HEX_Web.glb` mirrored to `public/models/HEX_Web.glb`) and the higher-tessellation variant (`HEX/export/HEX_High.glb`) share a single semantic contract. `npm run model:validate` (gltf-validator) and `scripts/verify-artifact.mjs` reject invalid or unsupported exports before any build is handed off.
- Keep Turkish and English controls and explanations equivalent. Label model assumptions and engineering units; do not invent material grades, load limits, torque ratings, gear ratios, battery capacities or controller frequencies.
- Verify `npm run validate:codex` and review `git diff --check` before handoff.
- Local work only unless the user authorizes external publication. Preserve unrelated work and processes.
