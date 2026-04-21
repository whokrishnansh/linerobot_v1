import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ASSEMBLY_STEPS } from '../../data/assemblySteps';

// ─── Component layout (clearly non-overlapping positions) ─────────────────────
// Chassis:    [0, 0.15, 0]       4 × 0.3 × 2.5   x:[-2,2]  z:[-1.25,1.25]
// Arduino:    [0.5, 0.36, 0.15]  1.8 × 0.12 × 1.1  x:[-0.4,1.4] z:[-0.4,0.7]
// Breadboard: [0.1, 0.36, -0.85] 0.85 × 0.08 × 1.2 x:[-0.3,0.5] z:[-1.45,-0.25]
// L298N:      [-1.0, 0.45, 0.1]  0.9 × 0.3 × 1.0   x:[-1.45,-0.55] z:[-0.4,0.6]
// Castor:     [-2.2, 0.08, 0]    front centre, clearly outside chassis x edge

// ─── Arced wire helper using TubeGeometry + CatmullRomCurve3 ──────────────────
function CurvedWire({ start, end, color, visible, arcHeight = 0.7, arcBias = 0.5, opacity = 1 }) {
  // useMemo must be called unconditionally
  const geometry = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = new THREE.Vector3(
      s.x + (e.x - s.x) * arcBias,
      Math.max(s.y, e.y) + arcHeight,
      s.z + (e.z - s.z) * arcBias,
    );
    const curve = new THREE.CatmullRomCurve3([s, mid, e]);
    return new THREE.TubeGeometry(curve, 28, 0.035, 8, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // static geometry – positions never change after mount

  if (!visible) return null;

  // KEY FIX: always transparent={true} so Three.js compiles the shader once
  // in transparent mode. Changing opacity is then a plain uniform update which
  // works reliably at runtime. If we flip transparent false→true at runtime,
  // Three.js reuses the cached opaque shader and opacity is silently ignored.
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

// ─── Highlight box (replaces torus ring — less weird) ────────────────────────
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

// ─── Robot component meshes ───────────────────────────────────────────────────
function Chassis({ visible }) {
  if (!visible) return null;
  return (
    <group position={[0, 0.15, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 0.3, 2.5]} />
        <meshStandardMaterial color="#6D28D9" roughness={0.55} metalness={0.1} />
      </mesh>
      {/* Mounting standoffs */}
      {[[-1.4, 0.17, -0.9], [1.2, 0.17, -0.9], [-1.4, 0.17, 0.9], [1.2, 0.17, 0.9]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.07, 0.07, 0.35, 8]} />
          <meshStandardMaterial color="#4C1D95" />
        </mesh>
      ))}
    </group>
  );
}

