import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EyebrowPill } from '../../shared/Badge';

const CARD_DATA = [
  {
    eyebrow: 'THE BRAIN',
    name: 'Arduino UNO',
    tooltip: 'The brain. A small programmable board that reads sensors and tells motors what to do.',
  },
  {
    eyebrow: 'THE EYES',
    name: 'IR sensors ×2',
    tooltip: 'The eyes. They shine infrared light down and detect whether the surface is black or white.',
  },
  {
    eyebrow: 'THE CONTROLLER',
    name: 'L298N driver',
    tooltip: "The controller. Arduino can't drive motors directly — this chip does it safely.",
  },
  {
    eyebrow: 'THE WHEELS',
    name: 'BO motors ×2',
    tooltip: 'The legs. Two small geared motors turn the wheels left and right.',
  },
];

function ComponentTag({ eyebrow, name, tooltip }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  return (
    <div style={{ position: 'relative' }}>
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: '110%',
            left: 0,
            width: 240,
            background: '#0A0A0A',
            color: 'white',
            borderRadius: 10,
            padding: '14px 16px',
            zIndex: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: '#737373', textTransform: 'uppercase', marginBottom: 6 }}>
            {eyebrow}
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.55, color: '#E5E5E5' }}>{tooltip}</p>
          <div style={{ position: 'absolute', bottom: -6, left: 16, width: 12, height: 12, background: '#0A0A0A', transform: 'rotate(45deg)' }} />
        </div>
      )}
      <button
        ref={ref}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.6)',
          padding: '12px 14px',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.95)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: '#737373', textTransform: 'uppercase', marginBottom: 3 }}>
            {eyebrow}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0A0A0A' }}>{name}</div>
        </div>
        <ChevronRight size={14} color="#A1A1A1" />
      </button>
    </div>
  );
}

export default function HeroSection() {
  const { nextSection } = useApp();

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left column */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '55%',
          padding: '64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <EyebrowPill dot color="#4F46E5">Activity 01 · Grades 9–10</EyebrowPill>

        <h1 className="headline-xl" style={{ marginBottom: 20, maxWidth: 560 }}>
          Today we'll{' '}
          <span className="font-serif-italic">build</span>{' '}
          a Line Following Robot
        </h1>

        <p style={{ fontSize: 18, color: '#404040', lineHeight: 1.55, maxWidth: 460, marginBottom: 32, letterSpacing: '-0.005em' }}>
          The same idea used by warehouse robots, hospital couriers, and factory floor carriers — a robot that sees a line on the ground and follows it.
        </p>

        {/* Button row */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 36 }}>
          <button
            onClick={nextSection}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 22px',
              borderRadius: 10,
              background: '#0A0A0A',
              color: 'white',
              fontSize: 15,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            aria-label="Start building the robot"
          >
            Start building <ArrowRight size={16} />
          </button>

          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 18px',
              borderRadius: 10,
              background: 'transparent',
              color: '#0A0A0A',
              fontSize: 15,
              fontWeight: 500,
              fontFamily: 'Inter, sans-serif',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Watch the demo video"
          >
            <span style={{
              width: 32,
              height: 32,
              background: '#F1EFE8',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Play size={12} fill="#0A0A0A" color="#0A0A0A" />
            </span>
            Watch the demo
          </button>
        </div>

        {/* Stats row */}
        <div style={{ borderTop: '1px solid rgba(10,10,10,0.08)', paddingTop: 28, display: 'flex', gap: 40 }}>
          {[
            { num: '13', label: 'Assembly steps' },
            { num: '11', label: 'Real components' },
            { num: '~45 min', label: 'Class duration' },
          ].map(({ num, label }) => (
            <div key={label}>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{num}</div>
              <div style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right column */}
      <div style={{
        width: '45%',
        background: '#F1EFE8',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* SVG track illustration */}
        <svg
          viewBox="0 0 600 620"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="rgba(10,10,10,0.1)" />
            </pattern>
            <path
              id="tp"
              d="M 80 540 Q 140 540 180 480 Q 220 420 300 420 Q 400 420 440 340 Q 480 260 380 220 Q 280 180 300 100 Q 320 20 440 40 Q 555 55 620 140"
              fill="none"
            />
          </defs>

          {/* Dot grid */}
          <rect width="600" height="620" fill="url(#grid)" />

          {/* Track path border */}
          <use
            href="#tp"
            stroke="rgba(10,10,10,0.08)"
            strokeWidth="28"
            fill="none"
            strokeLinecap="round"
          />

          {/* Track path */}
          <use
            href="#tp"
            stroke="#0A0A0A"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="1"
            strokeDashoffset="1"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1"
              to="0"
              dur="1.6s"
              begin="0.3s"
              fill="freeze"
            />
          </use>

          {/* Robot body */}
          <g opacity="0">
            <animate attributeName="opacity" from="0" to="1" begin="1.8s" dur="0.4s" fill="freeze" />

            {/* Robot following the path */}
            <g>
              <animateMotion dur="9s" repeatCount="indefinite" begin="1.8s" rotate="auto">
                <mpath href="#tp" />
              </animateMotion>
              <image
                href="/robot_png.png"
                x="-48"
                y="-32"
                width="96"
                height="64"
                preserveAspectRatio="xMidYMid meet"
                transform="rotate(180)"
              />
            </g>
          </g>
        </svg>

        {/* Status chip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          style={{
            position: 'absolute',
            top: 28,
            right: 28,
            background: 'white',
            borderRadius: 10,
            padding: '10px 14px',
            boxShadow: '0 4px 20px rgba(10,10,10,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            className="animate-pulse-dot"
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#0A0A0A', whiteSpace: 'nowrap' }}>
            Tracking line · IR sensors active
          </span>
        </motion.div>

        {/* Component tag grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1, duration: 0.5 }}
          style={{
            position: 'absolute',
            bottom: 32,
            left: 32,
            right: 32,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
        >
          {CARD_DATA.map((card) => (
            <ComponentTag key={card.eyebrow} {...card} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
