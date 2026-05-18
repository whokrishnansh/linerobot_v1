import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ASSEMBLY_STEPS } from '../../data/assemblySteps';

// ─── Asset paths ─────────────────────────────────────────────────────────────
const MODELS = {
  arduino:    '/models/arduino_uno.glb',
  motor:      '/models/bo_battery_operated_motor.glb',
  ir:         '/models/infrared_sensor_ir_sensor.glb',
  l298n:      '/models/l298n_motor_driver.glb',
  breadboard: '/models/breadboard.glb',
  battery:    '/models/battery.glb',
  chassis:    '/models/lfr_chassis.glb',
  castor:     '/models/caster_wheel.glb',
};
Object.values(MODELS).forEach(u => useGLTF.preload(u));

// ─── GLB wrapper — fits the model into the exact target bounding box ─────────
// Per-axis scaling is deliberate: source aspect ratios vary wildly between
// GLBs, and the scene's spatial budget requires they fill specific target
// extents regardless of source proportions.
function GLBModel({ url, position = [0, 0, 0], size, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(url);

  const { cloned, scale, center } = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const wrapper = new THREE.Group();
    wrapper.rotation.set(rotation[0], rotation[1], rotation[2]);
    wrapper.add(c);
    wrapper.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(wrapper);
    const dims = new THREE.Vector3();
    box.getSize(dims);
    const ctr = new THREE.Vector3();
    box.getCenter(ctr);
    const sx = size[0] / (dims.x || 1);
    const sy = size[1] / (dims.y || 1);
    const sz = size[2] / (dims.z || 1);
    return { cloned: wrapper, scale: [sx, sy, sz], center: ctr };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, size[0], size[1], size[2], rotation[0], rotation[1], rotation[2]]);

  return (
    <group position={position}>
      <group
        scale={scale}
        position={[-center.x * scale[0], -center.y * scale[1], -center.z * scale[2]]}
      >
        <primitive object={cloned} />
      </group>
    </group>
  );
}

function GLBUniformModel({ url, position = [0, 0, 0], fit = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(url);

  const { cloned, scale, center } = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    c.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(c);
    const dims = new THREE.Vector3();
    box.getSize(dims);
    const ctr = new THREE.Vector3();
    box.getCenter(ctr);
    const s = fit / (Math.max(dims.x, dims.y, dims.z) || 1);
    return { cloned: c, scale: s, center: ctr };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, fit]);

  return (
    <group position={position} rotation={rotation}>
      <group
        scale={scale}
        position={[-center.x * scale, -center.y * scale, -center.z * scale]}
      >
        <primitive object={cloned} />
      </group>
    </group>
  );
}

// ─── Arced wire helper ───────────────────────────────────────────────────────
const WIRE_RADIUS = 0.010;
const TERMINAL_RADIUS = 0.028; // small "plug/connector" sphere at each wire end
function CurvedWire({ start, end, color, visible, arcHeight = 0.7, arcBias = 0.5, opacity = 1 }) {
  const geometry = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = new THREE.Vector3(
      s.x + (e.x - s.x) * arcBias,
      Math.max(s.y, e.y) + arcHeight,
      s.z + (e.z - s.z) * arcBias,
    );
    const curve = new THREE.CatmullRomCurve3([s, mid, e]);
    return new THREE.TubeGeometry(curve, 28, WIRE_RADIUS, 8, false);
  }, [start[0], start[1], start[2], end[0], end[1], end[2], arcHeight, arcBias]);

  if (!visible) return null;

  return (
    <group>
      <mesh geometry={geometry} renderOrder={opacity < 1 ? 1 : 0}>
        <meshStandardMaterial
          color={color}
          roughness={0.5}
          transparent={true}
          opacity={opacity}
          depthWrite={opacity > 0.98}
        />
      </mesh>
      {/* Terminal "plug" at each end so the wire visibly connects to the pad */}
      <mesh position={start} renderOrder={opacity < 1 ? 1 : 0}>
        <sphereGeometry args={[TERMINAL_RADIUS, 12, 10]} />
        <meshStandardMaterial
          color="#1F2937"
          roughness={0.65}
          metalness={0.2}
          transparent={true}
          opacity={opacity}
          depthWrite={opacity > 0.98}
        />
      </mesh>
      <mesh position={end} renderOrder={opacity < 1 ? 1 : 0}>
        <sphereGeometry args={[TERMINAL_RADIUS, 12, 10]} />
        <meshStandardMaterial
          color="#1F2937"
          roughness={0.65}
          metalness={0.2}
          transparent={true}
          opacity={opacity}
          depthWrite={opacity > 0.98}
        />
      </mesh>
    </group>
  );
}