function Motors({ visible }) {
  if (!visible) return null;
  return (
    <group>
      {[[-1.4], [1.4]].map(([z], idx) => (
        <group key={idx} position={[1.45, 0.22, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.75, 0.45, 0.55]} />
            <meshStandardMaterial color="#1F2937" roughness={0.7} />
          </mesh>
          {/* Shaft */}
          <mesh position={[0.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.18, 12]} />
            <meshStandardMaterial color="#9CA3AF" metalness={0.8} />
          </mesh>
          {/* Wheel */}
          <mesh position={[0.65, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.09, 8, 22]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Castor({ visible }) {
  if (!visible) return null;
  // Positioned clearly outside the chassis front edge (chassis front is x = -2)
  return (
    <group position={[-2.25, 0.1, 0]}>
      {/* Mount bracket */}
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.22, 0.28]} />
        <meshStandardMaterial color="#6B7280" />
      </mesh>
      {/* Ball */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.55} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Arduino({ visible }) {
  if (!visible) return null;
  // Centered rear-half, shifted to z=+0.15 so breadboard (z≈-0.85) doesn't overlap
  return (
    <group position={[0.5, 0.36, 0.15]}>
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.12, 1.1]} />
        <meshStandardMaterial color="#006B3F" roughness={0.6} />
      </mesh>
      {/* IC chips */}
      {[[-0.3, 0.07, -0.15], [0.35, 0.07, -0.15], [-0.3, 0.07, 0.28]].map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.38, 0.08, 0.22]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {/* USB port (rear of robot = x positive) */}
      <mesh position={[0.92, 0.03, 0]}>
        <boxGeometry args={[0.14, 0.09, 0.28]} />
        <meshStandardMaterial color="#9CA3AF" metalness={0.8} />
      </mesh>
      {/* Pin headers */}
      <mesh position={[0.0, 0.07, -0.48]}>
        <boxGeometry args={[1.4, 0.06, 0.08]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
      {/* LED */}
      <mesh position={[0.65, 0.08, 0.44]}>
        <cylinderGeometry args={[0.04, 0.04, 0.06, 8]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function Breadboard({ visible }) {
  if (!visible) return null;
  // Placed in front of Arduino (z = -0.85), no x/z overlap
  return (
    <group position={[0.1, 0.365, -0.85]}>
      <mesh castShadow>
        <boxGeometry args={[0.85, 0.08, 1.2]} />
        <meshStandardMaterial color="#F0F0DC" roughness={0.8} />
      </mesh>
      {/* Power rails */}
      <mesh position={[0, 0.05, -0.44]}>
        <boxGeometry args={[0.8, 0.01, 0.05]} />
        <meshStandardMaterial color="#EF4444" opacity={0.7} transparent />
      </mesh>
      <mesh position={[0, 0.05, 0.44]}>
        <boxGeometry args={[0.8, 0.01, 0.05]} />
        <meshStandardMaterial color="#3B82F6" opacity={0.7} transparent />
      </mesh>
      {/* Tie-point rows */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 0.046, z]}>
          <boxGeometry args={[0.7, 0.008, 0.04]} />
          <meshStandardMaterial color="#C8C8A0" />
        </mesh>
      ))}
    </group>
  );
}

function L298N({ visible }) {
  if (!visible) return null;
  return (
    <group position={[-1.0, 0.45, 0.1]}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.3, 1.0]} />
        <meshStandardMaterial color="#DC2626" roughness={0.5} />
      </mesh>
      {/* Heatsink */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.48, 0.16, 0.78]} />
        <meshStandardMaterial color="#1F2937" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Output screw terminals (motor side) */}
      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={i} position={[0.52, 0.04, z]}>
          <boxGeometry args={[0.1, 0.2, 0.17]} />
          <meshStandardMaterial color="#15803D" />
        </mesh>
      ))}
      {/* Input pin header */}
      <mesh position={[-0.48, 0.04, 0]}>
        <boxGeometry args={[0.08, 0.16, 0.7]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>
    </group>
  );
}

