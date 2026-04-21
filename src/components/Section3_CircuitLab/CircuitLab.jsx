import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

const TABS = [
  { id: 'sensor', label: 'Sensors', color: '#16A34A', dot: '#22C55E', eyebrow: 'INPUT' },
  { id: 'motor', label: 'Motors', color: '#4F46E5', dot: '#4F46E5', eyebrow: 'OUTPUT' },
  { id: 'power', label: 'Power', color: '#EF4444', dot: '#EF4444', eyebrow: 'POWER RAIL' },
];

const VIEW_BOXES = {
  sensor: '30 80 380 360',
  motor: '380 60 400 400',
  power: '40 60 720 460',
  full: '0 0 760 520',
};

// Sensor wires
const SENSOR_WIRES = [
  { d: 'M 170 145 Q 240 145 310 210', color: '#22C55E', id: 'sw1' },
  { d: 'M 170 155 Q 250 155 310 230', color: '#0A0A0A', id: 'sw2' },
  { d: 'M 170 165 Q 260 165 310 250', color: '#FBBF24', id: 'sw3' },
  { d: 'M 170 345 Q 240 345 310 270', color: '#22C55E', id: 'sw4' },
  { d: 'M 170 355 Q 250 355 310 295', color: '#0A0A0A', id: 'sw5' },
  { d: 'M 170 365 Q 260 365 310 315', color: '#FBBF24', id: 'sw6' },
];

const MOTOR_WIRES = [
  { d: 'M 470 225 Q 555 190 640 190', color: '#4F46E5', id: 'mw1' },
  { d: 'M 470 245 Q 555 215 640 215', color: '#4F46E5', id: 'mw2' },
  { d: 'M 470 265 Q 555 255 640 255', color: '#4F46E5', id: 'mw3' },
  { d: 'M 470 285 Q 555 285 640 285', color: '#4F46E5', id: 'mw4' },
  { d: 'M 640 165 Q 590 130 535 115', color: '#374151', id: 'mw5' },
  { d: 'M 640 330 Q 590 380 535 410', color: '#374151', id: 'mw6' },
];

