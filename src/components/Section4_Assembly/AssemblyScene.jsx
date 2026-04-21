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
    c.rotation.set(rotation[0], rotation[1], rotation[2]);
    c.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(c);
    const dims = new THREE.Vector3();
    box.getSize(dims);
    const ctr = new THREE.Vector3();
    box.getCenter(ctr);
    const sx = size[0] / (dims.x || 1);
    const sy = size[1] / (dims.y || 1);
    const sz = size[2] / (dims.z || 1);
    return { cloned: c, scale: [sx, sy, sz], center: ctr };
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

// ─── Arced wire helper ───────────────────────────────────────────────────────
const WIRE_RADIUS = 0.010;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <mesh geometry={geometry} renderOrder={opacity < 1 ? 1 : 0}>
      <meshStandardMaterial
        color={color}
        roughness={0.5}
        transparent={true}
        opacity={opacity}
        depthWrite={opacity > 0.98}
      />
    </mesh>
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

// ─── Chassis (programmatic — no GLB available) ───────────────────────────────
function Chassis({ visible }) {
  if (!visible) return null;
  return (
    <group position={[0, 0.15, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 0.3, 2.5]} />
        <meshStandardMaterial color="#6D28D9" roughness={0.55} metalness={0.1} />
      </mesh>
      {[[-1.4, 0.17, -0.9], [1.2, 0.17, -0.9], [-1.4, 0.17, 0.9], [1.2, 0.17, 0.9]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.07, 0.07, 0.35, 8]} />
          <meshStandardMaterial color="#4C1D95" />
        </mesh>
      ))}
    </group>
  );
}

