# HEX system architecture

HEX is a generic educational electric humanoid. It is an original, illustrative architecture, not a manufactured robot, validated CAD assembly, certified electrical design, or dynamics simulation.

## Morphology and kinematic tree

The modeling envelope is approximately 1.7 m tall. All dimensions are educational design choices. Feet → two-axis ankles → shins → one-axis knees → thighs → three-axis hips → pelvis → waist → torso. Each arm has three sequential shoulder axes, one elbow axis, and two wrist axes. The neck has yaw and pitch. The grippers are simplified end-effectors and excluded from the 27 major rotational DOFs. Left/right are the robot's anatomical left/right. Blender: Z up, front −Y, left +X. glTF: Y up, front +Z, left +X.

## Mechanical architecture

Aluminum-family rails and plates carry loads between bearing-supported joint housings. Steel-family output shafts and paired bearing locations support alignment and radial/axial reaction loads. Polymer covers expose rather than obscure the link architecture. Rubber-family soles establish ground contact. Material families are illustrative; no grade or strength is claimed.

Use one consistent transmission strategy: coaxial planetary reduction. The flagship knee explicitly separates an electric motor, input sun, three planets inside a fixed ring, output carrier, output bearing and encoder. Tooth profiles are schematic, not conjugate, and are not manufacturing geometry. Other joints use simplified cartridge representations. Hip/shoulder axes use serial offset cartridges, not one spherical motor. Distinct cartridge sizes represent packaging choices; no torque ratings or numerical reduction ratios are implied.

## Electronics and information

Pelvis/low-torso battery → BMS and distribution → limb motor drives → motors. A separate DC conversion branch powers main compute, realtime controller and sensors. Orange power routes and blue data routes are representative harness topology, not pin-level wiring. Main compute represents perception/planning; realtime compute represents state estimation and coordinated control; distributed drives represent commutation/current control. The layers have different timing needs; no fixed loop rate is claimed.

Head stereo camera pair, torso IMU, output encoders, ankle force/torque sensing, and four contact load regions per foot provide representative observations. An IMU measures angular velocity and specific force; orientation is estimated through fusion, not directly measured by an accelerometer. Motor current and temperature are conceptual monitoring channels.

## Educational motion

Rigid parented links articulate at named pivots. Knee and elbow flexion are reusable glTF clips. Lean/recover and reach are scripted kinematic teaching sequences. They do not solve dynamics, inverse kinematics, contacts or closed-loop control. Center-of-mass and center-of-pressure markers are illustrative, not computed mass/load results. The support polygon provides a static-contact intuition; dynamic balance also depends on momentum, friction, contact and available actuation.

## Learning and integration

The conceptual spine is materials → structure → mechanics → actuation → sensing → power → compute → perception → control → behavior. The physical-AI loop closes through the environment. ENG is the parent engineering curriculum; WFM explains world representations; ITL connects digital twins; EVL connects evaluation. The standalone relative-base web build can be mounted under an ENG path without changing the asset model.

## Scope

MVP: master scene, named hierarchy, GLB, assembled and exploded states, materials, structural skeleton, major actuators and sensors, battery and compute, camera bookmarks, selectable components, knee anatomy, reusable joint clips, responsive learning UI and hero renders. Additional educational overlays cover sensing, power/data routes, perception, feedback, reach and balance. Dynamic walking, validated gear contact, control simulation and verified hardware parameters are future work.