const POWER_WIRES = [
  { d: 'M 120 450 Q 380 450 640 220', color: '#EF4444', id: 'pw1' },
  { d: 'M 120 480 Q 380 480 640 290', color: '#0A0A0A', id: 'pw2' },
  { d: 'M 640 165 Q 560 130 470 210', color: '#EF4444', id: 'pw3' },
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
        Breadboard carries one shared VCC and GND rail. Both sensors tap into it — you don't need separate wires to the Arduino for each one's power.
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
        Arduino sends four signals to the L298N — two per motor. Different combinations make each wheel spin
        forward, backward, or stop. That's how the robot turns: one wheel runs while the other pauses.
      </p>
      <PinCard title="Arduino → L298N (control) · 4 wires" rows={[
        { from: 'D5', to: 'IN1', color: '#4F46E5' },
        { from: 'D6', to: 'IN2', color: '#4F46E5' },
        { from: 'D7', to: 'IN3', color: '#4F46E5' },
        { from: 'D8', to: 'IN4', color: '#4F46E5' },
      ]} />
      <PinCard title="L298N → motors · 4 wires" rows={[
        { from: 'OUT1/OUT2', to: 'Right motor', color: '#374151' },
        { from: 'OUT3/OUT4', to: 'Left motor', color: '#374151' },
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
        The 9V battery powers the motor driver. The motor driver has a built-in 5V regulator that powers
        the Arduino, which in turn powers the sensors. One battery, one current path.
      </p>
      <PinCard title="Battery → L298N" rows={[
        { from: '9V+', to: '12V terminal', color: '#EF4444' },
        { from: '9V-', to: 'GND terminal', color: '#0A0A0A' },
      ]} />
      <PinCard title="L298N → Arduino (shared ground)" rows={[
        { from: '5V out', to: 'Arduino VIN', color: '#EF4444' },
        { from: 'GND', to: 'Arduino GND', color: '#0A0A0A' },
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
              <rect width="760" height="520" fill="url(#dots)" />

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
                      opacity={activeTab === sub ? 1 : 0.1}
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

              {/* Left IR sensor */}
              <rect x="80" y="110" width="90" height="90" rx="6" fill="#1E40AF" />
              <circle cx="112" cy="155" r="14" fill="#0A0A0A" /><circle cx="112" cy="155" r="7" fill="#B87333" />
              <circle cx="138" cy="155" r="14" fill="#0A0A0A" /><circle cx="138" cy="155" r="7" fill="#B87333" />
              <text x="125" y="108" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#4F46E5" fontWeight="500">LEFT IR</text>
              <rect x="100" y="196" width="8" height="16" rx="1" fill="#B8B8B8" />
              <rect x="114" y="196" width="8" height="16" rx="1" fill="#B8B8B8" />
              <rect x="128" y="196" width="8" height="16" rx="1" fill="#B8B8B8" />
              <text x="96" y="220" fontSize="7" fontFamily="JetBrains Mono" fill="#A1A1A1">VCC GND OUT</text>

              {/* Right IR sensor */}
              <rect x="80" y="310" width="90" height="90" rx="6" fill="#1E40AF" />
              <circle cx="112" cy="355" r="14" fill="#0A0A0A" /><circle cx="112" cy="355" r="7" fill="#B87333" />
              <circle cx="138" cy="355" r="14" fill="#0A0A0A" /><circle cx="138" cy="355" r="7" fill="#B87333" />
              <text x="125" y="308" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#4F46E5" fontWeight="500">RIGHT IR</text>
              <rect x="100" y="396" width="8" height="16" rx="1" fill="#B8B8B8" />
              <rect x="114" y="396" width="8" height="16" rx="1" fill="#B8B8B8" />
              <rect x="128" y="396" width="8" height="16" rx="1" fill="#B8B8B8" />
              <text x="96" y="420" fontSize="7" fontFamily="JetBrains Mono" fill="#A1A1A1">VCC GND OUT</text>

              {/* Arduino UNO */}
              <rect x="310" y="200" width="160" height="120" rx="6" fill="#006B3F" />
              <rect x="322" y="212" width="60" height="48" rx="3" fill="#004D2D" />
              <rect x="390" y="212" width="50" height="20" rx="2" fill="#004D2D" />
              <rect x="326" y="252" width="52" height="14" rx="2" fill="#004D2D" />
              <circle cx="452" cy="220" r="5" fill="#F59E0B" />
              <text x="390" y="198" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#22C55E" fontWeight="500">ARDUINO UNO</text>
              <text x="316" y="310" fontSize="7" fontFamily="JetBrains Mono" fill="#86EFAC">5V D2 D3 GND</text>
              <text x="398" y="310" fontSize="7" fontFamily="JetBrains Mono" fill="#86EFAC">D5 D6 D7 D8</text>

              {/* L298N */}
              <rect x="620" y="140" width="110" height="220" rx="6" fill="#DC2626" />
              <rect x="630" y="155" width="50" height="50" rx="3" fill="#0A0A0A" />
              <rect x="650" y="150" width="10" height="8" rx="1" fill="#374151" />
              <rect x="660" y="150" width="10" height="8" rx="1" fill="#374151" />
              <rect x="630" y="340" width="30" height="10" rx="2" fill="#1E3A8A" />
              <rect x="665" y="340" width="30" height="10" rx="2" fill="#1E3A8A" />
              <text x="675" y="138" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#FCA5A5" fontWeight="500">L298N</text>
              <text x="626" y="220" fontSize="7" fontFamily="JetBrains Mono" fill="#FCA5A5">IN1</text>
              <text x="626" y="235" fontSize="7" fontFamily="JetBrains Mono" fill="#FCA5A5">IN2</text>
              <text x="626" y="250" fontSize="7" fontFamily="JetBrains Mono" fill="#FCA5A5">IN3</text>
              <text x="626" y="265" fontSize="7" fontFamily="JetBrains Mono" fill="#FCA5A5">IN4</text>

              {/* Right motor */}
              <rect x="500" y="80" width="100" height="55" rx="6" fill="#374151" />
              <circle cx="570" cy="107" r="20" fill="#1F2937" /><circle cx="570" cy="107" r="8" fill="#4B5563" />
              <text x="540" y="76" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="#9CA3AF">RIGHT MOTOR</text>

              {/* Left motor */}
              <rect x="500" y="385" width="100" height="55" rx="6" fill="#374151" />
              <circle cx="570" cy="412" r="20" fill="#1F2937" /><circle cx="570" cy="412" r="8" fill="#4B5563" />
              <text x="540" y="380" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono" fill="#9CA3AF">LEFT MOTOR</text>

              {/* 9V Battery */}
              <rect x="60" y="440" width="70" height="50" rx="5" fill="#16A34A" />
              <text x="95" y="460" textAnchor="middle" fontSize="10" fill="white" fontWeight="600">9V</text>
              <rect x="128" y="452" width="8" height="10" rx="2" fill="#9CA3AF" />
              <text x="65" y="502" fontSize="8" fontFamily="JetBrains Mono" fill="#A1A1A1">BATTERY</text>
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
                { color: '#22C55E', label: 'VCC' },
                { color: '#0A0A0A', label: 'GND' },
                { color: '#FBBF24', label: 'Signal' },
                { color: '#EF4444', label: 'Power' },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 14, height: 2.5, background: color, borderRadius: 1 }} />
                  <span style={{ fontSize: 11, color: '#525252', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
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