// ─── BO Motor (GLB) + programmatic wheel ─────────────────────────────────────
function Motors({ visible }) {
  if (!visible) return null;
  return (
    <group>
      {[[-1.4], [1.4]].map(([z], idx) => (
        <group key={idx} position={[1.45, 0.22, z]}>
          <GLBModel url={MODELS.motor} size={[0.9, 0.5, 0.5]} />
          <mesh position={[0.6, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.34, 0.14, 24]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
          <mesh position={[0.6, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.15, 16]} />
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
    <group position={[-2.25, 0.1, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.22, 0.28]} />
        <meshStandardMaterial color="#6B7280" />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.55} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Arduino (GLB) ───────────────────────────────────────────────────────────
// Positioned in the +Z half of the chassis (rear). Long axis along Z.
function Arduino({ visible }) {
  if (!visible) return null;
  return (
    <GLBModel
      url={MODELS.arduino}
      position={[0.5, 0.375, 0.4]}
      size={[1.2, 0.15, 1.0]}
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
      position={[0.3, 0.35, -0.8]}
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
      position={[-1.0, 0.48, 0.1]}
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
          position={[-2.15, 0.15, z]}
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
    <GLBModel
      url={MODELS.battery}
      position={[1.0, 0.76, 0.85]}
      size={[0.35, 0.6, 0.25]}
    />
  );
}

// ─── Terminal/pin coordinate tables ──────────────────────────────────────────
// Defined once so wire endpoints can reference them by name.
const PINS = {
  // Arduino pin header runs along the -X edge (x ≈ -0.05), y just above board top
  ard: {
    v5:  [-0.05, 0.455, -0.05],
    gnd: [-0.05, 0.455,  0.05],
    d2:  [-0.05, 0.455,  0.15],
    d3:  [-0.05, 0.455,  0.25],
    d5:  [-0.05, 0.455,  0.40],
    d6:  [-0.05, 0.455,  0.55],
    d7:  [-0.05, 0.455,  0.70],
    d8:  [-0.05, 0.455,  0.85],
  },
  // L298N: OUT screw block on +X edge (facing motors), IN pin header on -X edge
  l298n: {
    out1: [-0.55, 0.40, -0.32],
    out2: [-0.55, 0.40, -0.18],
    out3: [-0.55, 0.40,  0.18],
    out4: [-0.55, 0.40,  0.32],
    in1:  [-1.45, 0.52, -0.30],
    in2:  [-1.45, 0.52, -0.10],
    in3:  [-1.45, 0.52,  0.10],
    in4:  [-1.45, 0.52,  0.30],
    v12:  [-1.30, 0.38,  0.55],
    gnd1: [-1.10, 0.38,  0.55],
    v5:   [-0.80, 0.38,  0.55],
    gnd2: [-1.10, 0.38,  0.50], // second GND tap (co-located screw) → Arduino
  },
  // Motor wire pads on the body end (opposite shaft)
  mot: {
    rightA: [1.00, 0.30, -1.45],
    rightB: [1.00, 0.30, -1.35],
    leftA:  [1.00, 0.30,  1.35],
    leftB:  [1.00, 0.30,  1.45],
  },
  // IR sensor 3-pin headers, clustered near the +X end of each module
  ir: {
    leftVcc:  [-1.85, 0.22, -0.48],
    leftGnd:  [-1.85, 0.22, -0.55],
    leftOut:  [-1.85, 0.22, -0.62],
    rightVcc: [-1.85, 0.22,  0.48],
    rightGnd: [-1.85, 0.22,  0.55],
    rightOut: [-1.85, 0.22,  0.62],
  },
  // Breadboard rails — two rails along Z axis at different X positions on top
  bb: {
    plusA:  [0.00, 0.405, -1.10],
    plusB:  [0.30, 0.405, -1.10],
    plusC:  [0.60, 0.405, -1.10],
    minusA: [0.00, 0.405, -0.50],
    minusB: [0.30, 0.405, -0.50],
    minusC: [0.60, 0.405, -0.50],
  },
  // Battery terminals on top of pack (snap connector)
  bat: {
    plus:  [0.93, 1.08, 0.85],
    minus: [1.07, 1.08, 0.85],
  },
};

// ─── Motor wiring: L298N OUT → motor terminals ───────────────────────────────
function MotorWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      {/* OUT1 (+) → Right motor lead A (red) */}
      <CurvedWire start={PINS.l298n.out1} end={PINS.mot.rightA} color="#DC2626" visible arcHeight={0.9} opacity={opacity} />
      {/* OUT2 (−) → Right motor lead B (black) */}
      <CurvedWire start={PINS.l298n.out2} end={PINS.mot.rightB} color="#0A0A0A" visible arcHeight={1.0} opacity={opacity} />
      {/* OUT3 (+) → Left motor lead A (red) */}
      <CurvedWire start={PINS.l298n.out3} end={PINS.mot.leftA} color="#DC2626" visible arcHeight={0.9} opacity={opacity} />
      {/* OUT4 (−) → Left motor lead B (black) */}
      <CurvedWire start={PINS.l298n.out4} end={PINS.mot.leftB} color="#0A0A0A" visible arcHeight={1.0} opacity={opacity} />
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
      <CurvedWire start={PINS.ir.leftOut}  end={PINS.ard.d2}       color="#FACC15" visible arcHeight={0.70} opacity={opacity} />
      <CurvedWire start={PINS.ir.rightOut} end={PINS.ard.d3}       color="#EAB308" visible arcHeight={0.75} opacity={opacity} />
      {/* VCC to + rail */}
      <CurvedWire start={PINS.ir.leftVcc}  end={PINS.bb.plusA}     color="#EF4444" visible arcHeight={0.55} opacity={opacity} />
      <CurvedWire start={PINS.ir.rightVcc} end={PINS.bb.plusC}     color="#EF4444" visible arcHeight={0.60} opacity={opacity} />
      {/* GND to − rail */}
      <CurvedWire start={PINS.ir.leftGnd}  end={PINS.bb.minusA}    color="#0A0A0A" visible arcHeight={0.45} opacity={opacity} />
      <CurvedWire start={PINS.ir.rightGnd} end={PINS.bb.minusC}    color="#0A0A0A" visible arcHeight={0.50} opacity={opacity} />
      {/* Rails fed from Arduino */}
      <CurvedWire start={PINS.ard.v5}      end={PINS.bb.plusB}     color="#EF4444" visible arcHeight={0.50} opacity={opacity} />
      <CurvedWire start={PINS.ard.gnd}     end={PINS.bb.minusB}    color="#0A0A0A" visible arcHeight={0.40} opacity={opacity} />
    </group>
  );
}

// ─── Control signals: Arduino D5–D8 → L298N IN1–IN4 ──────────────────────────
function ControlWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      <CurvedWire start={PINS.ard.d5} end={PINS.l298n.in1} color="#A855F7" visible arcHeight={0.55} opacity={opacity} />
      <CurvedWire start={PINS.ard.d6} end={PINS.l298n.in2} color="#22C55E" visible arcHeight={0.52} opacity={opacity} />
      <CurvedWire start={PINS.ard.d7} end={PINS.l298n.in3} color="#3B82F6" visible arcHeight={0.50} opacity={opacity} />
      <CurvedWire start={PINS.ard.d8} end={PINS.l298n.in4} color="#F97316" visible arcHeight={0.48} opacity={opacity} />
    </group>
  );
}

// ─── Power wiring ────────────────────────────────────────────────────────────
//   Battery +  → L298N 12V
//   Battery −  → L298N GND
//   L298N 5V   → Arduino 5V
//   L298N GND  → Arduino GND (shared ground is required for signal integrity)
function PowerWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      <CurvedWire start={PINS.bat.plus}   end={PINS.l298n.v12}  color="#EF4444" visible arcHeight={0.85} opacity={opacity} />
      <CurvedWire start={PINS.bat.minus}  end={PINS.l298n.gnd1} color="#0A0A0A" visible arcHeight={0.75} opacity={opacity} />
      <CurvedWire start={PINS.l298n.v5}   end={PINS.ard.v5}     color="#EF4444" visible arcHeight={0.45} opacity={opacity} />
      <CurvedWire start={PINS.l298n.gnd2} end={PINS.ard.gnd}    color="#0A0A0A" visible arcHeight={0.40} opacity={opacity} />
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.14, 12]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2.8]} position={[3.5, 0.01, 2.5]}>
        <planeGeometry args={[0.14, 6]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0.01, 4]}>
        <planeGeometry args={[0.14, 5]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>
    </group>
  );
}

