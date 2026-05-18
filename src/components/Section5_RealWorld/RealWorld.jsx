import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
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

const FINAL_PATH_T = 0.96;

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
            background: '#090909',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            overflow: 'hidden',
            border: isNext ? `2px solid ${useCase.badgeColor}` : '1px solid rgba(255,255,255,0.06)',
            boxShadow: isNext ? '0 0 24px rgba(77,200,212,0.55)' : 'none',
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
            background: 'linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.86) 100%)',
          }} />

          {/* Diagonal stripe texture */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 14px)',
          }} />

          <div style={{
            position: 'relative',
            width: 10, height: 10, borderRadius: '50%',
            background: 'var(--teal-500)',
            boxShadow: '0 0 16px rgba(77,200,212,0.95)',
          }} />

          <span style={{
            position: 'relative',
            fontFamily: 'Nunito, sans-serif',
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
            background: '#0b0b0b',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '18px 20px 32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
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
            <p style={{ fontSize: 12.5, fontWeight: 600, color: '#F5F5F5', marginBottom: 5, lineHeight: 1.35 }}>
              {useCase.company}
            </p>
            <p style={{ fontSize: 12, color: '#c4c4c4', lineHeight: 1.45 }}>
              {useCase.headline}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {useCase.stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#F5F5F5' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#8f8f8f' }}>{s.label}</div>
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
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState('');
  const [certificateForm, setCertificateForm] = useState({
    studentName: '',
    studentClass: '9th',
    section: '',
  });

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
    const duration = Math.max(2600, Math.abs(dist) * 8200);
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

  function handleMoveToFinish() {
    if (!started || isAnimating) return;
    animateTo(FINAL_PATH_T);
  }

  function sanitizeFileName(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\-]/g, '')
      .slice(0, 40);
  }

  function handleCertificateInputChange(field, value) {
    setCertificateForm(prev => ({
      ...prev,
      [field]: value,
    }));
  }

  function buildAndDownloadCertificatePdf() {
    const date = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const certificateId = `ATL-${Date.now().toString(36).toUpperCase()}`;
    const studentName = certificateForm.studentName.trim();
    const { studentClass, section } = certificateForm;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(252, 249, 241);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setFillColor(229, 240, 255);
    doc.circle(70, 55, 95, 'F');
    doc.setFillColor(255, 236, 204);
    doc.circle(pageWidth - 70, pageHeight - 55, 95, 'F');

    doc.setDrawColor(35, 63, 134);
    doc.setLineWidth(4);
    doc.roundedRect(28, 28, pageWidth - 56, pageHeight - 56, 18, 18, 'S');
    doc.setDrawColor(189, 205, 238);
    doc.setLineWidth(1.4);
    doc.roundedRect(40, 40, pageWidth - 80, pageHeight - 80, 14, 14, 'S');

    doc.setTextColor(35, 63, 134);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('ATL ROBOT LAB', pageWidth / 2, 78, { align: 'center' });

    doc.setTextColor(22, 31, 51);
    doc.setFont('times', 'bold');
    doc.setFontSize(44);
    doc.text('Certificate of Completion', pageWidth / 2, 130, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(76, 92, 125);
    doc.text('This is proudly awarded to', pageWidth / 2, 168, { align: 'center' });

    doc.setFont('times', 'bolditalic');
    doc.setFontSize(40);
    doc.setTextColor(24, 45, 92);
    doc.text(studentName, pageWidth / 2, 225, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(38, 49, 74);
    const achievementText =
      'for successfully completing ATL Robot Lab Activity 01 and demonstrating strong understanding of line-following robot principles and practical applications.';
    doc.text(achievementText, pageWidth / 2, 258, { align: 'center', maxWidth: 620, lineHeightFactor: 1.35 });

    const infoBoxWidth = 420;
    const infoBoxX = (pageWidth - infoBoxWidth) / 2;
    const infoBoxY = 312;
    const infoCenterX = pageWidth / 2;
    doc.setFillColor(236, 243, 255);
    doc.roundedRect(infoBoxX, infoBoxY, infoBoxWidth, 56, 10, 10, 'F');
    doc.setDrawColor(198, 214, 245);
    doc.roundedRect(infoBoxX, infoBoxY, infoBoxWidth, 56, 10, 10, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(33, 58, 115);
    doc.text(`Class: ${studentClass}`, infoCenterX - 90, 346, { align: 'center' });
    doc.text(`Section: ${section.toUpperCase()}`, infoCenterX + 90, 346, { align: 'center' });

    doc.setDrawColor(175, 186, 210);
    doc.line(95, pageHeight - 95, 245, pageHeight - 95);
    doc.line(pageWidth - 245, pageHeight - 95, pageWidth - 95, pageHeight - 95);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(36, 46, 69);
    doc.text('Teacher Signature', 170, pageHeight - 78, { align: 'center' });
    doc.text('Program Coordinator', pageWidth - 170, pageHeight - 78, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 90, 112);
    doc.text(`Date: ${date}`, 95, pageHeight - 48);
    doc.text(`Certificate ID: ${certificateId}`, pageWidth - 95, pageHeight - 48, { align: 'right' });
    doc.text(`Progress: ${revealedCards.length}/${USE_CASES.length} use-cases completed`, pageWidth / 2, pageHeight - 48, { align: 'center' });

    doc.save(`ATL_Certificate_${sanitizeFileName(studentName) || 'student'}_${certificateId}.pdf`);
  }

  function handleGenerateCertificate() {
    const studentName = certificateForm.studentName.trim();
    const section = certificateForm.section.trim();

    if (studentName.length < 2) {
      setCertificateError('Please enter a valid student name.');
      return;
    }

    if (!section) {
      setCertificateError('Please enter the section (for example: A).');
      return;
    }

    setCertificateError('');
    setIsGeneratingCertificate(true);
    try {
      buildAndDownloadCertificatePdf();
      setShowCertificateModal(false);
    } catch {
      setCertificateError('Could not generate the certificate PDF. Please try again.');
    } finally {
      setIsGeneratingCertificate(false);
    }
  }

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  useEffect(() => {
    if (!showCertificateModal) return undefined;

    function handleEsc(e) {
      if (e.key === 'Escape' && !isGeneratingCertificate) {
        setShowCertificateModal(false);
      }
    }

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showCertificateModal, isGeneratingCertificate]);

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
    <div style={{ overflowY: 'auto', minHeight: '100%', padding: '10px 24px 24px' }}>
      <div className="kid-surface" style={{ borderRadius: 34, paddingBottom: 28, background: 'linear-gradient(180deg, #eef7ff 0%, #fffdf8 100%)' }}>

      {/* Hero text */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '56px 64px 28px', textAlign: 'center' }}>
        <div className="kid-pill" style={{ display: 'inline-flex', marginBottom: 16, background: 'var(--yellow-100)', fontSize: 13, color: 'var(--orange-500)', fontWeight: 800 }}>
          You built it. Now see where it lives.
        </div>
        <h1 className="headline-lg" style={{ marginBottom: 14 }}>
          The same robot idea
          <span className="font-serif-italic"> powers </span>
          big real-world jobs.
        </h1>
        <p className="body-md" style={{ maxWidth: 580, margin: '0 auto 24px', fontWeight: 700 }}>
          As the robot reaches each stop, click the card to reveal how line-following is used in the real world.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          <button
            id="btn-start-tour"
            onClick={handleStart}
            className={started ? 'kid-secondary' : 'kid-primary'}
          >
            <RotateCcw size={14} />
            {started ? 'Restart tour' : 'Start the tour'}
          </button>

          {!started && (
            <button onClick={prevSection} className="kid-secondary">
              <ChevronLeft size={14} /> Back to Assembly
            </button>
          )}
        </div>

        {started && !allRevealed && (
          <p style={{ marginTop: 14, fontSize: 13, color: 'var(--navy-700)', fontWeight: 700 }}>
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
          <defs>
            <linearGradient id="vibrant-snake-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff2d55" />
              <stop offset="14%" stopColor="#ff9f0a" />
              <stop offset="28%" stopColor="#ffd60a" />
              <stop offset="42%" stopColor="#32d74b" />
              <stop offset="56%" stopColor="#00c7ff" />
              <stop offset="70%" stopColor="#5e5ce6" />
              <stop offset="84%" stopColor="#bf5af2" />
              <stop offset="100%" stopColor="#ff2d55" />
            </linearGradient>
          </defs>
          {/* Cream tape "shoulder" */}
          <path d={PATH_D} fill="none" stroke="rgba(255,255,255,0.36)" strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
          {/* Black tape */}
          <path id="snake-path" d={PATH_D} fill="none" stroke="url(#vibrant-snake-gradient)" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />

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
            style={{ maxWidth: 760, margin: '0 auto 24px', padding: '30px 64px 80px', textAlign: 'center', background: 'linear-gradient(135deg, var(--purple-500), var(--navy-900))', borderRadius: 28, border: '1px solid rgba(255,255,255,0.18)', boxShadow: '0 16px 34px rgba(29,45,138,0.28)' }}
          >
            <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.35)', margin: '0 auto 30px' }} />

            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', color: 'white', marginBottom: 12, lineHeight: 1.1, fontFamily: 'Nunito, sans-serif' }}>
              You <em style={{ fontFamily: 'Instrument Serif, Georgia, serif', fontStyle: 'italic', fontWeight: 400, color: 'var(--teal-500)' }}>built</em> this today.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.86)', lineHeight: 1.6, marginBottom: 28, fontWeight: 600 }}>
              A line-following robot — the simplest version of one of the most important ideas in autonomous systems.
            </p>

            {/* Stats */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 36,
              padding: '18px 36px', border: '1px solid rgba(46,58,159,0.2)',
              borderRadius: 16, marginBottom: 28, background: 'white',
            }}>
              {[{ num: '13', label: 'Steps' }, { num: '11', label: 'Components' }, { num: '5', label: 'Industries' }].map(({ num, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--navy-900)' }}>{num}</div>
                  <div style={{ fontSize: 12, color: 'var(--navy-700)', marginTop: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
              <button onClick={handleMoveToFinish} disabled={isAnimating || robotProgress >= FINAL_PATH_T - 0.005} className="kid-secondary">
                Move robot
              </button>

              <button className="kid-primary" onClick={() => alert('Progress saved!')}>
                Save progress
              </button>

              <button
                onClick={() => {
                  setCertificateError('');
                  setShowCertificateModal(true);
                }}
                className="kid-secondary"
                style={{ background: 'white' }}
              >
                <Download size={14} /> Download certificate (PDF)
              </button>

              <button onClick={handleStart} className="kid-secondary" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', borderColor: 'rgba(255,255,255,0.28)' }}>
                <RotateCcw size={13} /> Replay tour
              </button>
            </div>

            {/* Next activity */}
            <div style={{
              background: 'var(--navy-100)', border: '1px solid rgba(46,58,159,0.22)', borderRadius: 16,
              padding: '18px 24px', textAlign: 'left', marginBottom: 24,
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--navy-900)', marginBottom: 6 }}>
                READY FOR MORE?
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy-900)', marginBottom: 4, fontFamily: 'Nunito, sans-serif' }}>
                Activity 02 — Obstacle Avoiding Robot
              </div>
              <p style={{ fontSize: 13, color: 'var(--navy-800)', lineHeight: 1.55, fontWeight: 600 }}>
                Add an ultrasonic sensor to your build. The robot stops before hitting obstacles — the same logic used in parking sensors and self-driving car fronts.
              </p>
            </div>

            <button onClick={prevSection} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.86)', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
              ← Back to Assembly
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCertificateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10,10,10,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 60,
              padding: 20,
            }}
            onClick={() => {
              if (!isGeneratingCertificate) setShowCertificateModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{
                width: 'min(560px, 100%)',
                borderRadius: 16,
                overflow: 'hidden',
                background: '#FFFFFF',
                boxShadow: '0 30px 80px rgba(10,10,10,0.28)',
                border: '1px solid rgba(10,10,10,0.08)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '22px 24px 14px', background: 'linear-gradient(135deg, #EEF4FF 0%, #F8FBFF 100%)', borderBottom: '1px solid rgba(10,10,10,0.08)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#3458A2', textTransform: 'uppercase', marginBottom: 8 }}>
                  Certificate Details
                </div>
                <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.2, color: '#0A0A0A', letterSpacing: '-0.02em' }}>
                  Generate Student Certificate
                </h3>
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
                  Fill the student information below. We will generate a polished completion certificate in PDF format.
                </p>
              </div>

              <div style={{ padding: 24, display: 'grid', gap: 16 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1F2937' }}>Student name</span>
                  <input
                    type="text"
                    value={certificateForm.studentName}
                    onChange={e => handleCertificateInputChange('studentName', e.target.value)}
                    placeholder="Enter full name"
                    style={{ border: '1px solid rgba(10,10,10,0.16)', borderRadius: 10, padding: '11px 12px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1F2937' }}>Class</span>
                    <select
                      value={certificateForm.studentClass}
                      onChange={e => handleCertificateInputChange('studentClass', e.target.value)}
                      style={{ border: '1px solid rgba(10,10,10,0.16)', borderRadius: 10, padding: '11px 12px', fontSize: 14, outline: 'none', background: 'white', fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="9th">9th</option>
                      <option value="10th">10th</option>
                    </select>
                  </label>

                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#1F2937' }}>Section</span>
                    <input
                      type="text"
                      value={certificateForm.section}
                      onChange={e => handleCertificateInputChange('section', e.target.value.toUpperCase())}
                      placeholder="A"
                      maxLength={4}
                      style={{ border: '1px solid rgba(10,10,10,0.16)', borderRadius: 10, padding: '11px 12px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                    />
                  </label>
                </div>

                {certificateError && (
                  <div style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 10px' }}>
                    {certificateError}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                  <button
                    onClick={() => setShowCertificateModal(false)}
                    disabled={isGeneratingCertificate}
                    style={{
                      border: '1px solid rgba(10,10,10,0.2)',
                      background: 'white',
                      color: '#0A0A0A',
                      borderRadius: 10,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: isGeneratingCertificate ? 'not-allowed' : 'pointer',
                      opacity: isGeneratingCertificate ? 0.6 : 1,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleGenerateCertificate}
                    disabled={isGeneratingCertificate}
                    style={{
                      border: 'none',
                      background: '#0A0A0A',
                      color: 'white',
                      borderRadius: 10,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: isGeneratingCertificate ? 'not-allowed' : 'pointer',
                      opacity: isGeneratingCertificate ? 0.6 : 1,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {isGeneratingCertificate ? 'Generating...' : 'Download PDF'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
