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
    <GLBUniformModel
      url={MODELS.castor}
      position={[-2.12, 0.08, 0]}
      fit={0.42}
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
      position={[0.2, 0.3, 0.1]}
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
// Defined once so wire endpoints can reference them by name.
const PINS = {
  // Arduino pin header runs along the -X edge, y just above board top
  ard: {
    vin: [-0.35, 0.415, -0.45],
    v5:  [-0.35, 0.415, -0.35],
    gnd: [-0.35, 0.415, -0.25],
    d2:  [-0.35, 0.415, -0.15],
    d3:  [-0.35, 0.415, -0.05],
    d5:  [-0.35, 0.415,  0.10],
    d6:  [-0.35, 0.415,  0.20],
    d8:  [-0.35, 0.415,  0.35],
    d9:  [-0.35, 0.415,  0.45],
    d10: [-0.35, 0.415,  0.55],
    d11: [-0.35, 0.415,  0.65],
  },
  // L298N: OUT screw block on +X edge (facing motors), IN pin header on -X edge
  l298n: {
    out1: [-0.05, 0.36,  0.28],
    out2: [-0.05, 0.36,  0.42],
    out3: [-0.05, 0.36,  0.78],
    out4: [-0.05, 0.36,  0.92],
    ena:  [-0.95, 0.48,  0.15],
    in1:  [-0.95, 0.48,  0.30],
    in2:  [-0.95, 0.48,  0.45],
    in3:  [-0.95, 0.48,  0.60],
    in4:  [-0.95, 0.48,  0.75],
    enb:  [-0.95, 0.48,  0.90],
    v12:  [-0.80, 0.34,  1.15],
    gnd1: [-0.60, 0.34,  1.15],
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
    leftVcc:  [-1.85, 0.32, -0.48],
    leftGnd:  [-1.85, 0.32, -0.55],
    leftOut:  [-1.85, 0.32, -0.62],
    rightVcc: [-1.85, 0.32,  0.48],
    rightGnd: [-1.85, 0.32,  0.55],
    rightOut: [-1.85, 0.32,  0.62],
  },
  // Breadboard rails — two rails along Z axis at different X positions on top
  bb: {
    plusA:  [-0.10, 0.365, -0.80],
    plusB:  [ 0.20, 0.365, -0.80],
    plusC:  [ 0.50, 0.365, -0.80],
    minusA: [-0.10, 0.365, -0.20],
    minusB: [ 0.20, 0.365, -0.20],
    minusC: [ 0.50, 0.365, -0.20],
  },
  // Battery terminals on top of pack (snap connector)
  bat: {
    plus:  [1.13, 0.64, 0.80],
    minus: [1.27, 0.64, 0.80],
  },
};

// ─── Motor wiring: L298N OUT → motor terminals ───────────────────────────────
function MotorWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      {/* OUT1 → Left motor lead A (red) */}
      <CurvedWire start={PINS.l298n.out1} end={PINS.mot.leftA} color="#DC2626" visible arcHeight={0.9} opacity={opacity} />
      {/* OUT2 → Left motor lead B (black) */}
      <CurvedWire start={PINS.l298n.out2} end={PINS.mot.leftB} color="#0A0A0A" visible arcHeight={1.0} opacity={opacity} />
      {/* OUT3 → Right motor lead A (red) */}
      <CurvedWire start={PINS.l298n.out3} end={PINS.mot.rightA} color="#DC2626" visible arcHeight={0.9} opacity={opacity} />
      {/* OUT4 → Right motor lead B (black) */}
      <CurvedWire start={PINS.l298n.out4} end={PINS.mot.rightB} color="#0A0A0A" visible arcHeight={1.0} opacity={opacity} />
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
      {/* ENA ↔ D5 (PWM) */}
      <CurvedWire start={PINS.ard.d5}  end={PINS.l298n.ena} color="#A855F7" visible arcHeight={0.58} opacity={opacity} />
      {/* ENB ↔ D6 (PWM) */}
      <CurvedWire start={PINS.ard.d6}  end={PINS.l298n.enb} color="#22C55E" visible arcHeight={0.55} opacity={opacity} />
      {/* IN1 ↔ D8 */}
      <CurvedWire start={PINS.ard.d8}  end={PINS.l298n.in1} color="#3B82F6" visible arcHeight={0.52} opacity={opacity} />
      {/* IN2 ↔ D9 */}
      <CurvedWire start={PINS.ard.d9}  end={PINS.l298n.in2} color="#F97316" visible arcHeight={0.50} opacity={opacity} />
      {/* IN3 ↔ D10 */}
      <CurvedWire start={PINS.ard.d10} end={PINS.l298n.in3} color="#EC4899" visible arcHeight={0.48} opacity={opacity} />
      {/* IN4 ↔ D11 */}
      <CurvedWire start={PINS.ard.d11} end={PINS.l298n.in4} color="#14B8A6" visible arcHeight={0.46} opacity={opacity} />
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
      {/* Battery + → L298N +12V */}
      <CurvedWire start={PINS.bat.plus}   end={PINS.l298n.v12}  color="#EF4444" visible arcHeight={0.85} opacity={opacity} />
      {/* Battery − → L298N GND */}
      <CurvedWire start={PINS.bat.minus}  end={PINS.l298n.gnd1} color="#0A0A0A" visible arcHeight={0.75} opacity={opacity} />
      {/* Arduino VIN → Battery + (7–12V supply) */}
      <CurvedWire start={PINS.ard.vin}    end={PINS.bat.plus}   color="#EF4444" visible arcHeight={0.60} opacity={opacity} />
      {/* Arduino GND → L298N GND (common ground) */}
      <CurvedWire start={PINS.ard.gnd}    end={PINS.l298n.gnd1} color="#0A0A0A" visible arcHeight={0.40} opacity={opacity} />
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
  chassis:    { position: [0, 0.27, 0],       size: [4.45, 0.34, 4.45] },
  motor:      { position: [1.45, 0.32, 0],    size: [1.7, 0.75, 3.3] },
  castor:     { position: [-2.12, 0.12, 0],   size: [0.55, 0.45, 0.55] },
  arduino:    { position: [0.2, 0.41, 0.1],    size: [1.35, 0.3, 1.15] },
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