function IRSensors({ visible }) {
  if (!visible) return null;
  return (
    <group>
      {[[-0.6], [0.6]].map(([z], idx) => (
        <group key={idx} position={[-2.1, 0.12, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.55, 0.1, 0.28]} />
            <meshStandardMaterial color="#1E40AF" roughness={0.6} />
          </mesh>
          {/* Emitter (black, IR LED) */}
          <mesh position={[-0.12, -0.07, 0]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#0A0A0A" />
          </mesh>
          {/* Receiver (copper lens) */}
          <mesh position={[0.1, -0.07, 0]}>
            <sphereGeometry args={[0.055, 10, 10]} />
            <meshStandardMaterial color="#B87333" metalness={0.5} />
          </mesh>
          {/* Status LED */}
          <mesh position={[0.22, 0.07, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
            <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Wire bundles (arced) ────────────────────────────────────────────────────
function MotorWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      {/* L298N OUT terminals → Right motor (z = -1.4) */}
      <CurvedWire start={[-0.48, 0.3, -0.2]} end={[1.1, 0.22, -1.15]} color="#374151" visible arcHeight={0.9} opacity={opacity} />
      <CurvedWire start={[-0.48, 0.3, -0.3]} end={[1.1, 0.22, -1.25]} color="#374151" visible arcHeight={1.0} opacity={opacity} />
      {/* L298N OUT terminals → Left motor (z = +1.4) */}
      <CurvedWire start={[-0.48, 0.3, 0.2]} end={[1.1, 0.22, 1.15]} color="#4B5563" visible arcHeight={0.9} opacity={opacity} />
      <CurvedWire start={[-0.48, 0.3, 0.3]} end={[1.1, 0.22, 1.25]} color="#4B5563" visible arcHeight={1.0} opacity={opacity} />
    </group>
  );
}

function SensorWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      {/* Left IR OUT → Arduino D2 */}
      <CurvedWire start={[-2.1, 0.12, -0.6]} end={[0.15, 0.42, -0.1]} color="#FBBF24" visible arcHeight={0.65} opacity={opacity} />
      {/* Right IR OUT → Arduino D3 */}
      <CurvedWire start={[-2.1, 0.12, 0.6]} end={[0.15, 0.42, 0.2]} color="#EAB308" visible arcHeight={0.75} opacity={opacity} />
      {/* VCC rails (green) */}
      <CurvedWire start={[-2.1, 0.15, -0.55]} end={[0.1, 0.41, -0.65]} color="#22C55E" visible arcHeight={0.5} opacity={opacity} />
      <CurvedWire start={[-2.1, 0.15, 0.55]} end={[0.1, 0.41, 0.35]} color="#22C55E" visible arcHeight={0.55} opacity={opacity} />
    </group>
  );
}

function ControlWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  // Arduino D5–D8 (x≈-0.4, z≈0.15) → L298N IN1–IN4 (x≈-0.52, z≈[-0.3,0.3])
  return (
    <group>
      <CurvedWire start={[-0.35, 0.42, -0.1]} end={[-0.52, 0.45, -0.25]} color="#FACC15" visible arcHeight={0.45} opacity={opacity} />
      <CurvedWire start={[-0.35, 0.42, 0.0]} end={[-0.52, 0.45, -0.08]} color="#EAB308" visible arcHeight={0.42} opacity={opacity} />
      <CurvedWire start={[-0.35, 0.42, 0.1]} end={[-0.52, 0.45, 0.08]} color="#FACC15" visible arcHeight={0.4} opacity={opacity} />
      <CurvedWire start={[-0.35, 0.42, 0.2]} end={[-0.52, 0.45, 0.25]} color="#EAB308" visible arcHeight={0.38} opacity={opacity} />
    </group>
  );
}

function Battery({ visible }) {
  if (!visible) return null;
  return (
    <group position={[1.0, 0.46, 0.85]}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.82, 0.3]} />
        <meshStandardMaterial color="#16A34A" roughness={0.5} />
      </mesh>
      {/* Positive terminal */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.1, 10]} />
        <meshStandardMaterial color="#EF4444" metalness={0.7} />
      </mesh>
      {/* Snap connector */}
      <mesh position={[-0.28, 0.3, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.14]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>
    </group>
  );
}

function PowerWires({ visible, opacity = 1 }) {
  if (!visible) return null;
  return (
    <group>
      {/* Battery + → L298N 12V */}
      <CurvedWire start={[0.72, 0.87, 0.85]} end={[-0.52, 0.45, 0.1]} color="#EF4444" visible arcHeight={0.85} opacity={opacity} />
      {/* Battery - → L298N GND */}
      <CurvedWire start={[0.72, 0.46, 0.85]} end={[-0.52, 0.35, 0.0]} color="#0A0A0A" visible arcHeight={0.65} opacity={opacity} />
      {/* L298N 5V → Arduino VIN */}
      <CurvedWire start={[-0.52, 0.52, 0.3]} end={[0.15, 0.42, 0.5]} color="#EF4444" visible arcHeight={0.4} opacity={opacity} />
    </group>
  );
}

function Track({ visible }) {
  if (!visible) return null;
  return (
    <group position={[0, -0.16, 0]}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#E8E4D8" />
      </mesh>
      {/* Main straight tape */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.14, 12]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>
      {/* Curve segment right */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2.8]} position={[3.5, 0.01, 2.5]}>
        <planeGeometry args={[0.14, 6]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>
      {/* Far straight */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5, 0.01, 4]}>
        <planeGeometry args={[0.14, 5]} />
        <meshStandardMaterial color="#0A0A0A" />
      </mesh>
    </group>
  );
}

