import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { USE_CASES } from '../../data/useCases';

// ─── Snake path (SVG coords 0–800 × 0–1500) ──────────────────────────────────
const PATH_D =
  'M 400 20 L 400 110 Q 400 160 350 160 L 180 160 Q 130 160 130 210 L 130 270 ' +
  'Q 130 320 180 320 L 620 320 Q 670 320 670 370 L 670 430 Q 670 480 620 480 ' +
  'L 180 480 Q 130 480 130 530 L 130 590 Q 130 640 180 640 L 620 640 ' +
  'Q 670 640 670 690 L 670 750 Q 670 800 620 800 L 180 800 Q 130 800 130 850 ' +
  'L 130 910 Q 130 960 180 960 L 620 960 Q 670 960 670 1010 ' +
  'L 670 1070 Q 670 1120 620 1120 L 180 1120 Q 130 1120 130 1170 ' +
  'L 130 1240 Q 130 1290 180 1290 L 400 1290 L 400 1380';

// Path-T values calibrated to the 5 snake stops above
const CARD_STOPS = [
  { pathT: 0.08 },
  { pathT: 0.24 },
  { pathT: 0.44 },
  { pathT: 0.63 },
  { pathT: 0.82 },
];

// Card CSS positions (in the 900px-wide container with 64px h-padding → 772px content)
// SVG viewBox 800 wide → scale ≈ 0.965; xMidYMin meet
const CARD_POSITIONS = [
  { top: 60,  left: 'calc(50% - 310px)' },  // near top, left side
  { top: 255, left: 'calc(50% + 20px)' },   // right side
  { top: 445, left: 'calc(50% - 310px)' },  // left side
  { top: 635, left: 'calc(50% + 20px)' },   // right side
  { top: 1045, left: 'calc(50% - 310px)' }, // left side (before finale)
];

const ROBOT_MARKER_IMAGE = '/robot_png.png';
const ROBOT_FORWARD_OFFSET_DEG = -90;

