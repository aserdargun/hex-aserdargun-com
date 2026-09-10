# HEX — Humanoid Engineering Explorer

An original, bilingual interactive humanoid engineering learning object for the ENG curriculum. The actual Blender-authored GLB is the web experience; a rendered image is never substituted for the interactive robot.

## Run

Node 22.18+ and npm:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5186. Vite uses a strict, checkout-specific port; it will not stop another process. Stop this foreground process with Ctrl+C.

```sh
npm run validate:codex
npm run preview
```

The production artifact is `dist/`. It uses relative asset paths and can be hosted beneath an ENG path (for example `/hex/`) or as its own static site.

Live app: [hex.aserdargun.com](https://hex.aserdargun.com/).

Source and authoring files: [aserdargun/hex-aserdargun-com](https://github.com/aserdargun/hex-aserdargun-com). GitHub Actions validates each `main` commit and publishes the prebuilt `dist/` directory to Azure Static Web Apps Free. See [deployment details](docs/deployment.md) and [publication runs](https://github.com/aserdargun/hex-aserdargun-com/actions/workflows/deploy-swa-hex-aserdargun-com.yml). ENG integration is a separate step.

## Explore

- A searchable, keyboard-accessible catalogue of all 531 GLB components, available even if 3D cannot load.
- Ten engineering modes with actual material isolation, transparent context and component picking.
- Progressive assembled-to-exploded slider, camera bookmarks and body regions.
- Shoulder, elbow, hip, knee and ankle anatomy with joint-axis overlays, manual angle controls and animation.
- Sensor classes, named components, power/data paths, and source-linked lessons.
- Four perception stages; authored reach and lean/recovery sequences; closed-loop physical-AI explanation.
- A 12-chapter guided learning path, English/Turkish UI, reduced-motion manual controls, keyboard-accessible alternatives and a WebGL fallback.

## Authoring package

| File                           | Purpose                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `HEX/blender/HEX_Master.blend` | Editable master, categorized collections, kinematic parents, 13 cameras, studio, NLA clips |
| `HEX/export/HEX_Web.glb`       | Web model; same bytes as `public/models/HEX_Web.glb`                                       |
| `HEX/export/HEX_High.glb`      | Higher bevel tessellation; same semantic contract                                          |
| `HEX/renders/`                 | Hero, exploded, structure, actuation, sensors, power, compute, knee and balance            |
| `HEX/previews/`                | Design concept and verified browser previews                                               |
| `HEX/docs/scene-notes.md`      | Scene, animation, export and integration contract                                          |
| `HEX/docs/architecture.md`     | Mechanical architecture and educational assumptions                                        |
| `HEX/docs/model-manifest.json` | Generated object/region/layer manifest                                                     |

Blender 5.1.1 was used. Rebuild with the installed macOS Blender:

```sh
npm run model:build
npm run model:render
npm run model:catalogue
npm run validate:codex
```

On another platform run `blender --background --python scripts/build_hex.py`, then `blender --background HEX/blender/HEX_Master.blend --python scripts/render_hex.py`. No third-party humanoid asset is required. Geometry, materials and animations are authored deterministically in the script. The UI concept was created with the built-in imagegen tool; it is a design reference, not an engineering model.

## Technical structure

`src/data/content.ts` owns bilingual modes, lessons, joints, references and chapters. `src/scene/RobotScene.tsx` owns model loading, material isolation, camera interpolation, kinematics and teaching overlays. Focused React components handle lessons, source information and the fallback. Fonts are bundled locally. No API key or backend is needed.

Animations are kinematic teaching aids. There is no dynamics simulation, trained policy, object recognizer or inverse-kinematics solver. Material grades, load limits, torque ratings, gear ratios, battery capacities and controller frequencies are deliberately unspecified. COM/CoP markers and the angle/progress controls are explicitly illustrative. See the in-app model notes and sources.

## Validation and recovery

`npm run validate:codex` checks the component catalogue against the exported GLB, runs motion/content/model tests, validates both GLBs, checks TypeScript, and verifies the production artifact. Pull requests run the same validation without deploying. After re-exporting geometry, run `npm run model:catalogue` to refresh the generated component registry.

Playback pauses when the page is hidden, model notes or the learning path open, or reduced motion is enabled. Manual angle/progress controls remain available. Failed GLB requests and lost WebGL contexts show an explicit fallback; retry clears the failed model cache and recreates the scene. Lessons and component selection remain usable throughout.

`dist/release.json` explicitly versions the release schema and educational motion model, and records the source SHA, whether the checkout contained uncommitted changes, and SHA-256 hashes of the entry document, model and hosting configuration. A local build with `sourceDirty: true` does not represent the unchanged committed release.
