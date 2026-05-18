import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, HelpCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ASSEMBLY_STEPS, ARDUINO_CODE } from '../../data/assemblySteps';
import AssemblyScene from './AssemblyScene';

const PHASES = ['Mounting', 'Wiring', 'Programming', 'Testing'];
const PHASE_COLORS = {
  Mounting: '#7C3AED',
  Wiring: '#F59E0B',
  Programming: '#4F46E5',
  Testing: '#22C55E',
};

const CAMERA_PRESETS = {
  Iso: { position: [6, 6, 6], target: [0, 0, 0] },
  Top: { position: [0, 10, 0.01], target: [0, 0, 0] },
  Side: { position: [10, 2, 0], target: [0, 0, 0] },
};

const TROUBLESHOOT_TIPS = {
  1: "Make sure the chassis is placed on a flat surface with the motor mounting holes visible. The purple side should face up.",
  2: "Push the BO motors firmly into the clips — you should hear a click. Both shafts should point outward symmetrically.",
  3: "The castor ball should swivel freely in all directions. If it feels sticky, check for protective film on the ball bearing.",
  4: "Press the Arduino firmly onto the foam pad. Make sure the USB port faces toward the rear of the chassis for easy access later.",
  5: "The breadboard's adhesive backing peels easily at a corner. Press down firmly once placed — it won't reposition well after.",
  6: "The L298N's green screw terminals should face the motors (side of chassis). The 4-pin header faces toward the Arduino.",
  7: "Position IR sensors so the emitter/detector pairs both point toward the floor. Test: reflect a hand 1–2 cm away to confirm LEDs respond.",
  8: "If motors don't spin: check polarity, tighten screw terminals, verify the L298N green LED is on after power is connected.",
  9: "Yellow signal wires go to D2 and D3. If sensors don't respond, try swapping D2 and D3 — this corrects left/right inversion.",
  10: "If motors spin the wrong way after upload: swap IN1/IN2 OR IN3/IN4 pairs (not both). You don't need to change the code.",
  11: "Connect battery SNAP to L298N only after all other wires are in place. Red to 12V, black to GND — never reversed.",
  12: "Port greyed out? Try a different USB cable. Boards sometimes lose port recognition — unplug/replug while IDE is open.",
  13: "Robot spins in circles? Swap one motor pair. Goes straight but wrong direction? Swap both pairs. Line not detected? Adjust sensor height.",
};