const HIGHLIGHT_MAP = {
  chassis:    { position: [0, 0.3, 0],        size: [4.2, 0.45, 2.65] },
  motor:      { position: [1.45, 0.32, 0],    size: [1.7, 0.75, 3.3] },
  castor:     { position: [-2.25, 0.18, 0],   size: [0.5, 0.6, 0.55] },
  arduino:    { position: [0.5, 0.45, 0.4],   size: [1.35, 0.3, 1.15] },
  breadboard: { position: [0.3, 0.42, -0.8],  size: [0.95, 0.22, 0.95] },
  l298n:      { position: [-1.0, 0.62, 0.1],  size: [1.05, 0.52, 1.15] },
  ir:         { position: [-2.15, 0.2, 0],    size: [0.9, 0.35, 1.8] },
  battery:    { position: [1.0, 0.76, 0.85],  size: [0.5, 0.8, 0.4] },
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

export default function AssemblyScene({ currentStep, cameraOverride }) {
  const step     = ASSEMBLY_STEPS[currentStep - 1];
  const prevStep = currentStep > 1 ? ASSEMBLY_STEPS[currentStep - 2] : null;
  const reveal     = step?.reveal     || [];
  const prevReveal = prevStep?.reveal || [];
  const camPos   = cameraOverride?.position || step?.camera?.position || [0, 9, 7];
  const camTarget = cameraOverride?.target  || step?.camera?.target  || [0, 0, 0];

  const newestComponent = reveal[reveal.length - 1];
  const highlightProps  = HIGHLIGHT_MAP[newestComponent];

  const newWire = WIRE_GROUPS.find(w => reveal.includes(w) && !prevReveal.includes(w));

  function wireOpacity(wireId) {
    if (!reveal.includes(wireId)) return 0;
    if (!newWire) return OP_NEUTRAL;
    if (wireId === newWire) return OP_ACTIVE;
    return OP_OLD;
  }

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
      <gridHelper args={[22, 22, 'rgba(10,10,10,0.04)', 'rgba(10,10,10,0.04)']} position={[0, -0.16, 0]} />

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
      <Track        visible={reveal.includes('track')} />

      {highlightProps && ['chassis','motor','castor','arduino','breadboard','l298n','ir','battery'].includes(newestComponent) && (
        <HighlightBox
          position={highlightProps.position}
          size={highlightProps.size}
          color={step?.phaseColor || '#4F46E5'}
        />
      )}

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
