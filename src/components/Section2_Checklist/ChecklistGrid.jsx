import { motion } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, Gift, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COMPONENTS } from '../../data/components.jsx';
import { useToast, Toast } from '../../shared/Toast';
import ComponentModelPreview from './ComponentModelPreview';

const ALL_IDS = COMPONENTS.map(c => c.id);
const CORE = COMPONENTS.filter(c => c.tier === 'core');
const SUPPLY = COMPONENTS.filter(c => c.tier === 'supply');
const TOTAL = COMPONENTS.length;

function ComponentCard({ component }) {
  const { checkedComponents, toggleComponent } = useApp();
  const checked = !!checkedComponents[component.id];
  const Svg = component.placeholderSvg;
  const hasModel = !!component.model;

  return (
    <motion.button
      layout
      onClick={() => toggleComponent(component.id)}
      aria-pressed={checked}
      aria-label={`${component.name}, ${checked ? 'checked' : 'unchecked'}`}
      className="kid-surface"
      style={{
        background: checked ? 'var(--mint-100)' : 'rgba(255,255,255,0.95)',
        borderRadius: 28,
        padding: '18px',
        cursor: 'pointer',
        textAlign: 'left',
        position: 'relative',
        boxShadow: checked ? '0 18px 28px rgba(82, 214, 162, 0.16)' : 'var(--shadow-card)',
      }}
      whileHover={{ y: -4, rotate: -0.4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 5,
          width: 30,
          height: 30,
          borderRadius: 12,
          border: `2px solid ${checked ? 'transparent' : 'rgba(104, 132, 231, 0.2)'}`,
          background: checked ? 'linear-gradient(135deg, var(--pink-500), var(--orange-500))' : 'rgba(255,255,255,0.96)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 8px 18px rgba(87, 101, 143, 0.12)',
        }}
      >
        {checked && <Check size={16} color="white" strokeWidth={2.5} />}
      </div>

      <div
        style={{
          aspectRatio: '4/3',
          background: checked ? 'rgba(255,255,255,0.75)' : 'linear-gradient(180deg, var(--yellow-100), #fff)',
          borderRadius: 22,
          marginBottom: 16,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: hasModel ? 0 : 12,
        }}
      >
        {hasModel ? <ComponentModelPreview model={component.model} fallback={Svg} /> : <Svg />}
      </div>

      <div className="eyebrow" style={{ marginBottom: 6, color: 'var(--purple-500)' }}>{component.role}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 27, lineHeight: 1.05, color: 'var(--ink-900)', marginBottom: 6 }}>
        {component.name}
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink-700)', fontWeight: 700 }}>Quantity: {component.quantity}</div>
    </motion.button>
  );
}

function SupplyCard({ component }) {
  const { checkedComponents, toggleComponent } = useApp();
  const checked = !!checkedComponents[component.id];
  const Svg = component.placeholderSvg;
  const hasModel = !!component.model;

  return (
    <motion.button
      onClick={() => toggleComponent(component.id)}
      aria-pressed={checked}
      aria-label={`${component.name}, ${checked ? 'checked' : 'unchecked'}`}
      className="kid-surface"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: checked ? 'var(--purple-100)' : 'rgba(255,255,255,0.96)',
        borderRadius: 24,
        padding: '12px 14px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          background: checked ? 'rgba(255,255,255,0.9)' : 'var(--yellow-100)',
          borderRadius: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
          overflow: 'hidden',
          padding: hasModel ? 0 : 6,
        }}
      >
        {hasModel ? <ComponentModelPreview model={component.model} fallback={Svg} /> : <Svg />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 19, fontFamily: 'var(--font-display)', color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {component.name}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-700)', fontWeight: 700 }}>Qty {component.quantity}</div>
      </div>

      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 10,
          border: `2px solid ${checked ? 'transparent' : 'rgba(104, 132, 231, 0.2)'}`,
          background: checked ? 'linear-gradient(135deg, var(--pink-500), var(--orange-500))' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {checked && <Check size={12} color="white" strokeWidth={2.5} />}
      </div>
    </motion.button>
  );
}

function SectionDivider({ label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
      <span className="kid-pill" style={{ background: 'var(--purple-100)', fontSize: 13, fontWeight: 800 }}>{label}</span>
      <div style={{ flex: 1, height: 8, background: 'rgba(104, 132, 231, 0.12)', borderRadius: 999 }} />
      <span style={{ fontSize: 13, color: 'var(--ink-700)', fontWeight: 800, whiteSpace: 'nowrap' }}>{count} {count === 1 ? 'item' : 'items'}</span>
    </div>
  );
}