// ─── Highlight mapping ───────────────────────────────────────────────────────
const HIGHLIGHT_MAP = {
  chassis:    { position: [0, 0.3, 0],        size: [4.2, 0.45, 2.65] },
  motor:      { position: [1.45, 0.32, 0],    size: [1.1, 0.75, 3.3] },
  castor:     { position: [-2.25, 0.18, 0],   size: [0.5, 0.6, 0.55] },
  arduino:    { position: [0.5, 0.43, 0.15],  size: [2.0, 0.28, 1.25] },
  breadboard: { position: [0.1, 0.42, -0.85], size: [1.0, 0.22, 1.35] },
  l298n:      { position: [-1.0, 0.62, 0.1],  size: [1.05, 0.52, 1.15] },
  ir:         { position: [-2.1, 0.18, 0],    size: [0.75, 0.35, 1.8] },
  battery:    { position: [1.0, 0.88, 0.85],  size: [0.65, 1.0, 0.5] },
};

// ─── Camera tween controller ─────────────────────────────────────────────────
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

// ─── Wire opacity logic ───────────────────────────────────────────────────────
// Wire group IDs in order of introduction
const WIRE_GROUPS = ['wires_motor', 'wires_sensor', 'wires_control', 'wires_power'];

// Opacity values
const OP_ACTIVE  = 1.0;   // wire introduced in this step
const OP_OLD     = 0.12;  // wire from a previous step
const OP_NEUTRAL = 0.5;   // all wires visible, no wiring step active (programming/testing)

// ─── Main exported scene ─────────────────────────────────────────────────────
export default function AssemblyScene({ currentStep, cameraOverride }) {
  const step     = ASSEMBLY_STEPS[currentStep - 1];
  const prevStep = currentStep > 1 ? ASSEMBLY_STEPS[currentStep - 2] : null;
  const reveal     = step?.reveal     || [];
  const prevReveal = prevStep?.reveal || [];
  const camPos   = cameraOverride?.position || step?.camera?.position || [0, 9, 7];
  const camTarget = cameraOverride?.target  || step?.camera?.target  || [0, 0, 0];

  // Newest component = last in reveal array (for highlight)
  const newestComponent = reveal[reveal.length - 1];
  const highlightProps  = HIGHLIGHT_MAP[newestComponent];

  // Which wire group (if any) is new in this step?
  const newWire = WIRE_GROUPS.find(w => reveal.includes(w) && !prevReveal.includes(w));

  // Per-group opacity:
  //   new in this step → full
  //   already existed  → dimmed heavily (so only the new wires stand out)
  //   no wiring step   → neutral (all visible at half-opacity for context)
  function wireOpacity(wireId) {
    if (!reveal.includes(wireId)) return 0;      // not rendered
    if (!newWire) return OP_NEUTRAL;             // programming/testing steps
    if (wireId === newWire) return OP_ACTIVE;    // newly introduced ← HIGHLIGHT
    return OP_OLD;                               // previously laid wire ← FADE
  }

  return (
    <>
      <CameraController targetPosition={camPos} targetLookAt={camTarget} />

      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 9, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <directionalLight position={[-4, 3, -4]} intensity={0.4} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.17, 0]} receiveShadow>
        <planeGeometry args={[22, 22]} />
        <meshStandardMaterial color="#E8E4D8" />
      </mesh>
      <gridHelper args={[22, 22, 'rgba(10,10,10,0.04)', 'rgba(10,10,10,0.04)']} position={[0, -0.16, 0]} />

      {/* Robot components */}
      <Chassis    visible={reveal.includes('chassis')} />
      <Motors     visible={reveal.includes('motor')} />
      <Castor     visible={reveal.includes('castor')} />
      <Arduino    visible={reveal.includes('arduino')} />
      <Breadboard visible={reveal.includes('breadboard')} />
      <L298N      visible={reveal.includes('l298n')} />
      <IRSensors  visible={reveal.includes('ir')} />

      {/* Wires — only the group introduced in this step is at full opacity */}
      <MotorWires   visible={reveal.includes('wires_motor')}   opacity={wireOpacity('wires_motor')} />
      <SensorWires  visible={reveal.includes('wires_sensor')}  opacity={wireOpacity('wires_sensor')} />
      <ControlWires visible={reveal.includes('wires_control')} opacity={wireOpacity('wires_control')} />
      <Battery      visible={reveal.includes('battery')} />
      <PowerWires   visible={reveal.includes('wires_power')}   opacity={wireOpacity('wires_power')} />
      <Track        visible={reveal.includes('track')} />

      {/* Highlight newly added component (subtle emissive box) */}
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