function ArduinoCodeHighlight({ code }) {
  const lines = code.split('\n');
  const [copied, setCopied] = useState(false);

  function highlight(line) {
    if (line.trim().startsWith('//')) {
      return <span className="code-comment">{line}</span>;
    }
    if (line.trim().startsWith('#define') || line.trim().startsWith('#include')) {
      return <span className="code-preprocessor">{line}</span>;
    }
    let result = line
      .replace(/(void|int|if|else|return)\b/g, '<kw>$1</kw>')
      .replace(/\b(setup|loop|forward|turnLeft|turnRight|stopMotors|digitalRead|digitalWrite|Serial\.begin|Serial\.println|pinMode)\b/g, '<fn>$1</fn>')
      .replace(/\b(HIGH|LOW|INPUT|OUTPUT)\b/g, '<kw>$1</kw>')
      .replace(/\b(\d+)\b/g, '<num>$1</num>');

    const parts = result.split(/(<kw>.*?<\/kw>|<fn>.*?<\/fn>|<num>.*?<\/num>)/);
    return parts.map((part, i) => {
      if (part.startsWith('<kw>')) return <span key={i} className="code-keyword">{part.replace(/<\/?kw>/g, '')}</span>;
      if (part.startsWith('<fn>')) return <span key={i} className="code-function">{part.replace(/<\/?fn>/g, '')}</span>;
      if (part.startsWith('<num>')) return <span key={i} className="code-number">{part.replace(/<\/?num>/g, '')}</span>;
      return <span key={i} className="code-text">{part}</span>;
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ background: '#0A0A0A', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#737373' }}>line_follower.ino</span>
        <button
          onClick={handleCopy}
          style={{ fontSize: 12, fontWeight: 500, color: copied ? '#22C55E' : '#A1A1A1', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{ padding: '14px 16px', overflowX: 'auto', fontSize: 11.5, lineHeight: 1.65, fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
        {lines.map((line, i) => (
          <div key={i}>{highlight(line)}</div>
        ))}
      </pre>
    </div>
  );
}

function CodeOverlay({ onClose, onDone }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(10,10,10,0.7)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          background: 'white',
          borderRadius: 16,
          maxWidth: 680,
          width: '100%',
          boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
          maxHeight: '85vh',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: '24px 28px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#4F46E5', marginBottom: 6 }}>
                Step 12 · Programming
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 600, color: '#0A0A0A', letterSpacing: '-0.025em' }}>
                Upload the code
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{ background: '#F1EFE8', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', flexShrink: 0 }}
              aria-label="Close code overlay"
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: 14, color: '#525252', lineHeight: 1.6, marginBottom: 20 }}>
            Plug the Arduino into your computer via USB. Open Arduino IDE, select{' '}
            <strong style={{ color: '#0A0A0A' }}>Arduino UNO</strong> and the right port, then paste this code and hit upload.
          </p>

          <ArduinoCodeHighlight code={ARDUINO_CODE} />

          {/* Watch out card */}
          <div style={{ background: '#FEFBF3', borderLeft: '3px solid #F59E0B', borderRadius: '0 8px 8px 0', padding: '10px 14px', margin: '16px 0' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#B45309', marginBottom: 4 }}>
              WATCH OUT
            </div>
            <p style={{ fontSize: 12.5, color: '#262626', lineHeight: 1.55 }}>
              Pick the right port — COM3 on Windows, /dev/cu.usbmodem on Mac. If it's greyed out, the Arduino isn't plugged in.
            </p>
          </div>
        </div>

        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid rgba(10,10,10,0.08)', marginTop: 4 }}>
          <button
            onClick={onDone}
            style={{
              width: '100%',
              padding: '13px 20px',
              background: '#0A0A0A',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Code uploaded ✓
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function TroubleshootPanel({ stepId, onClose }) {
  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 320,
        background: 'white',
        borderLeft: '1px solid rgba(10,10,10,0.08)',
        padding: 24,
        zIndex: 50,
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>Stuck on step {stepId}?</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={16} />
        </button>
      </div>
      <p style={{ fontSize: 13.5, color: '#404040', lineHeight: 1.65 }}>
        {TROUBLESHOOT_TIPS[stepId] || 'Double-check your connections and make sure all wires are firmly seated.'}
      </p>
    </motion.div>
  );
}

export default function AssemblyViewer() {
  const { completedSteps, markStepComplete, nextSection, prevSection } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [activeCamera, setActiveCamera] = useState(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [showCodeOverlay, setShowCodeOverlay] = useState(false);

  const step = ASSEMBLY_STEPS[currentStep - 1];
  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  function handleMarkDone() {
    markStepComplete(currentStep);
    if (currentStep === 12) {
      setShowCodeOverlay(false);
    }
    setTimeout(() => {
      if (currentStep < 13) {
        setCurrentStep(s => s + 1);
      }
    }, 300);
  }

  function handleNext() {
    if (currentStep < 13) setCurrentStep(s => s + 1);
  }

  function handlePrev() {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  }

  // Auto-open code overlay on step 12
  const isDone = !!completedSteps[currentStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative', padding: '10px 24px 24px', gap: 16 }}>

      {/* Step track (top bar) */}
      <div className="kid-surface" style={{
        minHeight: 68,
        background: 'rgba(255,255,255,0.92)',
        display: 'flex',
        alignItems: 'center',
        padding: '12px 22px',
        gap: 16,
        flexShrink: 0,
        borderRadius: 28,
      }}>
        {/* Phase pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 99,
          background: 'var(--purple-100)',
          border: '1px solid rgba(141, 105, 255, 0.18)',
          flexShrink: 0,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal-500)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple-500)', letterSpacing: '0.04em', fontFamily: 'Nunito, sans-serif', textTransform: 'uppercase' }}>
            {step.phase}
          </span>
        </div>

        <div style={{ width: 1, height: 16, background: 'rgba(46,58,159,0.22)', flexShrink: 0 }} />

        {/* Step dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' }}>
          {ASSEMBLY_STEPS.map((s, i) => {
            const isCompleted = !!completedSteps[s.id];
            const isActive = s.id === currentStep;
            const prev = i > 0 ? ASSEMBLY_STEPS[i - 1] : null;
            const showSeparator = prev && prev.phase !== s.phase;

            return (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {showSeparator && (
                  <div style={{ width: 1, height: 16, background: 'rgba(46,58,159,0.22)', margin: '0 2px' }} />
                )}
                <button
                  onClick={() => setCurrentStep(s.id)}
                  aria-label={`Step ${s.id}: ${s.title}`}
                  aria-current={isActive ? 'step' : undefined}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    border: `1.5px solid ${isCompleted || isActive ? 'transparent' : 'var(--navy-700)'}`,
                    background: isCompleted ? 'var(--navy-900)' : isActive ? 'var(--teal-500)' : 'white',
                    cursor: 'pointer',
                    padding: 0,
                    boxShadow: isActive ? '0 0 0 3px rgba(77,200,212,0.35)' : 'none',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  {isCompleted ? (
                    <svg width="6" height="5" viewBox="0 0 8 6" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: 'Nunito, sans-serif',
                      color: isActive ? 'var(--navy-900)' : 'var(--navy-900)',
                      lineHeight: 1,
                    }}>
                      {s.id}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ width: 1, height: 16, background: 'rgba(46,58,159,0.22)', flexShrink: 0 }} />

        {/* Counter */}
        <span style={{ fontSize: 11, color: 'var(--navy-700)', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', fontFamily: 'Nunito, sans-serif', flexShrink: 0 }}>
          {completedCount}/13 done
        </span>
      </div>

      {/* 3D Stage */}
      <div className="kid-surface" style={{ flex: 1, position: 'relative', background: 'radial-gradient(ellipse at 50% 20%, #f6fbff 0%, #dbe8ff 100%)', borderRadius: 32, overflow: 'hidden' }}>
        <Canvas
          camera={{ position: [6, 7, 7], fov: 45 }}
          shadows
          style={{ width: '100%', height: '100%' }}
        >
          <AssemblyScene currentStep={currentStep} cameraOverride={activeCamera} />
        </Canvas>

        {/* Camera preset buttons */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 14,
          display: 'flex',
          gap: 6,
          zIndex: 10,
        }}>
          {Object.entries(CAMERA_PRESETS).map(([name, cam]) => (
            <button
              key={name}
              onClick={() => setActiveCamera(p => p?.label === name ? null : { ...cam, label: name })}
              style={{
                padding: '5px 12px',
                borderRadius: 14,
                fontSize: 12,
                fontWeight: 800,
                fontFamily: 'Inter, sans-serif',
                background: activeCamera?.label === name ? 'linear-gradient(135deg, var(--pink-500), var(--orange-500))' : 'white',
                color: activeCamera?.label === name ? 'white' : 'var(--ink-900)',
                border: '1px solid rgba(104, 132, 231, 0.16)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-soft)',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Stuck button */}
        <button
          onClick={() => setShowTroubleshoot(s => !s)}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'white',
            border: '1px solid rgba(104, 132, 231, 0.16)',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-soft)',
            zIndex: 10,
          }}
        >
          <HelpCircle size={13} />
          Stuck?
        </button>

        {/* 3D preview note */}
        <div style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '5px 12px',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(4px)',
          borderRadius: 99,
          fontSize: 12,
          color: 'var(--ink-700)',
          whiteSpace: 'nowrap',
          zIndex: 5,
          fontWeight: 800,
        }}>
          3D preview · production uses three.js with real GLB models
        </div>

        {/* Troubleshoot panel */}
        <AnimatePresence>
          {showTroubleshoot && (
            <TroubleshootPanel stepId={currentStep} onClose={() => setShowTroubleshoot(false)} />
          )}
        </AnimatePresence>

        {/* Code overlay for step 12 */}
        <AnimatePresence>
          {currentStep === 12 && showCodeOverlay && (
            <CodeOverlay
              onClose={() => setShowCodeOverlay(false)}
              onDone={handleMarkDone}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Instruction panel (bottom) */}
      <div className="kid-surface" style={{
        height: 180,
        background: 'rgba(255,255,255,0.94)',
        display: 'flex',
        flexShrink: 0,
        borderRadius: 30,
        overflow: 'hidden',
      }}>
        {/* Col 1: Instruction */}
        <div style={{ flex: 1, padding: '24px 32px 24px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(10,10,10,0.06)', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, overflow: 'hidden' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 10px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 600,
              background: `${step.phaseColor}18`,
              color: step.phaseColor,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              Step {currentStep} · {step.phase}
            </span>
            <h3 style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#0A0A0A',
              letterSpacing: '-0.025em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}>
              {step.title}
            </h3>
          </div>
          <p className="line-clamp-2" style={{
            fontSize: 14,
            color: '#525252',
            lineHeight: 1.55,
            letterSpacing: '-0.005em',
          }}>
            {step.body}
          </p>
        </div>

        {/* Col 2: Watch out */}
        <div style={{ width: 280, padding: 24, borderRight: '1px solid rgba(10,10,10,0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{
            background: '#FFF5D9',
            borderLeft: '6px solid #F59E0B',
            borderRadius: 18,
            padding: '10px 14px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#B45309', marginBottom: 4 }}>
              WATCH OUT
            </div>
            <p className="line-clamp-3" style={{ fontSize: 12.5, color: '#262626', lineHeight: 1.55 }}>
              {step.tip}
            </p>
          </div>
        </div>

        {/* Col 3: Actions */}
        <div style={{ width: 220, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, flexShrink: 0 }}>
          {/* Code upload trigger (always available on step 12) */}
          {currentStep === 12 && (
            <button
              onClick={() => setShowCodeOverlay(true)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#0A0A0A',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'opacity 0.2s',
              }}
            >
              {isDone ? 'View code again' : 'View code to upload'}
            </button>
          )}

          <button
            onClick={handleMarkDone}
            disabled={isDone}
            className={isDone ? 'kid-secondary' : 'kid-primary'}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {isDone ? <><Check size={14} /> Step done</> : 'Mark step done ✓'}
          </button>

          {/* Prev / Skip */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrev} disabled={currentStep === 1} className="kid-secondary" style={{ flex: 1 }}>Prev</button>
            <button onClick={currentStep === 13 ? nextSection : handleNext} className="kid-secondary" style={{ flex: 1 }}>
              {currentStep === 13 ? 'Finish →' : 'Skip →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
