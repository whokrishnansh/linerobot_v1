import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, ChevronRight, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EyebrowPill } from '../../shared/Badge';

const CARD_DATA = [
  {
    eyebrow: 'The Brain',
    name: 'Arduino UNO',
    tooltip: 'This is the robot brain. It reads clues from the sensors and tells the motors what to do next.',
    color: 'var(--yellow-100)',
  },
  {
    eyebrow: 'The Eyes',
    name: 'IR sensors x2',
    tooltip: 'These tiny eyes look at the floor and notice the dark line so the robot can stay on track.',
    color: 'var(--mint-100)',
  },
  {
    eyebrow: 'The Driver',
    name: 'L298N board',
    tooltip: 'This helper chip gives the motors enough power so the Arduino does not have to do the heavy lifting.',
    color: 'var(--purple-100)',
  },
  {
    eyebrow: 'The Wheels',
    name: 'BO motors x2',
    tooltip: 'The motors are the robot muscles. One speeds up, one slows down, and the robot turns smoothly.',
    color: 'var(--pink-100)',
  },
];

function ComponentTag({ eyebrow, name, tooltip, color }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {open && (
        <div
          className="kid-surface"
          style={{
            position: 'absolute',
            bottom: '112%',
            left: 0,
            width: 260,
            background: 'var(--paper)',
            borderRadius: 22,
            padding: '16px 16px 14px',
            zIndex: 20,
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-700)' }}>{tooltip}</p>
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="kid-surface"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 22,
          padding: '14px 16px',
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          background: color,
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.04em', color: 'var(--ink-700)', textTransform: 'uppercase', marginBottom: 3 }}>
            {eyebrow}
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink-900)' }}>{name}</div>
        </div>
        <ChevronRight size={16} color="var(--ink-500)" />
      </button>
    </div>
  );
}

export default function HeroSection() {
  const { nextSection } = useApp();

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
        padding: '10px 24px 24px',
        gap: 20,
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="kid-surface"
        style={{
          width: '54%',
          padding: '48px 48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flexShrink: 0,
          borderRadius: 36,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,253,248,0.98))',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 18, right: 24, display: 'flex', gap: 10 }}>
          <span className="kid-pill" style={{ background: 'var(--yellow-100)' }}><Star size={14} color="var(--orange-500)" /> Ages 13+</span>
        </div>

        <EyebrowPill dot color="#8d69ff">Activity 01 · Build your robot buddy</EyebrowPill>

        <h1 className="headline-xl" style={{ marginBottom: 20, maxWidth: 620 }}>
          Let&apos;s build a
          <br />
          <span className="font-serif-italic">line-following</span>
          <br />
          robot!
        </h1>

        <p className="body-lg" style={{ maxWidth: 520, marginBottom: 30 }}>
          We&apos;ll teach a tiny robot how to spot a track, think fast, and zoom the right way. It&apos;s part puzzle, part machine, and very fun once it starts moving.
        </p>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 34, flexWrap: 'wrap' }}>
          <button onClick={nextSection} className="kid-primary" aria-label="Start building the robot">
            Start the mission <ArrowRight size={18} />
          </button>

          <button className="kid-secondary" aria-label="Watch the demo video">
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'var(--purple-100)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play size={14} fill="var(--purple-500)" color="var(--purple-500)" />
            </span>
            Watch demo
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14, marginBottom: 26 }}>
          {[
            { num: '13', label: 'Build steps' },
            { num: '11', label: 'Cool parts' },
            { num: '45 min', label: 'Class adventure' },
          ].map(({ num, label }, index) => (
            <div
              key={label}
              className="kid-surface"
              style={{
                borderRadius: 24,
                padding: '18px 18px 16px',
                background: index === 0 ? 'var(--yellow-100)' : index === 1 ? 'var(--mint-100)' : 'var(--pink-100)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 1, color: 'var(--ink-900)' }}>{num}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-700)', marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {CARD_DATA.map((card) => (
            <ComponentTag key={card.name} {...card} />
          ))}
        </div>
      </motion.div>

      <div
        className="kid-surface"
        style={{
          width: '46%',
          background: 'linear-gradient(180deg, #dff1ff 0%, #f5fbff 100%)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0,
          borderRadius: 36,
        }}
      >
        <svg
          viewBox="0 0 600 620"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2.2" fill="rgba(53,83,199,0.12)" />
            </pattern>
            <path
              id="tp"
              d="M 80 540 Q 140 540 180 480 Q 220 420 300 420 Q 400 420 440 340 Q 480 260 380 220 Q 280 180 300 100 Q 320 20 440 40 Q 555 55 620 140"
              fill="none"
            />
          </defs>

          <rect width="600" height="620" fill="url(#grid)" />
          <rect x="18" y="18" width="564" height="584" rx="28" fill="rgba(255,255,255,0.26)" />

          <use
            href="#tp"
            stroke="rgba(53,83,199,0.12)"
            strokeWidth="34"
            fill="none"
            strokeLinecap="round"
          />
          <use
            href="#tp"
            stroke="#26328A"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="1"
            strokeDashoffset="1"
          >
            <animate attributeName="stroke-dashoffset" from="1" to="0" dur="1.6s" begin="0.3s" fill="freeze" />
          </use>

          <g opacity="0">
            <animate attributeName="opacity" from="0" to="1" begin="1.6s" dur="0.4s" fill="freeze" />
            <g>
              <g>
                <animateMotion dur="8.5s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#tp" />
                </animateMotion>
                <g transform="rotate(180)">
                  <image href="/robot_png.png" xlinkHref="/robot_png.png" x="-30" y="-30" width="60" height="60" preserveAspectRatio="xMidYMid meet" />
                </g>
              </g>
              <circle r="38" fill="rgba(53,83,199,0.08)">
                <animateMotion dur="8.5s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#tp" />
                </animateMotion>
              </circle>
            </g>
          </g>
        </svg>

        <div style={{ position: 'absolute', top: 22, left: 22 }} className="kid-pill">
          <span className="animate-pulse-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--mint-500)' }} />
          <span style={{ fontWeight: 800, color: 'var(--ink-900)' }}>Tracking line and learning turns</span>
        </div>

        <div style={{ position: 'absolute', right: 22, bottom: 34, left: 22, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          {CARD_DATA.map((card) => (
            <div
              key={card.name}
              className="kid-surface"
              style={{
                borderRadius: 24,
                padding: '16px',
                background: 'rgba(255,255,255,0.76)',
              }}
            >
              <div className="eyebrow" style={{ marginBottom: 6 }}>{card.eyebrow}</div>
              <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', lineHeight: 1, color: 'var(--ink-900)' }}>{card.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
