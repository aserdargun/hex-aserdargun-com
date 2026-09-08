# HEX verification — 8 September 2026

## Delivered scope

This report records the local authoring verification before publication. The MVP includes an original Blender master, two valid GLBs, nine rendered views, bilingual responsive explorer, ten system modes, five joint anatomy views, eight exported clips and a twelve-chapter learning path. Production preview: http://127.0.0.1:4186. Development: http://127.0.0.1:5186. ENG repository integration is outside this release.

## Artifact validation

- `npm run validate:codex` passed: eight model/kinematics tests, Khronos glTF validation and TypeScript/Vite production build.
- Both GLBs: **0 errors, 0 warnings, 0 informational issues**, with no maximum-issue truncation. Machine-readable result: `docs/glb-validation.json`.
- Web GLB: 4,444,256 bytes, 595 named nodes, 531 meshes, 27 rotational pivots, 13 shared material definitions and eight clips. Unused UV attributes were removed because no textures are used.
- Tests verify metadata, anchors, knee anatomy, independent clip targets, complete actuator-map explosion, output/shin/foot parenting, binary consistency, budget and embedded buffers.
- Geometry tests verify that knee flexion moves the ankle behind the body and the authored reach places a fingertip within 18 mm of the target face. These are educational pose checks, not physical validation.
- Local production-preview HTTP checks returned 200 for HTML, script, CSS, favicon, GLB and hero image with correct content types, including `model/gltf-binary` and `image/webp`.

## Browser verification

Used the Codex in-app browser through CUA against development and the built preview. No Playwright Chromium fallback was needed. Checked 1280×720, 1440×1000, the 1536×1024 concept size, and 390×844 in EN/TR. Mobile content width was 375 px inside a 390 px viewport (scrollbar consumes the remainder); no horizontal document overflow. After correction, heading bottom was 262.4 px and controls began at 286 px.

Verified all ten mode headings/lessons, material isolation, overview → knee anatomy → separated components → manual flexion, all five joint selections, camera/body controls, explosion/reset, perception → task → reach, pose-preserving pause, manual balance progress, and all twelve guided chapters through completion. Sources dialog focus and Escape dismissal were checked. The learning overlay marks covered viewport controls inert. English/Turkish controls and lessons were exercised. No browser console errors or warnings were observed.

Reduced-motion handling and a WebGL failure boundary are implemented. OS media-preference emulation and deliberate GPU/context-loss testing were not performed. No low-end-device frame-rate claim is made.

## Visual review

Reference: `HEX/previews/design-concept.png`. Production desktop: `HEX/previews/explorer-desktop.png`. Mobile: `explorer-mobile.png` and `explorer-mobile-tr.png`. Anatomy: `knee-anatomy.png`.

The concept and final desktop screenshot were opened with `view_image` in the same review pass. Mobile and anatomy captures were also inspected. Compared: palette; masthead and numbered rail; large unboxed 3D viewport; lesson hierarchy and causal chain; explosion/reset controls; semantic callouts; responsive stacking.

The interface was verified against the concept's composition and visual system. Overview title, subtitle, mode labels, primary CTA and footer copy match. Intentional differences: the actual robot uses a reasoned, simplified original mechanical model instead of the concept image's dense surface detail; camera controls use a separate row to prevent headline collisions; body selection, source notes and motion controls extend the required surface. Typography adapts to available width. No identical-geometry or production-release claim is made.

Corrected during review: material isolation under React Strict Mode (scene/material cloning is now one isolated memo operation), mobile text/control overlap, knee direction, output parenting, missing GLB clips, cropped knee render, and unused UV payload. The browser's full-page mobile capture produced a stitching artifact; final mobile evidence uses viewport screenshots and separate DOM measurements.
