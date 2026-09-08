import { Suspense, useEffect, useMemo, useRef } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  Line,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import { joints, modes, t, type Lang, type Mode } from "../data/content";

export interface SceneProps {
  mode: Mode;
  lang: Lang;
  explode: number;
  joint: string;
  angle: number;
  playing: boolean;
  behavior: "stand" | "balance" | "reach";
  perception: number;
  body: string;
  view: "front" | "back" | "side";
  reset: number;
  selected: string | null;
  reducedMotion: boolean;
  onSelect: (lesson: string, name: string) => void;
  onReady: () => void;
  onTarget: () => void;
  onSample: (value: number) => void;
  onComplete: () => void;
}
type Part = {
  mesh: THREE.Mesh;
  rest: THREE.Vector3;
  delta: THREE.Vector3;
  material: THREE.MeshStandardMaterial;
  baseColor: THREE.Color;
  category: string;
  region: string;
  stage: number;
  lesson: string;
};
const BASE = import.meta.env.BASE_URL;
function Model(props: SceneProps) {
  const gltf = useGLTF(BASE + "models/HEX_Web.glb");
  const invalidate = useThree((s) => s.invalidate);
  const { root, parts } = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.updateMatrixWorld(true);
    const parts: Part[] = [];
    root.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      const mat = (o.material as THREE.MeshStandardMaterial).clone();
      o.material = mat;
      o.castShadow = true;
      o.receiveShadow = true;
      const d = o.userData;
      const delta = new THREE.Vector3(
        ...((d.explode || [0, 0, 0]) as [number, number, number]),
      );
      if (o.parent)
        delta.applyQuaternion(
          o.parent.getWorldQuaternion(new THREE.Quaternion()).invert(),
        );
      parts.push({
        mesh: o,
        rest: o.position.clone(),
        delta,
        material: mat,
        baseColor: mat.color.clone(),
        category: d.category,
        region: d.region,
        stage: d.stage || 0,
        lesson: d.lesson,
      });
    });
    return { root, parts };
  }, [gltf.scene]);
  const pivots = useMemo(() => {
    const m: Record<string, THREE.Object3D> = {};
    root.traverse((o) => {
      if (o.name.startsWith("HEX_PIVOT_"))
        m[o.name.replace("HEX_PIVOT_", "")] = o;
    });
    return m;
  }, [root]);
  const initialRot = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(pivots).map(([k, v]) => [k, v.quaternion.clone()]),
      ),
    [pivots],
  );
  const clock = useRef(0);
  const neutralFeet = useMemo(
    () =>
      ["L", "R"].map((side) =>
        pivots["ANKLE_ROLL_" + side].getWorldPosition(new THREE.Vector3()),
      ),
    [pivots],
  );
  useEffect(() => {
    props.onReady();
    return () => {
      parts.forEach((p) => p.material.dispose());
    };
  }, [parts]); // GLTF geometry is cached and shared.
  useEffect(() => {
    const cats = modes.find((m) => m.id === props.mode)!.categories;
    for (const p of parts) {
      const focused = props.body === "all" || p.region === props.body;
      let alpha = 1;
      if (cats.length && !cats.includes(p.category))
        alpha = p.category === "body" ? 0.075 : 0.16;
      if (props.mode === "structure" && p.category === "body") alpha = 0.035;
      if (props.mode === "joints") {
        const region =
          props.joint.includes("SHOULDER") || props.joint.includes("ELBOW")
            ? "arm-l"
            : "leg-l";
        if (p.region !== region) alpha = 0.09;
        else if (p.category === "body") alpha = 0.08;
      }
      if (!focused) alpha = Math.min(alpha, 0.055);
      p.material.color.copy(p.baseColor);
      p.material.emissive.set("#000000");
      if (props.selected === p.mesh.name) {
        p.material.color.set("#d94d2e");
        p.material.emissive.set("#3d1004");
        alpha = 1;
      }
      p.material.transparent = alpha < 1;
      p.material.opacity = alpha;
      p.material.depthWrite = alpha > 0.5;
      p.mesh.castShadow = alpha > 0.5;
      p.mesh.raycast = alpha > 0.2 ? THREE.Mesh.prototype.raycast : () => {};
      p.material.needsUpdate = true;
    }
    invalidate();
  }, [props.mode, props.body, props.selected, props.joint, parts, invalidate]);
  useEffect(() => {
    clock.current =
      props.mode === "behavior"
        ? (props.angle / 100) * (props.behavior === "reach" ? 2.5 : 5.7)
        : Math.acos(
            1 -
              (2 * props.angle) /
                (props.joint.includes("ANKLE")
                  ? 20
                  : props.joint.includes("HIP")
                    ? 35
                    : props.joint.includes("SHOULDER")
                      ? 60
                      : 65),
          ) / 1.6;
    invalidate();
  }, [props.playing, props.behavior, props.mode, invalidate]);
  useEffect(() => {
    invalidate();
  }, [
    props.explode,
    props.angle,
    props.joint,
    props.reducedMotion,
    invalidate,
  ]);
  useFrame((_, dt) => {
    let moving = false;
    for (const p of parts) {
      let amount = THREE.MathUtils.clamp(props.explode - p.stage + 1, 0, 1);
      // Selected anatomy separates only its cartridge along the physical shaft.
      if (props.mode === "joints")
        amount =
          p.mesh.name.endsWith(props.joint) ||
          p.mesh.name.includes(props.joint + "_")
            ? props.explode / 8
            : 0;
      const target = p.rest.clone().addScaledVector(p.delta, amount);
      if (p.mesh.position.distanceToSquared(target) > 1e-8) {
        p.mesh.position.lerp(
          target,
          props.reducedMotion ? 1 : 1 - Math.exp(-dt * 12),
        );
        moving = true;
      }
    }
    Object.entries(pivots).forEach(([k, o]) =>
      o.quaternion.copy(initialRot[k]),
    );
    const rootNode = root.getObjectByName("HEX_ROOT");
    if (rootNode) {
      rootNode.rotation.set(0, 0, 0);
      rootNode.position.set(0, 0, 0);
    }
    const turn = (key: string, axis: "x" | "y" | "z", value: number) => {
      const o = pivots[key];
      if (o)
        o.rotateOnAxis(
          new THREE.Vector3(
            axis === "x" ? 1 : 0,
            axis === "y" ? 1 : 0,
            axis === "z" ? 1 : 0,
          ),
          value,
        );
    };
    if (props.playing && !props.reducedMotion)
      clock.current += Math.min(dt, 0.05);
    const phase =
      props.playing && !props.reducedMotion
        ? clock.current
        : (props.angle / 100) * (props.behavior === "reach" ? 2.5 : 5.7);
    if (props.mode === "joints") {
      const max = props.joint.includes("ANKLE")
        ? 20
        : props.joint.includes("HIP")
          ? 35
          : props.joint.includes("SHOULDER")
            ? 60
            : 65;
      const a =
        props.playing && !props.reducedMotion
          ? (1 - Math.cos(phase * 1.6)) * 0.5 * max
          : props.angle;
      turn(
        props.joint,
        "x",
        THREE.MathUtils.degToRad(a) * (props.joint.includes("KNEE") ? 1 : -1),
      );
      props.onSample(a);
    }
    if (props.mode === "behavior") {
      if (props.behavior === "balance") {
        const lean = (1 - Math.cos(phase * 1.1)) * 0.045;
        // In-place teaching pose: feet remain grounded; ankle/hip links illustrate correction.
        if (rootNode) rootNode.rotation.x = lean;
        ["L", "R"].forEach((s) => {
          turn("ANKLE_" + s, "x", -lean);
          turn("HIP_" + s, "x", -lean * 0.3);
          turn("KNEE_" + s, "x", lean * 0.3);
        });
        root.updateMatrixWorld(true);
        const correction = new THREE.Vector3();
        ["L", "R"].forEach((side, i) =>
          correction.add(
            neutralFeet[i]
              .clone()
              .sub(
                pivots["ANKLE_ROLL_" + side].getWorldPosition(
                  new THREE.Vector3(),
                ),
              ),
          ),
        );
        if (rootNode) rootNode.position.addScaledVector(correction, 0.5);
      } else if (props.behavior === "reach") {
        const a = (1 - Math.cos((Math.min(phase, 2.5) / 2.5) * Math.PI)) * 0.5;
        turn("SHOULDER_L", "x", -a * 0.95);
        turn("ELBOW_L", "x", -a * 0.42);
        turn("WRIST_L", "x", a * 0.3);
      }
    }
    if (props.mode === "behavior")
      props.onSample(
        props.behavior === "reach"
          ? (Math.min(phase, 2.5) / 2.5) * 100
          : ((phase % 5.7) / 5.7) * 100,
      );
    if (
      props.mode === "behavior" &&
      props.behavior === "reach" &&
      props.playing &&
      phase >= 2.5
    )
      props.onComplete();
    if (moving || (props.playing && !props.reducedMotion)) invalidate();
  });
  const select = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 4) return;
    e.stopPropagation();
    const mesh = e.object;
    props.onSelect(mesh.userData.lesson || "structure", mesh.name);
  };
  return (
    <>
      <primitive
        object={root}
        onClick={select}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      />
      {props.mode === "behavior" && props.behavior === "balance" && (
        <MovingCOM root={root} />
      )}
      {props.mode === "joints" &&
        props.explode > 3 &&
        [
          ["HEX_ACT_" + props.joint, ["Motor", "Motor"]],
          [
            (root.getObjectByName("HEX_GEAR_RING_" + props.joint)
              ? "HEX_GEAR_RING_"
              : "HEX_GEAR_") + props.joint,
            ["Reduction", "Redüktör"],
          ],
          ["HEX_BEARING_OUT_" + props.joint, ["Bearing", "Rulman"]],
          ["HEX_ENCODER_" + props.joint, ["Encoder", "Enkoder"]],
        ].map(([name, label], i) => {
          const o = root.getObjectByName(name as string);
          return o ? (
            <PartLabel
              key={name as string}
              object={o}
              label={t(label as [string, string], props.lang)}
              index={i}
              onClick={() =>
                props.onSelect(
                  i === 0
                    ? props.joint.toLowerCase().split("_")[0]
                    : i === 1
                      ? "transmission"
                      : i === 2
                        ? "bearings"
                        : "encoder",
                  name as string,
                )
              }
            />
          ) : null;
        })}
    </>
  );
}