// ─── Highlight box ───────────────────────────────────────────────────────────
function HighlightBox({ position, size, color }) {
  const meshRef = useRef();
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.08 + 0.07 * Math.sin(t.current * 2.8);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        transparent
        opacity={0.12}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Chassis (GLB) ───────────────────────────────────────────────────────────
function Chassis({ visible }) {
  if (!visible) return null;
  return (
    <GLBUniformModel
      url={MODELS.chassis}
      position={[0, 0.1, 0]}
      fit={4.25}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

// ─── BO Motor (GLB) + programmatic wheel ─────────────────────────────────────
function Motors({ visible }) {
  if (!visible) return null;
  return (
    <group>
      {[[-1.12], [1.12]].map(([z], idx) => (
        <group key={idx} position={[1.28, 0.2, z]}>
          <GLBModel url={MODELS.motor} size={[0.82, 0.46, 0.46]} />
          <mesh position={[0.52, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.31, 0.31, 0.13, 24]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
          <mesh position={[0.52, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.14, 16]} />
            <meshStandardMaterial color="#9CA3AF" metalness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Castor({ visible }) {
  if (!visible) return null;
  return (
    <GLBUniformModel
      url={MODELS.castor}
      position={[-1.68, 0.11, 0]}
      fit={0.32}
      rotation={[0, 0, 0]}
    />
  );
}

// ─── Arduino (GLB) ───────────────────────────────────────────────────────────
// Positioned in the +Z half of the chassis (rear). Long axis along Z.
function Arduino({ visible }) {
  if (!visible) return null;
  return (
    <GLBModel
      url={MODELS.arduino}
      position={[0.38, 0.36, 0.02]}
      size={[1.08, 0.2, 0.92]}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
}

// ─── Breadboard (GLB) ────────────────────────────────────────────────────────
// Positioned in the -Z half of the chassis (front-center). Long axis along Z.
function Breadboard({ visible }) {
  if (!visible) return null;
  return (
    <GLBModel
      url={MODELS.breadboard}
      position={[1.25, 0.275, 0.1]}
      size={[0.8, 0.1, 0.8]}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

function L298N({ visible }) {
  if (!visible) return null;
  return (
    <GLBModel
      url={MODELS.l298n}
      position={[-1.0, 0.4, 0.1]}
      size={[0.9, 0.36, 1.0]}
    />
  );
}

// ─── IR sensors (GLB) ────────────────────────────────────────────────────────
function IRSensors({ visible }) {
  if (!visible) return null;
  return (
    <group>
      {[[-0.55], [0.55]].map(([z], idx) => (
        <GLBModel
          key={idx}
          url={MODELS.ir}
          position={[-2.15, 0.19, z]}
          size={[0.75, 0.18, 0.4]}
          rotation={[0, Math.PI / 2, 0]}
        />
      ))}
    </group>
  );
}

// ─── Battery (GLB) ───────────────────────────────────────────────────────────
function Battery({ visible }) {
  if (!visible) return null;
  return (
    <GLBUniformModel
      url={MODELS.battery}
      position={[1.2, 0.46, 0.8]}
      fit={0.6}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
}

// ─── Terminal/pin coordinate tables ──────────────────────────────────────────
// Pin coordinates match the CURRENT world-space position of each component.
// Arduino at [0.38, 0.36, 0.02], size [1.08, 0.2, 0.92]
// L298N   at [-1.0, 0.4, 0.1], size [0.9, 0.36, 1.0] → x∈[-1.45, -0.55], y_top≈0.58, z∈[-0.4, 0.6]
// Breadboard at [1.25, 0.275, 0.1], size [0.8, 0.1, 0.8] → x∈[0.85, 1.65], y_top≈0.33, z∈[-0.3, 0.5]
// Motors at [1.28, 0.2, ±1.12], body faces the chassis at x≈0.95
// IR sensors at [-2.15, 0.19, ±0.55], inner edge at x≈-1.80
// Battery at [1.2, 0.46, 0.8], snap terminals on top face
const PINS = {
  // Arduino digital header on the -X edge of the board, pins on top surface
  ard: {
    vin: [-0.16, 0.48, -0.34],
    v5:  [-0.16, 0.48, -0.24],
    gnd: [-0.16, 0.48, -0.14],
    d2:  [-0.16, 0.48, -0.04],
    d3:  [-0.16, 0.48,  0.06],
    d5:  [-0.16, 0.48,  0.16],
    d6:  [-0.16, 0.48,  0.26],
    d8:  [-0.16, 0.48,  0.36],
    d9:  [-0.16, 0.48,  0.46],
    d10: [-0.16, 0.48,  0.56],
    d11: [-0.16, 0.48,  0.66],
  },
  // L298N: OUT screw block on +X edge (facing the motors),
  //        IN/EN pin header on -X edge (facing the Arduino),
  //        power screw terminals on top-right.
  l298n: {
    // OUT screw block sits low on the +X edge (at PCB level, not above)
    out1: [-0.55, 0.32, -0.32],
    out2: [-0.55, 0.32, -0.18],
    out3: [-0.55, 0.32,  0.18],
    out4: [-0.55, 0.32,  0.32],
    // IN/EN pin-header row is tall — spheres sit at top of pin-headers on the -X edge
    ena:  [-1.45, 0.44, -0.32],
    in1:  [-1.45, 0.44, -0.18],
    in2:  [-1.45, 0.44, -0.05],
    in3:  [-1.45, 0.44,  0.08],
    in4:  [-1.45, 0.44,  0.22],
    enb:  [-1.45, 0.44,  0.36],
    // Power terminal block on the +Z edge at PCB level
    v12:  [-1.30, 0.30,  0.55],
    gnd1: [-1.10, 0.30,  0.55],
  },
  // Motor wire pads — slightly inside the motor body (motor at [1.45, 0.22, ±1.4], body ±0.25 in each axis)
  mot: {
    leftA:  [0.94, 0.18,  1.02],
    leftB:  [0.94, 0.18,  1.22],
    rightA: [0.94, 0.18, -1.22],
    rightB: [0.94, 0.18, -1.02],
  },
  // IR sensor 3-pin headers on the inner (+X) edge of each module
  ir: {
    leftVcc:  [-1.80, 0.22, -0.48],
    leftGnd:  [-1.80, 0.22, -0.55],
    leftOut:  [-1.80, 0.22, -0.62],
    rightVcc: [-1.80, 0.22,  0.48],
    rightGnd: [-1.80, 0.22,  0.55],
    rightOut: [-1.80, 0.22,  0.62],
  },
  // Breadboard rails — two rails running along X on opposite Z edges of the top surface
  bb: {
    plusA:  [1.00, 0.35, -0.25],
    plusB:  [1.25, 0.35, -0.25],
    plusC:  [1.50, 0.35, -0.25],
    minusA: [1.00, 0.35,  0.45],
    minusB: [1.25, 0.35,  0.45],
    minusC: [1.50, 0.35,  0.45],
  },
  // Battery snap connector terminals — on the side face of the rotated battery
  // Battery at [1.2, 0.46, 0.8], rotated -90° on X, so terminals are on the "side" at y≈0.5, z≈0.5
  bat: {
    plus:  [1.15, 0.52, 0.50],
    minus: [1.25, 0.52, 0.50],
  },
};

// ─── Motor wiring: L298N OUT → motor terminals ───────────────────────────────
function MotorWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      {/* OUT1 → Left motor lead A (red) — high arc, biased toward motor side to route around platform */}
      <CurvedWire start={PINS.l298n.out1} end={PINS.mot.leftA} color="#DC2626" visible arcHeight={0.55} arcBias={0.75} opacity={opacity} />
      {/* OUT2 → Left motor lead B (black) */}
      <CurvedWire start={PINS.l298n.out2} end={PINS.mot.leftB} color="#0A0A0A" visible arcHeight={0.58} arcBias={0.75} opacity={opacity} />
      {/* OUT3 → Right motor lead A (red) */}
      <CurvedWire start={PINS.l298n.out3} end={PINS.mot.rightA} color="#DC2626" visible arcHeight={0.55} arcBias={0.75} opacity={opacity} />
      {/* OUT4 → Right motor lead B (black) */}
      <CurvedWire start={PINS.l298n.out4} end={PINS.mot.rightB} color="#0A0A0A" visible arcHeight={0.58} arcBias={0.75} opacity={opacity} />
    </group>
  );
}

// ─── Sensor wiring ───────────────────────────────────────────────────────────
// IR VCC → breadboard + rail, IR GND → breadboard − rail, IR OUT → Arduino D2/D3.
// Rails are fed from Arduino 5V / GND.
function SensorWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      {/* Signals */}
      <CurvedWire start={PINS.ir.leftOut}  end={PINS.ard.d2}       color="#FACC15" visible arcHeight={0.12} opacity={opacity} />
      <CurvedWire start={PINS.ir.rightOut} end={PINS.ard.d3}       color="#EAB308" visible arcHeight={0.13} opacity={opacity} />
      {/* VCC to + rail */}
      <CurvedWire start={PINS.ir.leftVcc}  end={PINS.bb.plusA}     color="#EF4444" visible arcHeight={0.10} opacity={opacity} />
      <CurvedWire start={PINS.ir.rightVcc} end={PINS.bb.plusC}     color="#EF4444" visible arcHeight={0.11} opacity={opacity} />
      {/* GND to − rail */}
      <CurvedWire start={PINS.ir.leftGnd}  end={PINS.bb.minusA}    color="#0A0A0A" visible arcHeight={0.09} opacity={opacity} />
      <CurvedWire start={PINS.ir.rightGnd} end={PINS.bb.minusC}    color="#0A0A0A" visible arcHeight={0.10} opacity={opacity} />
      {/* Rails fed from Arduino */}
      <CurvedWire start={PINS.ard.v5}      end={PINS.bb.plusB}     color="#EF4444" visible arcHeight={0.08} opacity={opacity} />
      <CurvedWire start={PINS.ard.gnd}     end={PINS.bb.minusB}    color="#0A0A0A" visible arcHeight={0.08} opacity={opacity} />
    </group>
  );
}

// ─── Control signals: Arduino D5–D8 → L298N IN1–IN4 ──────────────────────────
function ControlWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      {/* ENA ↔ D5 (PWM) */}
      <CurvedWire start={PINS.ard.d5}  end={PINS.l298n.ena} color="#A855F7" visible arcHeight={0.25} arcBias={0.35} opacity={opacity} />
      {/* ENB ↔ D6 (PWM) */}
      <CurvedWire start={PINS.ard.d6}  end={PINS.l298n.enb} color="#22C55E" visible arcHeight={0.28} arcBias={0.35} opacity={opacity} />
      {/* IN1 ↔ D8 */}
      <CurvedWire start={PINS.ard.d8}  end={PINS.l298n.in1} color="#3B82F6" visible arcHeight={0.22} arcBias={0.35} opacity={opacity} />
      {/* IN2 ↔ D9 */}
      <CurvedWire start={PINS.ard.d9}  end={PINS.l298n.in2} color="#F97316" visible arcHeight={0.25} arcBias={0.35} opacity={opacity} />
      {/* IN3 ↔ D10 */}
      <CurvedWire start={PINS.ard.d10} end={PINS.l298n.in3} color="#EC4899" visible arcHeight={0.28} arcBias={0.35} opacity={opacity} />
      {/* IN4 ↔ D11 */}
      <CurvedWire start={PINS.ard.d11} end={PINS.l298n.in4} color="#14B8A6" visible arcHeight={0.30} arcBias={0.35} opacity={opacity} />
    </group>
  );
}

// ─── Power wiring ────────────────────────────────────────────────────────────
//   Battery +  → L298N 12V
//   Battery −  → L298N GND
//   Arduino VIN → Battery +  (Arduino powered from battery, 7–12V)
//   Arduino GND → L298N GND  (common ground required for signal integrity)
function PowerWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      {/* Battery + → L298N +12V — long wire from battery to L298N, arc up and over */}
      <CurvedWire start={PINS.bat.plus}   end={PINS.l298n.v12}  color="#EF4444" visible arcHeight={0.65} arcBias={0.20} opacity={opacity} />
      {/* Battery − → L298N GND */}
      <CurvedWire start={PINS.bat.minus}  end={PINS.l298n.gnd1} color="#0A0A0A" visible arcHeight={0.68} arcBias={0.20} opacity={opacity} />
      {/* Arduino VIN → Battery + (7–12V supply) — shorter wire, arc over Arduino */}
      <CurvedWire start={PINS.ard.vin}    end={PINS.bat.plus}   color="#EF4444" visible arcHeight={0.35} arcBias={0.60} opacity={opacity} />
      {/* Arduino GND → L298N GND (common ground) — wire across the chassis */}
      <CurvedWire start={PINS.ard.gnd}    end={PINS.l298n.gnd1} color="#0A0A0A" visible arcHeight={0.30} arcBias={0.40} opacity={opacity} />
    </group>
  );
}

function Track({ visible }) {
  if (!visible) return null;
  return (
    <group position={[0, -0.16, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#E8E4D8" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[TRACK_RADIUS, 0.07, 14, 120]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>
    </group>
  );
}

const HIGHLIGHT_MAP = {
  chassis:    { position: [0, 0.27, 0],       size: [4.45, 0.34, 4.45] },
  motor:      { position: [1.28, 0.28, 0],    size: [1.55, 0.62, 2.65] },
  castor:     { position: [-1.68, 0.14, 0],   size: [0.36, 0.34, 0.36] },
  arduino:    { position: [0.38, 0.47, 0.02], size: [1.2, 0.34, 1.0] },
  breadboard: { position: [1.25, 0.34, 0.1],  size: [0.95, 0.22, 0.95] },
  l298n:      { position: [-1.0, 0.45, 0.1],  size: [1.05, 0.52, 1.15] },
  ir:         { position: [-2.15, 0.30, 0],   size: [0.9, 0.35, 1.8] },
  battery:    { position: [1.2, 0.56, 0.8],   size: [0.5, 0.8, 0.4] },
};

function CameraController({ targetPosition, targetLookAt }) {
  const { camera } = useThree();
  const tween = useRef({ active: false, startPos: null, endPos: null, startAt: null, endAt: null, t: 0 });

  useEffect(() => {
    const tw = tween.current;
    tw.active = true;
    tw.startPos = camera.position.clone();
    tw.endPos = new THREE.Vector3(...targetPosition);
    tw.startAt = new THREE.Vector3(0, 0, 0);
    tw.endAt = new THREE.Vector3(...targetLookAt);
    tw.t = 0;
  }, [targetPosition, targetLookAt]);

  useFrame((_, delta) => {
    const tw = tween.current;
    if (!tw.active) return;
    tw.t = Math.min(1, tw.t + delta * 1.4);
    const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;
    camera.position.lerpVectors(tw.startPos, tw.endPos, e);
    const at = new THREE.Vector3().lerpVectors(tw.startAt, tw.endAt, e);
    camera.lookAt(at);
    if (tw.t >= 1) tw.active = false;
  });

  return null;
}

const WIRE_GROUPS = ['wires_motor', 'wires_sensor', 'wires_control', 'wires_power'];
const OP_ACTIVE  = 1.0;
const OP_OLD     = 0.12;
const OP_NEUTRAL = 0.5;
const TRACK_RADIUS = 3.4;
const TRACK_ANGULAR_SPEED = 0.32;

export default function AssemblyScene({ currentStep, cameraOverride }) {
  const step     = ASSEMBLY_STEPS[currentStep - 1];
  const prevStep = currentStep > 1 ? ASSEMBLY_STEPS[currentStep - 2] : null;
  const reveal     = step?.reveal     || [];
  const prevReveal = prevStep?.reveal || [];
  const showTrack = reveal.includes('track');
  const camPos   = cameraOverride?.position || step?.camera?.position || [0, 9, 7];
  const camTarget = cameraOverride?.target  || step?.camera?.target  || [0, 0, 0];
  const robotGroupRef = useRef(null);
  const moveT = useRef(0);

  const newestComponent = reveal[reveal.length - 1];
  const highlightProps  = HIGHLIGHT_MAP[newestComponent];

  const newWire = WIRE_GROUPS.find(w => reveal.includes(w) && !prevReveal.includes(w));

  function wireOpacity(wireId) {
    if (!reveal.includes(wireId)) return 0;
    if (!newWire) return OP_NEUTRAL;
    if (wireId === newWire) return OP_ACTIVE;
    return OP_OLD;
  }

  useFrame((_, delta) => {
    if (!robotGroupRef.current) return;

    if (currentStep === 13) {
      moveT.current += delta * TRACK_ANGULAR_SPEED;
      const angle = moveT.current;
      const x = TRACK_RADIUS * Math.cos(angle);
      const z = TRACK_RADIUS * Math.sin(angle);

      const tangentX = -Math.sin(angle);
      const tangentZ = Math.cos(angle);

      robotGroupRef.current.position.x = x;
      robotGroupRef.current.position.z = z;
      robotGroupRef.current.rotation.y = Math.atan2(tangentZ, -tangentX);
      return;
    }

    moveT.current = 0;
    robotGroupRef.current.position.x = 0;
    robotGroupRef.current.position.z = 0;
    robotGroupRef.current.rotation.y = 0;
  });

  return (
    <>
      <CameraController targetPosition={camPos} targetLookAt={camTarget} />

      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 9, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-4, 3, -4]} intensity={0.4} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.17, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#E8E4D8" />
      </mesh>
      {!showTrack && (
        <gridHelper args={[22, 22, 'rgba(10,10,10,0.04)', 'rgba(10,10,10,0.04)']} position={[0, -0.16, 0]} />
      )}

      <group ref={robotGroupRef}>
        <Chassis    visible={reveal.includes('chassis')} />
        <Motors     visible={reveal.includes('motor')} />
        <Castor     visible={reveal.includes('castor')} />
        <Arduino    visible={reveal.includes('arduino')} />
        <Breadboard visible={reveal.includes('breadboard')} />
        <L298N      visible={reveal.includes('l298n')} />
        <IRSensors  visible={reveal.includes('ir')} />

        <MotorWires   visible={reveal.includes('wires_motor')}   opacity={wireOpacity('wires_motor')} />
        <SensorWires  visible={reveal.includes('wires_sensor')}  opacity={wireOpacity('wires_sensor')} />
        <ControlWires visible={reveal.includes('wires_control')} opacity={wireOpacity('wires_control')} />
        <Battery      visible={reveal.includes('battery')} />
        <PowerWires   visible={reveal.includes('wires_power')}   opacity={wireOpacity('wires_power')} />

        {highlightProps && ['chassis','motor','castor','arduino','breadboard','l298n','ir','battery'].includes(newestComponent) && (
          <HighlightBox
            position={highlightProps.position}
            size={highlightProps.size}
            color={step?.phaseColor || '#4F46E5'}
          />
        )}
      </group>
      <Track        visible={reveal.includes('track')} />

      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enablePan={false}
      />
    </>
  );
}
