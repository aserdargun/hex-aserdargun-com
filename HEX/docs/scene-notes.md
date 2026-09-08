# Scene and web integration notes

## Coordinate and hierarchy contract

Blender uses metres, Z up, front −Y and anatomical left +X. glTF uses Y up, front +Z and left +X. The approximately human-sized envelope is a design choice, not a hardware specification.

`HEX_ROOT` owns a rigid kinematic hierarchy. The pelvis is the base; thigh → knee pivot → shin → ankle pivot → foot and shoulder → elbow pivot → forearm → wrist → hand preserve downstream articulation. Every joint output flange and mounting yoke belongs to its moving pivot, while the motor housing remains on the upstream link. Joint parents carry no nonuniform scale.

Blender collections organize BODY, STRUCTURE, ACTUATORS, TRANSMISSIONS, BEARINGS, SENSORS, POWER, COMPUTE, DATA_HARNESS, FX, ANCHORS, CAMERAS and STUDIO. Collections are organizational, while actual object parenting preserves mechanics. glTF node `extras` retain `category`, `region`, `lesson`, `stage`, and optional `explode`. `explode` is an installed-to-separated displacement in glTF world axes; the web converts it to parent space before interpolation. Nodes remain individually selectable.

Example IDs: `HEX_ACT_KNEE_L`, `HEX_GEAR_RING_KNEE_L`, `HEX_GEAR_SUN_KNEE_L`, `HEX_GEAR_PLANET_KNEE_L_1`, `HEX_GEAR_CARRIER_KNEE_L`, `HEX_BEARING_OUT_KNEE_L`, `HEX_ENCODER_KNEE_L`, `HEX_SENSOR_IMU_TORSO`, `HEX_SENSOR_CAM_L`, `HEX_FOOT_SENSOR_L_1`, `HEX_BATTERY_MAIN`, `HEX_COMPUTE_MAIN`, `HEX_CTRL_REALTIME`.

The manifest is generated from the master. It lists all 27 major rotational pivots and all semantic components. Simplified fingers are visual end-effectors, not an independently actuated hand model.

## Animation contract

Independent exported clips:

- `HEX_KNEE_FLEX`
- `HEX_ELBOW_FLEX`
- `HEX_CAMERA_SCAN`
- `HEX_EXPLODE_STRUCTURE` (removable shell group)
- `HEX_EXPLODE_ACTUATORS`
- `HEX_EXPLODE_SENSORS`
- `HEX_EXPLODE_POWER`
- `HEX_EXPLODE_COMPUTE`

In the master, NLA tracks are muted at rest. Unmute/solo one matching named track group to inspect it. glTF export explicitly uses `NLA_TRACKS` and merges identically named tracks into one clip. The export tests verify channel counts and target nodes. The web's angle slider rotates the same named pivot directly; progressive explosion uses the same displacement metadata instead of playing every clip together. Web lean/recovery and reach are authored procedural kinematics, not additional exported clips.

Do not play multiple joint/pose clips on the same transform without an explicit blend policy. Do not mix glTF animation playback with the web's direct pivot authoring on the same frame.

## Cameras and lighting

Thirteen named cameras: HERO_FRONT, HERO_BACK, FULL_SIDE, EXPLODED, TORSO, HEAD, SHOULDER, ELBOW, HIP, KNEE, ANKLE, FOOT, COMPUTE; each is prefixed `HEX_CAM_`. Cameras and the studio remain in the Blender master. The physical web export excludes the floor and lighting rig; the browser recreates soft key/fill, procedural environment reflections, contact shadow and grid. Web camera bookmarks are defined in `CameraRig`.

Nine renders are reproducible using `scripts/render_hex.py`. Material-isolation renders use a faint context frame so actuator, sensor, power and compute images remain distinct. The knee image has a landscape composition to include the complete separated cartridge. Blender's studio shaders use Principled materials; no external textures are required. `HEX/textures/` is intentionally empty because the asset has no texture dependency.

## Budget and delivery

The selected web budget is less than 8 MiB and fewer than 600 mesh nodes. The render loop is demand-driven except during active movement. Pixel ratio is capped at 1.6. Geometry and materials are reusable, small details are simplified, labels are progressive, and the main Three.js code is loaded separately from lesson UI. The higher-detail export increases bevel tessellation without changing semantic names. There is no automatic LOD switching in this MVP.

All geometry is original and generated locally. The reference UI image was generated with the built-in imagegen tool and is saved in `HEX/previews/design-concept.png`; it is not evidence of a manufactured robot or a production deployment.

## Educational boundary

Planetary tooth shapes are schematic; no validated contact or reduction ratio is claimed. Other joint cartridges simplify internal detail while preserving separate motor/reduction/bearing/encoder roles. Simplified harness routes communicate topology, not service loops, strain relief or a wiring specification. No thermal, structural or electrical safety analysis has been performed. Motion has no collision checking.

The body COM and ground CoP overlays are clearly labeled illustrative. They do not arise from mass properties or measured contact forces. A pose correction keeps the example feet aligned with the nominal contact surface; this is a geometric constraint, not a balance controller.

## ENG integration

The build is a self-contained teaching object with relative assets and links back to ENG. For a later ENG release, mount `dist` at the chosen route or integrate the React scene and content modules. `HEX_ANCHOR_*` nodes are ready for annotations. Preserve the public engineering curriculum relationship to WFM (world representations), ITL (digital twins) and EVL (evaluation). Standalone publication is documented in the repository README; a live ENG integration is a separate release.

## Expansion path

Add numerically verified mass/inertia, joint limits, transmission contact, inverse kinematics, collision handling and a physics engine before calling this a simulator or digital twin. Add hardware-specific ratings only with evidence and clear attribution. Walking, policy execution and sim-to-real are future work, not hidden capabilities of this MVP.
