import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const TABS = [
  { id: 'sensor', label: 'Sensors', color: '#16A34A', dot: '#22C55E', eyebrow: 'INPUT' },
  { id: 'motor', label: 'Motors', color: '#4F46E5', dot: '#4F46E5', eyebrow: 'OUTPUT' },
  { id: 'power', label: 'Power', color: '#EF4444', dot: '#EF4444', eyebrow: 'POWER RAIL' },
];

const VIEW_BOXES = {
  sensor: [760, 70, 420, 360],
  motor: [0, 120, 840, 500],
  power: [180, 0, 760, 430],
  full: [0, 0, 1200, 760],
};

// Sensor wires
const SENSOR_WIRES = [
  { d: 'M 960 130 C 930 130 900 205 790 240', color: '#EF4444', id: 'sw1' },
  { d: 'M 960 152 C 930 152 900 225 790 260', color: '#0A0A0A', id: 'sw2' },
  { d: 'M 960 174 C 930 174 900 245 790 280', color: '#FBBF24', id: 'sw3' },
  { d: 'M 960 300 C 930 300 900 300 790 300', color: '#EF4444', id: 'sw4' },
  { d: 'M 960 322 C 930 322 900 320 790 320', color: '#0A0A0A', id: 'sw5' },
  { d: 'M 960 344 C 930 344 900 340 790 340', color: '#FBBF24', id: 'sw6' },
];

const MOTOR_WIRES = [
  { d: 'M 150 420 C 250 455 430 488 540 500', color: '#A855F7', id: 'mw1' },
  { d: 'M 180 420 C 280 462 460 495 570 506', color: '#22C55E', id: 'mw2' },
  { d: 'M 210 420 C 310 468 490 500 600 512', color: '#3B82F6', id: 'mw3' },
  { d: 'M 240 420 C 340 474 520 504 630 518', color: '#F97316', id: 'mw4' },
  { d: 'M 270 420 C 370 478 550 508 660 524', color: '#EC4899', id: 'mw5' },
  { d: 'M 300 420 C 400 482 580 512 690 530', color: '#14B8A6', id: 'mw6' },
  { d: 'M 120 300 C 95 260 115 188 192 132', color: '#22C55E', id: 'mw7' },
  { d: 'M 120 322 C 88 298 110 220 192 148', color: '#FBBF24', id: 'mw8' },
  { d: 'M 340 300 C 390 340 390 520 300 575 C 255 590 220 585 192 565', color: '#22C55E', id: 'mw9' },
  { d: 'M 340 322 C 395 365 395 540 312 595 C 262 610 225 605 192 585', color: '#FBBF24', id: 'mw10' },
];

const POWER_WIRES = [
  { d: 'M 520 122 C 520 200 380 220 260 250', color: '#EF4444', id: 'pw1' },
  { d: 'M 560 122 C 560 210 430 225 300 250', color: '#0A0A0A', id: 'pw2' },
  { d: 'M 520 122 C 538 300 465 440 555 500', color: '#EF4444', id: 'pw3' },
  { d: 'M 795 490 C 760 420 520 310 300 250', color: '#0A0A0A', id: 'pw4' },
  { d: 'M 560 500 C 560 560 560 590 560 616', color: '#EF4444', id: 'pw5' },
  { d: 'M 740 500 C 740 566 740 606 740 636', color: '#0A0A0A', id: 'pw6' },
];

const ALL_WIRE_GROUPS = { sensor: SENSOR_WIRES, motor: MOTOR_WIRES, power: POWER_WIRES };

function PinRow({ from, to, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#0A0A0A' }}>
        {from}
      </span>
      <span style={{ fontSize: 12, color: '#A1A1A1' }}>→</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#0A0A0A' }}>
        {to}
      </span>
    </div>
  );
}