export default function ChecklistGrid() {
  const { checkedComponents, markAllComponents, nextSection, prevSection } = useApp();
  const { toast, showToast } = useToast();

  const checkedCount = ALL_IDS.filter(id => !!checkedComponents[id]).length;
  const allChecked = checkedCount === TOTAL;
  const progress = (checkedCount / TOTAL) * 100;

  function handleMarkAll() {
    markAllComponents(ALL_IDS, !allChecked);
  }

  function handleMissingReport() {
    showToast('Got it. Tell your teacher which part is missing.');
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '10px 24px 136px' }}>
      <div
        className="kid-surface"
        style={{
          padding: '34px 34px 32px',
          borderRadius: 34,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,253,248,0.98))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, marginBottom: 30 }}>
          <div>
            <div className="kid-pill" style={{ marginBottom: 14, background: 'var(--yellow-100)' }}>
              <Gift size={16} color="var(--orange-500)" />
              <span className="eyebrow" style={{ color: 'var(--orange-500)' }}>Unbox your robot kit</span>
            </div>
            <h1 className="headline-lg" style={{ marginBottom: 10 }}>
              Let&apos;s check your
              <span className="font-serif-italic"> robot parts</span>
            </h1>
            <p className="body-md" style={{ maxWidth: 600 }}>
              Find each item on your desk and tap it when you spot it. When the whole kit is ready, we can jump into the circuit lab.
            </p>
          </div>

          <div className="kid-surface" style={{ padding: '18px 22px', borderRadius: 28, background: 'var(--paper)', minWidth: 220, textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, lineHeight: 0.95, color: 'var(--ink-900)', marginBottom: 8 }}>
              {checkedCount}
              <span style={{ fontSize: 22, color: 'var(--ink-500)', marginLeft: 6 }}>/ {TOTAL}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-700)', fontWeight: 800, marginBottom: 8 }}>Parts ready for building</div>
            <button onClick={handleMarkAll} style={{ background: 'none', border: 'none', color: 'var(--purple-500)', fontWeight: 800, cursor: 'pointer' }}>
              {allChecked ? 'Teacher shortcut: unmark all' : 'Teacher shortcut: mark all'}
            </button>
          </div>
        </div>

        <div className="progress-bar" style={{ marginBottom: 34 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        <SectionDivider label="Core team" count={CORE.length} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 42 }}>
          {CORE.map(c => <ComponentCard key={c.id} component={c} />)}
        </div>

        <SectionDivider label="Supply box" count={SUPPLY.length + 1} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {SUPPLY.map(c => <SupplyCard key={c.id} component={c} />)}

          <button
            onClick={handleMissingReport}
            className="kid-surface"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              borderRadius: 24,
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              width: '100%',
              borderStyle: 'dashed',
            }}
            aria-label="Report a missing component"
          >
            <div
              style={{
                width: 58,
                height: 58,
                border: '2px dashed rgba(104, 132, 231, 0.28)',
                borderRadius: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--purple-500)',
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              +
            </div>
            <div>
              <div style={{ fontSize: 19, fontFamily: 'var(--font-display)', color: 'var(--ink-900)' }}>Missing something?</div>
              <div style={{ fontSize: 13, color: 'var(--ink-700)', fontWeight: 700 }}>Tell the teacher</div>
            </div>
          </button>
        </div>
      </div>

      <div
        className="kid-surface"
        style={{
          position: 'fixed',
          bottom: 18,
          left: 24,
          right: 24,
          background: 'rgba(255,255,255,0.92)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          zIndex: 30,
          borderRadius: 28,
        }}
      >
        <div className="kid-pill" style={{ background: allChecked ? 'var(--mint-100)' : 'var(--yellow-100)' }}>
          <Star size={16} color={allChecked ? 'var(--mint-500)' : 'var(--orange-500)'} />
          <span style={{ fontWeight: 800, color: 'var(--ink-900)' }}>
            {allChecked ? 'Amazing. Your full kit is ready to go.' : 'Keep hunting for every part before the next step.'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={prevSection} className="kid-secondary">
            <ArrowLeft size={18} />
            Back
          </button>
          <button onClick={nextSection} className="kid-primary" disabled={!allChecked}>
            Circuit lab
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <Toast message={toast.message} show={toast.show} />
    </div>
  );
}