function MovingCOM({ root }: { root: THREE.Group }) {
  const marker = useRef<THREE.Mesh>(null);
  const ground = useRef<THREE.Mesh>(null);
  const line = useRef<THREE.Line>(null);
  const geom = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.94, 0),
        new THREE.Vector3(0, 0.008, 0),
      ]),
    [],
  );
  useFrame(() => {
    const body = root.getObjectByName("HEX_ROOT");
    if (!body || !marker.current) return;
    const p = body.localToWorld(new THREE.Vector3(0, 0.94, 0));
    marker.current.position.copy(p);
    const attr = geom.getAttribute("position");
    attr.setXYZ(0, p.x, p.y, p.z);
    attr.setXYZ(1, p.x, 0.008, p.z);
    attr.needsUpdate = true;
    if (ground.current) ground.current.position.z = p.z * 0.7 + 0.04;
  });
  return (
    <>
      <mesh ref={marker}>
        <sphereGeometry args={[0.022, 16, 12]} />
        <meshBasicMaterial color="#d94d2e" depthTest={false} />
      </mesh>
      <primitive
        ref={line}
        object={useMemo(
          () =>
            new THREE.Line(
              geom,
              new THREE.LineBasicMaterial({
                color: "#d94d2e",
                transparent: true,
                opacity: 0.6,
                depthTest: false,
              }),
            ),
          [geom],
        )}
      />
      <mesh
        ref={ground}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0.02, 0.01, 0.04]}
      >
        <ringGeometry args={[0.013, 0.02, 24]} />
        <meshBasicMaterial color="#397785" depthTest={false} />
      </mesh>
    </>
  );
}