function PinCard({ title, rows }) {
  return (
    <div style={{
      background: '#F7F7F5',
      border: '1px solid rgba(10,10,10,0.08)',
      borderRadius: 10,
      padding: '14px 16px',
      marginBottom: 10,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#737373', marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</div>
      {rows.map((r, i) => <PinRow key={i} {...r} />)}
    </div>
  );
}

function ClassroomNote({ children, color = '#4F46E5' }) {
  return (
    <div style={{
      background: color === '#EF4444' ? '#FFF5F5' : '#EEF2FF',
      border: `1px solid ${color === '#EF4444' ? '#FECACA' : '#C7D2FE'}`,
      borderRadius: 8,
      padding: '10px 14px',
      marginTop: 12,
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color, marginBottom: 4 }}>
        {color === '#EF4444' ? '⚠ BEFORE CONNECTING' : 'CLASSROOM NOTE'}
      </div>
      <p style={{ fontSize: 12.5, color: '#262626', lineHeight: 1.55 }}>{children}</p>
    </div>
  );
}

function TabBody({ tab }) {
  if (tab === 'sensor') return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 99, background: '#DCFCE7', marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', letterSpacing: '0.04em', textTransform: 'uppercase' }}>INPUT</span>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0A0A0A', marginBottom: 10 }}>How the robot sees the line</h3>
      <p style={{ fontSize: 13.5, color: '#525252', lineHeight: 1.6, marginBottom: 14 }}>
        Each IR sensor shines infrared light down. Black tape absorbs it, white floor reflects it back.
        The sensor sends a digital signal — 0 or 1 — to the Arduino, which decides which way to steer.
      </p>
      <PinCard title="Left IR sensor · 3 wires" rows={[
        { from: 'VCC', to: 'Arduino 5V', color: '#22C55E' },
        { from: 'GND', to: 'Arduino GND', color: '#0A0A0A' },
        { from: 'OUT', to: 'Arduino D2', color: '#FBBF24' },
      ]} />
      <PinCard title="Right IR sensor · 3 wires" rows={[
        { from: 'VCC', to: 'Arduino 5V', color: '#22C55E' },
        { from: 'GND', to: 'Arduino GND', color: '#0A0A0A' },
        { from: 'OUT', to: 'Arduino D3', color: '#FBBF24' },
      ]} />
      <ClassroomNote>
        Arduino 5V and GND feed the breadboard rails, and both IR sensors tap into those shared rails. Only the OUT wires go directly to Arduino pins.
      </ClassroomNote>
    </div>
  );

  if (tab === 'motor') return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 99, background: '#EEF2FF', marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F46E5' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#4F46E5', letterSpacing: '0.04em', textTransform: 'uppercase' }}>OUTPUT</span>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0A0A0A', marginBottom: 10 }}>How the robot moves</h3>
      <p style={{ fontSize: 13.5, color: '#525252', lineHeight: 1.6, marginBottom: 14 }}>
        Arduino sends six control lines to the L298N: ENA/ENB for speed (PWM) and IN1-IN4 for direction.
        L298N then drives OUT1-OUT4 to spin each motor forward or reverse.
      </p>
      <PinCard title="Arduino → L298N (control) · 6 wires" rows={[
        { from: 'D5 (PWM)', to: 'ENA', color: '#A855F7' },
        { from: 'D6 (PWM)', to: 'ENB', color: '#22C55E' },
        { from: 'D8', to: 'IN1', color: '#3B82F6' },
        { from: 'D9', to: 'IN2', color: '#F97316' },
        { from: 'D10', to: 'IN3', color: '#EC4899' },
        { from: 'D11', to: 'IN4', color: '#14B8A6' },
      ]} />
      <PinCard title="L298N → motors · 4 wires" rows={[
        { from: 'OUT1 + OUT2', to: 'Left motor', color: '#22C55E' },
        { from: 'OUT3 + OUT4', to: 'Right motor', color: '#FBBF24' },
      ]} />
      <ClassroomNote>
        If the robot moves backward, swap the two motor wires at the L298N output — it flips the spin direction without changing any code.
      </ClassroomNote>
    </div>
  );

  if (tab === 'power') return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 99, background: '#FEF2F2', marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#EF4444', letterSpacing: '0.04em', textTransform: 'uppercase' }}>POWER RAIL</span>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0A0A0A', marginBottom: 10 }}>Where the energy flows</h3>
      <p style={{ fontSize: 13.5, color: '#525252', lineHeight: 1.6, marginBottom: 14 }}>
        The battery powers both the L298N (+12V/GND) and Arduino VIN directly. Arduino 5V and GND then
        feed the breadboard rails for sensors. All grounds must be common.
      </p>
      <PinCard title="Battery and supply lines" rows={[
        { from: 'Battery +', to: 'L298N +12V', color: '#EF4444' },
        { from: 'Battery -', to: 'L298N GND', color: '#0A0A0A' },
        { from: 'Battery +', to: 'Arduino VIN', color: '#EF4444' },
      ]} />
      <PinCard title="Breadboard and ground" rows={[
        { from: 'Arduino 5V', to: 'Breadboard + rail', color: '#EF4444' },
        { from: 'Arduino GND', to: 'Breadboard - rail', color: '#0A0A0A' },
        { from: 'Arduino GND', to: 'L298N GND', color: '#0A0A0A' },
      ]} />
      <ClassroomNote color="#EF4444">
        Double-check every connection before plugging in the battery. A shorted wire can permanently damage the Arduino or the motor driver.
      </ClassroomNote>
    </div>
  );

  return null;
}