// ─── Robot drawn inside SVG coordinate space ──────────────────────────────────
function RobotMarker({ x, y, angle }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle + ROBOT_FORWARD_OFFSET_DEG})`}>
      <image
        href={ROBOT_MARKER_IMAGE}
        xlinkHref={ROBOT_MARKER_IMAGE}
        x={-32}
        y={-32}
        width={64}
        height={64}
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  );
}

// ─── Flip card ────────────────────────────────────────────────────────────────
function FlipCard({ useCase, isRevealed, isNext, index }) {
  return (
    <div
      style={{
        width: 300,
        height: 172,
        perspective: 800,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.34,1.2,0.64,1)',
          transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* BACK face — locked/clickable */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: 12,
            background: '#0F0F0F',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            overflow: 'hidden',
            border: isNext ? `2px solid ${useCase.badgeColor}` : '1px solid rgba(255,255,255,0.06)',
            boxShadow: isNext ? `0 0 24px ${useCase.badgeColor}40` : 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
        >
          {/* Use-case image thumbnail */}
          {useCase.thumbnail && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${useCase.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: useCase.thumbnailPosition || 'center',
              filter: 'saturate(0.9) contrast(1.05)',
              transform: 'scale(1.03)',
            }} />
          )}

          {/* Dark tint for locked-card look + readable text */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10,10,10,0.60) 0%, rgba(10,10,10,0.82) 100%)',
          }} />

          {/* Diagonal stripe texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 14px)',
          }} />

          <div style={{
            position: 'relative',
            width: 10, height: 10, borderRadius: '50%',
            background: useCase.badgeColor,
            boxShadow: `0 0 12px ${useCase.badgeColor}`,
          }} />

          <span style={{
            position: 'relative',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: 'rgba(255,255,255,0.72)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textShadow: '0 1px 1px rgba(0,0,0,0.5)',
          }}>
            {String(index + 1).padStart(2, '0')} / {isNext ? 'click to reveal' : 'locked'}
          </span>
        </div>

        {/* FRONT face — revealed content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 12,
            background: useCase.dark ? '#0A0A0A' : 'white',
            border: useCase.dark ? 'none' : '1px solid rgba(10,10,10,0.08)',
            padding: '18px 20px 32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{
              display: 'inline-flex',
              padding: '3px 10px',
              borderRadius: 99,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.04em',
              background: `${useCase.badgeColor}20`,
              color: useCase.badgeColor,
              marginBottom: 8,
            }}>
              {useCase.badge}
            </span>
            <p style={{ fontSize: 12.5, fontWeight: 600, color: useCase.dark ? '#E5E5E5' : '#0A0A0A', marginBottom: 5, lineHeight: 1.35 }}>
              {useCase.company}
            </p>
            <p style={{ fontSize: 12, color: useCase.dark ? '#A1A1A1' : '#525252', lineHeight: 1.45 }}>
              {useCase.headline}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {useCase.stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 14, fontWeight: 600, color: useCase.dark ? '#E5E5E5' : '#0A0A0A' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: useCase.dark ? '#555' : '#A1A1A1' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section 5 component ─────────────────────────────────────────────────
export default function RealWorld() {
  const { prevSection, nextSection } = useApp();

  // ⚠️ Local state — NOT persisted. Tour always starts fresh.
  const [revealedCards, setRevealedCards] = useState([]);
  const [robotProgress, setRobotProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [started, setStarted] = useState(false);
  const [showFinale, setShowFinale] = useState(false);

  const svgRef = useRef(null);
  const robotPosRef = useRef({ x: 400, y: 20, angle: 90 });
  const [robotPos, setRobotPos] = useState({ x: 400, y: 20, angle: 90 });
  const animRef = useRef(null);

  const nextCardIndex = revealedCards.length;
  const allRevealed = revealedCards.length === USE_CASES.length;

  // Show finale when all revealed
  useEffect(() => {
    if (allRevealed && started) {
      const t = setTimeout(() => setShowFinale(true), 800);
      return () => clearTimeout(t);
    }
  }, [allRevealed, started]);

  // Update robot SVG position from pathProgress
  useEffect(() => {
    if (!started) return;
    const svg = svgRef.current;
    if (!svg) return;
    const path = svg.getElementById('snake-path');
    if (!path) return;
    try {
      const totalLen = path.getTotalLength();
      const len = robotProgress * totalLen;
      const pt = path.getPointAtLength(Math.min(len, totalLen));
      const pt2 = path.getPointAtLength(Math.min(len + 4, totalLen));
      const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI);
      setRobotPos({ x: pt.x, y: pt.y, angle });
    } catch {
      // Ignore if path not ready
    }
  }, [robotProgress, started]);

  const animateTo = useCallback((targetProgress, onDone) => {
    if (isAnimating) return;
    setIsAnimating(true);
    const startProgress = robotProgress;
    const dist = targetProgress - startProgress;
    const duration = Math.max(1400, Math.abs(dist) * 4200);
    const t0 = performance.now();

    function step(now) {
      const t = Math.min(1, (now - t0) / duration);
      // cubic ease-in-out
      const e = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      const p = startProgress + dist * e;
      setRobotProgress(p);
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setRobotProgress(targetProgress);
        setIsAnimating(false);
        onDone?.();
      }
    }
    animRef.current = requestAnimationFrame(step);
  }, [isAnimating, robotProgress]);

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  function handleStart() {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setRevealedCards([]);
    setRobotProgress(0);
    setRobotPos({ x: 400, y: 20, angle: 90 });
    setStarted(true);
    setShowFinale(false);
    setIsAnimating(false);
  }

  function handleCardClick(idx) {
    if (!started || idx !== nextCardIndex || isAnimating || revealedCards.includes(idx)) return;
    const target = CARD_STOPS[idx].pathT;
    animateTo(target, () => {
      setTimeout(() => {
        setRevealedCards(prev => [...prev, idx]);
      }, 250);
    });
  }

  return (
    <div style={{ overflowY: 'auto', background: '#FAFAF7', minHeight: '100%' }}>

      {/* Hero text */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 64px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#737373', fontWeight: 500, marginBottom: 14 }}>
          You built it. Now see where it lives.
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#0A0A0A', marginBottom: 14 }}>
          The same idea <em style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>powers</em> billion-dollar industries.
        </h1>
        <p style={{ fontSize: 16, color: '#525252', lineHeight: 1.6, maxWidth: 540, margin: '0 auto 24px' }}>
          As the robot reaches each stop, click the card to reveal how line-following is used in the real world.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          <button
            id="btn-start-tour"
            onClick={handleStart}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 20px',
              background: started ? 'white' : '#0A0A0A',
              color: started ? '#0A0A0A' : 'white',
              border: '1px solid rgba(10,10,10,0.2)',
              borderRadius: 10, fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              transition: 'box-shadow 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <RotateCcw size={14} />
            {started ? 'Restart tour' : 'Start the tour'}
          </button>

          {!started && (
            <button
              onClick={prevSection}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none',
                fontSize: 14, color: '#737373', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <ChevronLeft size={14} /> Back to Assembly
            </button>
          )}
        </div>

        {started && !allRevealed && (
          <p style={{ marginTop: 14, fontSize: 13, color: '#737373' }}>
            {isAnimating
              ? 'Robot is moving…'
              : nextCardIndex < USE_CASES.length
                ? `Click card ${nextCardIndex + 1} to reveal it`
                : 'All done!'}
          </p>
        )}
      </div>

      {/* Snake zone */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 64px 60px', position: 'relative', minHeight: 1440 }}>

        {/* SVG path + robot */}
        <svg
          ref={svgRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
          viewBox="0 0 800 1420"
          preserveAspectRatio="xMidYMin meet"
          aria-hidden="true"
        >
          {/* Cream tape "shoulder" */}
          <path d={PATH_D} fill="none" stroke="#DDD9CE" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
          {/* Black tape */}
          <path id="snake-path" d={PATH_D} fill="none" stroke="#0A0A0A" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />

          {/* Robot (rendered inside SVG coordinate space) */}
          {started && (
            <RobotMarker x={robotPos.x} y={robotPos.y} angle={robotPos.angle} />
          )}
        </svg>

        {/* Cards (HTML overlays, absolutely positioned over the SVG) */}
        {USE_CASES.map((useCase, i) => {
          const pos = CARD_POSITIONS[i];
          const isRevealed = revealedCards.includes(i);
          const isNext = started && i === nextCardIndex && !isAnimating && !isRevealed;

          return (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              role="button"
              tabIndex={isNext ? 0 : -1}
              aria-label={isRevealed ? useCase.company : `Reveal use case ${i + 1}`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(i); }}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                cursor: isNext ? 'pointer' : 'default',
                zIndex: 10,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => { if (isNext) e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
            >
              <FlipCard
                useCase={useCase}
                isRevealed={isRevealed}
                isNext={isNext}
                index={i}
              />
            </div>
          );
        })}
      </div>

      {/* Finale */}
      <AnimatePresence>
        {showFinale && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ maxWidth: 660, margin: '0 auto', padding: '0 64px 80px', textAlign: 'center' }}
          >
            <div style={{ width: 40, height: 1, background: 'rgba(10,10,10,0.15)', margin: '0 auto 36px' }} />

            <h2 style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.025em', color: '#0A0A0A', marginBottom: 12, lineHeight: 1.1 }}>
              You <em style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontStyle: 'italic', fontWeight: 400 }}>built</em> this today.
            </h2>
            <p style={{ fontSize: 16, color: '#525252', lineHeight: 1.6, marginBottom: 28 }}>
              A line-following robot — the simplest version of one of the most important ideas in autonomous systems.
            </p>

            {/* Stats */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 36,
              padding: '18px 36px', border: '1px solid rgba(10,10,10,0.08)',
              borderRadius: 12, marginBottom: 28, background: 'white',
            }}>
              {[{ num: '13', label: 'Steps' }, { num: '11', label: 'Components' }, { num: '5', label: 'Industries' }].map(({ num, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.03em' }}>{num}</div>
                  <div style={{ fontSize: 12, color: '#737373', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
              <button
                style={{
                  padding: '12px 22px', background: '#0A0A0A', color: 'white', border: 'none',
                  borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
                onClick={() => alert('Progress saved!')}
              >
                Save progress
              </button>
              <button
                onClick={handleStart}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '12px 22px', background: 'transparent', color: '#0A0A0A',
                  border: '1px solid rgba(10,10,10,0.2)', borderRadius: 10,
                  fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                <RotateCcw size={13} /> Replay tour
              </button>
            </div>

            {/* Next activity */}
            <div style={{
              background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 12,
              padding: '18px 24px', textAlign: 'left', marginBottom: 24,
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#4F46E5', marginBottom: 6 }}>
                READY FOR MORE?
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', marginBottom: 4 }}>
                Activity 02 — Obstacle Avoiding Robot
              </div>
              <p style={{ fontSize: 13, color: '#525252', lineHeight: 1.55 }}>
                Add an ultrasonic sensor to your build. The robot stops before hitting obstacles — the same logic used in parking sensors and self-driving car fronts.
              </p>
            </div>

            <button onClick={prevSection} style={{ background: 'none', border: 'none', color: '#737373', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              ← Back to Assembly
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