function PartLabel({
  object,
  label,
  index,
  onClick,
}: {
  object: THREE.Object3D;
  label: string;
  index: number;
  onClick: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const center = useMemo(() => {
    if (object instanceof THREE.Mesh) {
      object.geometry.computeBoundingBox();
      return object.geometry.boundingBox!.getCenter(new THREE.Vector3());
    }
    return new THREE.Vector3();
  }, [object]);
  useFrame(() => {
    if (group.current) {
      group.current.position.copy(object.localToWorld(center.clone()));
      group.current.position.y += index % 2 === 0 ? 0.105 : -0.105;
    }
  });
  return (
    <group ref={group}>
      <Html center zIndexRange={[20, 10]}>
        <button className="part-label" onClick={onClick}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          {label}
        </button>
      </Html>
    </group>
  );
}

function CameraRig({
  mode,
  joint,
  view,
  reset,
  explode,
  reducedMotion,
}: SceneProps) {
  const controls = useRef<OrbitImpl>(null);
  const { camera, invalidate } = useThree();
  const goal = useRef({
    position: new THREE.Vector3(0.95, 1.15, 3.4),
    target: new THREE.Vector3(0, 0.84, 0),
  });
  const transitioning = useRef(true);
  useEffect(() => {
    const target = new THREE.Vector3(0, 0.83, 0);
    let dist = 3.05;
    if (mode === "joints") {
      target.fromArray(joints.find((j) => j.id === joint)!.position);
      target.x += 0.18;
      dist = 1.55;
    }
    if (mode === "perception") {
      target.set(0.03, 0.88, 0.2);
      dist = 3.55;
    }
    if (explode > 1 && mode !== "joints") dist = 3.65;
    const offset =
      view === "back"
        ? new THREE.Vector3(-dist * 0.36, 0.32, -dist)
        : view === "side"
          ? new THREE.Vector3(dist, 0.18, 0)
          : new THREE.Vector3(dist * 0.31, 0.23, dist);
    goal.current = { position: target.clone().add(offset), target };
    transitioning.current = true;
    invalidate();
  }, [mode, joint, view, reset, explode > 1, reducedMotion, invalidate]);
  useFrame((_, dt) => {
    const c = controls.current;
    if (!c || !transitioning.current) return;
    const a = reducedMotion ? 1 : 1 - Math.exp(-dt * 7);
    camera.position.lerp(goal.current.position, a);
    c.target.lerp(goal.current.target, a);
    c.update();
    if (camera.position.distanceTo(goal.current.position) < 0.003) {
      transitioning.current = false;
    } else invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      minDistance={0.35}
      maxDistance={6}
      maxPolarAngle={Math.PI * 0.51}
      enablePan
      enableDamping
      dampingFactor={0.12}
      onStart={() => {
        transitioning.current = false;
      }}
    />
  );
}
const Callout = ({
  position,
  label,
  onClick,
}: {
  position: [number, number, number];
  label: string;
  onClick: () => void;
}) => (
  <Html position={position} center distanceFactor={2.4} zIndexRange={[20, 10]}>
    <button className="model-callout" onClick={onClick}>
      <span />
      {label}
    </button>
  </Html>
);
function TeachingOverlays(p: SceneProps) {
  const isBalance = p.mode === "behavior" && p.behavior === "balance";
  const joint = joints.find((j) => j.id === p.joint)!;
  const loopRef = useRef<THREE.Mesh>(null);
  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.99, 0),
        new THREE.Vector3(-0.12, 1.2, 0),
        new THREE.Vector3(0.23, 1.35, 0),
        new THREE.Vector3(0.24, 1.03, 0),
        new THREE.Vector3(0.1, 0.8, 0),
        new THREE.Vector3(0.1, 0.49, 0),
        new THREE.Vector3(0.1, 0.14, 0),
      ]),
    [],
  );
  useFrame(({ clock }) => {
    if (loopRef.current)
      loopRef.current.position.copy(
        path.getPoint((clock.elapsedTime * 0.13) % 1),
      );
  });
  const wireMode =
    p.mode === "power" || p.mode === "compute" || p.mode === "control";
  const wireColor = p.mode === "power" ? "#c97029" : "#3c718f";
  return (
    <>
      {p.mode === "explore" && p.explode < 0.5 && (
        <>
          <Callout
            position={[0.29, 1.56, 0]}
            label={t(["Perception cameras", "Algı kameraları"], p.lang)}
            onClick={() => p.onSelect("camera", "HEX_SENSOR_CAM_L")}
          />
          <Callout
            position={[0.33, 0.49, 0.025]}
            label={t(["Knee actuator", "Diz eyleyicisi"], p.lang)}
            onClick={() => p.onSelect("knee", "HEX_ACT_KNEE_L")}
          />
        </>
      )}
      {p.mode === "joints" && (
        <group position={joint.position}>
          <Line
            points={[
              [-0.12, 0, 0],
              [0.72, 0, 0],
            ]}
            color="#cf5034"
            lineWidth={1.4}
            dashed
            dashSize={0.025}
            gapSize={0.017}
          />
          <Line
            points={Array.from({ length: 45 }, (_, i) => {
              const a = -Math.PI * 0.75 + (i / 44) * Math.PI * 1.5;
              return [0, Math.sin(a) * 0.12, Math.cos(a) * 0.12] as [
                number,
                number,
                number,
              ];
            })}
            color="#d94d2e"
            lineWidth={2}
          />
          {(p.joint.includes("HIP") || p.joint.includes("SHOULDER")) && (
            <>
              <Line
                points={[
                  [0, -0.14, 0],
                  [0, 0.19, 0],
                ]}
                color="#49877d"
                lineWidth={1.5}
              />
              <Line
                points={[
                  [0, 0, -0.17],
                  [0, 0, 0.2],
                ]}
                color="#537fa0"
                lineWidth={1.5}
              />
              <Html position={[0, 0.22, 0]} center>
                <span className="axis-label">
                  {t(["YAW", "SAPMA"], p.lang)}
                </span>
              </Html>
              <Html position={[0, 0, 0.24]} center>
                <span className="axis-label">
                  {t(["ROLL", "YUVARLANMA"], p.lang)}
                </span>
              </Html>
            </>
          )}
          {p.joint.includes("ANKLE") && (
            <Line
              points={[
                [0, 0, -0.14],
                [0, 0, 0.19],
              ]}
              color="#537fa0"
              lineWidth={1.5}
            />
          )}
          <Html position={[0.52, 0.11, 0]} center>
            <span className="axis-label rotation-label">
              {t(["ROTATION AXIS", "DÖNME EKSENİ"], p.lang)}
            </span>
          </Html>
        </group>
      )}
      {wireMode && (
        <>
          <Line
            points={path.getPoints(50)}
            color={wireColor}
            lineWidth={2}
            transparent
            opacity={0.8}
          />
          <Line
            points={[
              [0, 1.0, 0],
              [0, 1.2, -0.08],
              [0, 1.32, -0.09],
              [0, 1.58, 0.04],
            ]}
            color={wireColor}
            lineWidth={2}
            dashed
            dashSize={0.025}
            gapSize={0.015}
          />
          <mesh ref={loopRef}>
            <sphereGeometry args={[0.012, 12, 8]} />
            <meshBasicMaterial color={wireColor} />
          </mesh>
          <Callout
            position={[-0.16, 1.03, 0.07]}
            label={t(
              p.mode === "power"
                ? ["Battery → distribution", "Batarya → dağıtım"]
                : ["Data ↔ controllers", "Veri ↔ kontrolcüler"],
              p.lang,
            )}
            onClick={() =>
              p.onSelect(
                p.mode === "power" ? "battery" : "compute",
                p.mode === "power" ? "HEX_BATTERY_MAIN" : "HEX_COMPUTE_MAIN",
              )
            }
          />
        </>
      )}
      {p.mode === "sensors" && (
        <>
          <Callout
            position={[0.25, 1.58, 0.03]}
            label="HEX-CAM-L / R"
            onClick={() => p.onSelect("camera", "HEX_SENSOR_CAM_L")}
          />
          <Callout
            position={[-0.15, 1.163, 0.05]}
            label="HEX-IMU-TORSO"
            onClick={() => p.onSelect("imu", "HEX_SENSOR_IMU_TORSO")}
          />
          <Callout
            position={[0.3, 0.05, 0.1]}
            label="HEX-FOOT-L"
            onClick={() => p.onSelect("foot", "HEX_FOOT_SENSOR_L_1")}
          />
        </>
      )}
      {isBalance && (
        <>
          <mesh position={[0, 0.003, 0.035]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.342, 0.24]} />
            <meshBasicMaterial
              color="#6b9686"
              transparent
              opacity={0.18}
              depthWrite={false}
            />
          </mesh>
          <Line
            points={[
              [-0.171, 0.006, -0.085],
              [0.171, 0.006, -0.085],
              [0.171, 0.006, 0.155],
              [-0.171, 0.006, 0.155],
              [-0.171, 0.006, -0.085],
            ]}
            color="#4d8170"
            lineWidth={1.4}
          />

          <Html position={[-0.25, 0.02, 0.03]} center>
            <span className="axis-label">
              {t(["Support polygon", "Destek çokgeni"], p.lang)}
            </span>
          </Html>
        </>
      )}
      {(p.mode === "perception" ||
        (p.mode === "behavior" && p.behavior === "reach")) && (
        <>
          <group position={[0.235, 1.058, 0.674]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                p.onTarget();
              }}
            >
              <boxGeometry args={[0.115, 0.115, 0.115]} />
              <meshStandardMaterial color="#c76d37" roughness={0.5} />
            </mesh>
            {p.perception > 0 && (
              <Html position={[0, 0.1, 0]} center>
                <button className="target-label" onClick={p.onTarget}>
                  {t(["Select reach target", "Uzanma hedefini seç"], p.lang)}
                </button>
              </Html>
            )}
          </group>
          <mesh position={[-0.35, 0.12, 0.7]}>
            <boxGeometry args={[0.22, 0.24, 0.15]} />
            <meshStandardMaterial color="#89958d" />
          </mesh>
          {p.mode === "perception" && (
            <>
              {[
                [-0.48, 0.05, 1.12],
                [0.53, 0.05, 1.12],
                [0.53, 1.27, 1.12],
                [-0.48, 1.27, 1.12],
              ].map((v, i) => (
                <Line
                  key={i}
                  points={[[0, 1.58, 0.1], v as [number, number, number]]}
                  color="#6b9599"
                  transparent
                  opacity={0.4}
                  lineWidth={1}
                />
              ))}
              <Line
                points={[
                  [-0.48, 0.05, 1.12],
                  [0.53, 0.05, 1.12],
                  [0.53, 1.27, 1.12],
                  [-0.48, 1.27, 1.12],
                  [-0.48, 0.05, 1.12],
                ]}
                color="#6b9599"
                transparent
                opacity={0.45}
              />
              {p.perception >= 2 && (
                <Html position={[-0.35, 0.34, 0.7]} center>
                  <span className="axis-label">
                    {t(["Possible obstacle", "Olası engel"], p.lang)}
                  </span>
                </Html>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
function Loading({ lang }: { lang: Lang }) {
  return (
    <Html center>
      <div className="scene-loading">
        <span className="loading-symbol">H</span>
        {t(["Assembling HEX…", "HEX hazırlanıyor…"], lang)}
      </div>
    </Html>
  );
}
export default function RobotScene(props: SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      frameloop="demand"
      camera={{ position: [0.95, 1.07, 3.4], fov: 34, near: 0.01, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor("#f4f5f2", 0);
      }}
    >
      <fog attach="fog" args={["#f4f5f2", 5, 11]} />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#fafbff", "#818b81", 1.1]} />
      <directionalLight
        position={[-2, 4, 3]}
        intensity={3}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[3, 3, -2]} intensity={2.2} />
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          intensity={3}
          position={[-2, 3, 3]}
          scale={[4, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          position={[3, 1, 2]}
          scale={[2, 4, 1]}
        />
        <Lightformer
          form="rect"
          intensity={3}
          position={[0, 3, -3]}
          rotation={[0, Math.PI, 0]}
          scale={[3, 3, 1]}
        />
      </Environment>
      <Suspense fallback={<Loading lang={props.lang} />}>
        <Model {...props} />
        <TeachingOverlays {...props} />
      </Suspense>
      <gridHelper
        args={[16, 80, "#d9ddda", "#e1e4e0"]}
        position={[0, -0.012, 0]}
      />
      <ContactShadows
        position={[0, -0.009, 0]}
        opacity={0.28}
        scale={5}
        blur={2.8}
        far={2.2}
        resolution={512}
        frames={1}
      />
      <CameraRig {...props} />
    </Canvas>
  );
}