export default function CircuitLab() {
  const { nextSection, prevSection } = useApp();
  const [activeTab, setActiveTab] = useState('sensor');
  const [viewBox, setViewBox] = useState(VIEW_BOXES.full);
  const [animateSignals, setAnimateSignals] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showConnectionInfo, setShowConnectionInfo] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    const newVB = VIEW_BOXES[activeTab];
    setViewBox(newVB);
    setIsZoomed(true);
  }, [activeTab]);

  function handleShowFull() {
    setViewBox(VIEW_BOXES.full);
    setIsZoomed(false);
  }

  const activeTabMeta = TABS.find(t => t.id === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header strip */}
      <div style={{ padding: '28px 64px 16px', flexShrink: 0, borderBottom: '1px solid rgba(10,10,10,0.06)', background: '#FAFAF7' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.15)', marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#4F46E5' }}>Understand the circuit</span>
        </div>
        <h1 className="headline-md" style={{ marginBottom: 6 }}>
          How parts <span className="font-serif-italic">talk</span> to each other
        </h1>
        <p style={{ fontSize: 14, color: '#525252', lineHeight: 1.55 }}>
          Select a subsystem on the right to zoom into that part of the circuit.
        </p>
      </div>

      {/* Split layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: circuit diagram (60%) */}
        <div style={{ width: '60%', padding: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            flex: 1,
            background: 'white',
            border: '1px solid rgba(10,10,10,0.08)',
            borderRadius: 16,
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Zoom pill overlay */}
            {isZoomed && (
              <div style={{
                position: 'absolute',
                top: 14,
                left: 14,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'white',
                borderRadius: 99,
                padding: '5px 10px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                border: '1px solid rgba(10,10,10,0.08)',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: activeTabMeta?.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: '#0A0A0A', whiteSpace: 'nowrap' }}>
                  Zoomed: {activeTab} subsystem
                </span>
                <div style={{ width: 1, height: 12, background: 'rgba(10,10,10,0.12)' }} />
                <button
                  onClick={handleShowFull}
                  style={{ fontSize: 11, fontWeight: 500, color: '#4F46E5', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Show full
                </button>
              </div>
            )}

            {/* Animate signals toggle */}
            <button
              onClick={() => setAnimateSignals(s => !s)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: animateSignals ? '#0A0A0A' : 'white',
                color: animateSignals ? 'white' : '#0A0A0A',
                border: '1px solid rgba(10,10,10,0.12)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Animate signals
            </button>

            <button
              onClick={() => setShowConnectionInfo(true)}
              style={{
                position: 'absolute',
                bottom: 14,
                right: 14,
                zIndex: 10,
                background: 'white',
                color: '#0A0A0A',
                border: '1px solid rgba(10,10,10,0.12)',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Connection info
            </button>

            {/* SVG Circuit diagram */}
            <svg
              ref={svgRef}
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
              style={{
                width: '100%',
                height: '100%',
                transition: 'viewBox 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <defs>
                <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="8" cy="8" r="0.8" fill="rgba(10,10,10,0.08)" />
                </pattern>
              </defs>
              <rect width="1200" height="760" fill="url(#dots)" />

              {/* Render wires for each subsystem */}
              {Object.entries(ALL_WIRE_GROUPS).map(([sub, wires]) =>
                wires.map(w => (
                  <g key={w.id}>
                    <path
                      d={w.d}
                      stroke={w.color}
                      strokeWidth={activeTab === sub ? 3.5 : 2.5}
                      strokeLinecap="round"
                      fill="none"
                      opacity={activeTab === sub ? 1 : 0.24}
                      style={{ transition: 'opacity 400ms, stroke-width 400ms' }}
                    />
                    {animateSignals && activeTab === sub && (
                      <circle r="5" fill={w.color} opacity="0.9">
                        <animateMotion dur="1.5s" repeatCount="indefinite" path={w.d} />
                      </circle>
                    )}
                  </g>
                ))
              )}

              {/* Battery pack */}
              <rect x="430" y="14" width="220" height="120" rx="10" fill="#F5F3FF" stroke="#7E22CE" strokeWidth="2" />
              <text x="540" y="44" textAnchor="middle" fontSize="24" fontFamily="Inter" fill="#1F2937" fontWeight="700">BATTERY PACK</text>
              <text x="540" y="74" textAnchor="middle" fontSize="20" fontFamily="Inter" fill="#374151">7.4V - 12V</text>
              <rect x="490" y="86" width="100" height="36" rx="3" fill="#FFFFFF" stroke="#111827" strokeWidth="2" />
              <text x="520" y="112" textAnchor="middle" fontSize="30" fill="#DC2626" fontWeight="700">+</text>
              <text x="560" y="112" textAnchor="middle" fontSize="30" fill="#111827" fontWeight="700">−</text>

              {/* L298N board */}
              <rect x="120" y="220" width="220" height="320" rx="6" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
              <rect x="140" y="250" width="120" height="26" rx="2" fill="#111827" />
              <text x="230" y="358" textAnchor="middle" fontSize="40" fontFamily="Inter" fill="#FDE68A" fontWeight="700">L298N</text>
              <text x="190" y="244" textAnchor="middle" fontSize="16" fontFamily="JetBrains Mono" fill="#FCA5A5">+12V   GND</text>
              <text x="160" y="300" fontSize="15" fontFamily="JetBrains Mono" fill="#FFFFFF">OUT1</text>
              <text x="160" y="322" fontSize="15" fontFamily="JetBrains Mono" fill="#FFFFFF">OUT2</text>
              <text x="280" y="300" fontSize="15" fontFamily="JetBrains Mono" fill="#FFFFFF">OUT3</text>
              <text x="280" y="322" fontSize="15" fontFamily="JetBrains Mono" fill="#FFFFFF">OUT4</text>
              <text x="148" y="418" fontSize="15" fontFamily="JetBrains Mono" fill="#FEE2E2">ENA IN1 IN2 IN3 IN4 ENB</text>

              {/* Motors */}
              <rect x="24" y="100" width="130" height="70" rx="10" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
              <text x="89" y="141" textAnchor="middle" fontSize="12" fontFamily="Inter" fill="#111827" fontWeight="600">LEFT MOTOR</text>
              <rect x="154" y="110" width="38" height="50" rx="4" fill="#9CA3AF" stroke="#4B5563" strokeWidth="2" />

              <rect x="24" y="550" width="130" height="70" rx="10" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
              <text x="89" y="591" textAnchor="middle" fontSize="12" fontFamily="Inter" fill="#111827" fontWeight="600">RIGHT MOTOR</text>
              <rect x="154" y="560" width="38" height="50" rx="4" fill="#9CA3AF" stroke="#4B5563" strokeWidth="2" />

              {/* Arduino UNO */}
              <rect x="430" y="220" width="420" height="300" rx="8" fill="#1D4ED8" stroke="#1E3A8A" strokeWidth="2" />
              <rect x="438" y="238" width="88" height="95" rx="5" fill="#9CA3AF" />
              <rect x="530" y="240" width="240" height="22" rx="4" fill="#1F2937" />
              <rect x="528" y="480" width="230" height="22" rx="4" fill="#1F2937" />
              <rect x="772" y="262" width="64" height="216" rx="4" fill="#1F2937" />
              <rect x="585" y="370" width="180" height="56" rx="6" fill="#111827" />
              <text x="642" y="355" textAnchor="middle" fontSize="38" fontFamily="Inter" fill="#E5E7EB" fontWeight="700">UNO</text>
              <text x="590" y="330" textAnchor="middle" fontSize="38" fontFamily="Inter" fill="#E5E7EB" fontWeight="700">ARDUINO</text>
              <text x="685" y="264" textAnchor="middle" fontSize="13" fontFamily="JetBrains Mono" fill="#F9FAFB">DIGITAL (PWM~)</text>
              <text x="660" y="498" textAnchor="middle" fontSize="13" fontFamily="JetBrains Mono" fill="#F9FAFB">POWER</text>

              {/* IR sensors on right */}
              <text x="1060" y="100" textAnchor="middle" fontSize="24" fontFamily="Inter" fill="#111827" fontWeight="700">IR SENSOR - LEFT</text>
              <rect x="960" y="112" width="190" height="78" rx="6" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2" />
              <rect x="968" y="124" width="90" height="54" rx="3" fill="#1D4ED8" />
              <circle cx="1130" cy="132" r="12" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
              <circle cx="1130" cy="170" r="12" fill="#111827" stroke="#6B7280" strokeWidth="2" />
              <text x="968" y="130" fontSize="14" fontFamily="JetBrains Mono" fill="#111827">VCC</text>
              <text x="968" y="152" fontSize="14" fontFamily="JetBrains Mono" fill="#111827">GND</text>
              <text x="968" y="174" fontSize="14" fontFamily="JetBrains Mono" fill="#111827">OUT</text>

              <text x="1060" y="270" textAnchor="middle" fontSize="24" fontFamily="Inter" fill="#111827" fontWeight="700">IR SENSOR - RIGHT</text>
              <rect x="960" y="282" width="190" height="78" rx="6" fill="#2563EB" stroke="#1E3A8A" strokeWidth="2" />
              <rect x="968" y="294" width="90" height="54" rx="3" fill="#1D4ED8" />
              <circle cx="1130" cy="302" r="12" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
              <circle cx="1130" cy="340" r="12" fill="#111827" stroke="#6B7280" strokeWidth="2" />
              <text x="968" y="300" fontSize="14" fontFamily="JetBrains Mono" fill="#111827">VCC</text>
              <text x="968" y="322" fontSize="14" fontFamily="JetBrains Mono" fill="#111827">GND</text>
              <text x="968" y="344" fontSize="14" fontFamily="JetBrains Mono" fill="#111827">OUT</text>

              {/* Breadboard */}
              <rect x="380" y="590" width="460" height="130" rx="8" fill="#F3F4F6" stroke="#2563EB" strokeWidth="2" />
              <line x1="395" y1="616" x2="825" y2="616" stroke="#DC2626" strokeWidth="3" />
              <line x1="395" y1="636" x2="825" y2="636" stroke="#2563EB" strokeWidth="3" />
              <text x="388" y="614" fontSize="32" fill="#DC2626">+</text>
              <text x="388" y="639" fontSize="28" fill="#2563EB">−</text>

            </svg>

            {/* Color legend */}
            <div style={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'white',
              borderRadius: 99,
              padding: '5px 12px',
              border: '1px solid rgba(10,10,10,0.08)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              {[
                { color: '#EF4444', label: 'Power (5V/12V)' },
                { color: '#0A0A0A', label: 'Ground (GND)' },
                { color: '#FBBF24', label: 'Signal / Data' },
                { color: '#22C55E', label: 'Motor wires' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 14, height: 2.5, background: color, borderRadius: 1 }} />
                  <span style={{ fontSize: 11, color: '#525252', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>

            {showConnectionInfo && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 30,
                  background: 'rgba(10,10,10,0.42)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 16,
                }}
                onClick={() => setShowConnectionInfo(false)}
              >
                <div
                  style={{
                    width: 'min(640px, 96%)',
                    background: 'white',
                    borderRadius: 14,
                    border: '1px solid rgba(10,10,10,0.08)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    padding: 18,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Connection Info</div>
                    <button
                      onClick={() => setShowConnectionInfo(false)}
                      style={{
                        border: '1px solid rgba(10,10,10,0.15)',
                        background: 'white',
                        borderRadius: 8,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Close
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ background: '#F9FAFB', border: '1px solid #DBEAFE', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>L298N ↔ Arduino Connections</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#1F2937', lineHeight: 1.65 }}>
                        ENA → D5 (PWM)<br />
                        ENB → D6 (PWM)<br />
                        IN1 → D8<br />
                        IN2 → D9<br />
                        IN3 → D10<br />
                        IN4 → D11
                      </div>
                    </div>

                    <div style={{ background: '#F9FAFB', border: '1px solid #DBEAFE', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Power Summary</div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#1F2937', lineHeight: 1.65 }}>
                        Battery + → L298N +12V<br />
                        Battery − → L298N GND<br />
                        Arduino VIN → Battery + (7-12V)<br />
                        Arduino GND → Common GND<br />
                        Arduino 5V → Breadboard + rail<br />
                        Arduino GND → Breadboard − rail<br />
                        All GNDs must be common
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: info panel (40%) */}
        <div style={{ width: '40%', borderLeft: '1px solid rgba(10,10,10,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'white' }}>
          {/* Tab group */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(10,10,10,0.06)', flexShrink: 0 }}>
            <div style={{
              display: 'flex',
              background: 'rgba(10,10,10,0.04)',
              borderRadius: 10,
              padding: 4,
              gap: 4,
            }} role="tablist">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '7px 12px',
                    borderRadius: 7,
                    fontSize: 13,
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    color: activeTab === tab.id ? '#0A0A0A' : '#737373',
                    background: activeTab === tab.id ? 'white' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px' }}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <TabBody tab={activeTab} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: 'rgba(250,250,247,0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(10,10,10,0.08)',
        padding: '14px 64px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={prevSection}
          style={{ padding: '10px 18px', background: 'transparent', border: '1px solid rgba(10,10,10,0.15)', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', color: '#0A0A0A', fontFamily: 'Inter, sans-serif' }}
        >← Back</button>
        <button
          onClick={nextSection}
          style={{ padding: '10px 20px', background: '#0A0A0A', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'transform 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >Continue to assembly →</button>
      </div>
    </div>
  );
}
