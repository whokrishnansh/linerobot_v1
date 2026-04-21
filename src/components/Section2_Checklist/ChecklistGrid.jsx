import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COMPONENTS } from '../../data/components.jsx';
import { useToast, Toast } from '../../shared/Toast';

const ALL_IDS = COMPONENTS.map(c => c.id);
const CORE = COMPONENTS.filter(c => c.tier === 'core');
const SUPPLY = COMPONENTS.filter(c => c.tier === 'supply');
const TOTAL = COMPONENTS.length;

function ComponentCard({ component }) {
  const { checkedComponents, toggleComponent } = useApp();
  const checked = !!checkedComponents[component.id];
  const Svg = component.placeholderSvg;

  return (
    <motion.button
      layout
      onClick={() => toggleComponent(component.id)}
      aria-pressed={checked}
      aria-label={`${component.name}, ${checked ? 'checked' : 'unchecked'}`}
      style={{
        background: checked ? '#F7F7F4' : 'white',
        border: `1px solid ${checked ? 'rgba(10,10,10,0.15)' : 'rgba(10,10,10,0.08)'}`,
        borderRadius: 14,
        padding: '20px 18px',
        cursor: 'pointer',
        textAlign: 'left',
        position: 'relative',
        transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
        boxShadow: checked ? '0 2px 10px rgba(10,10,10,0.04)' : 'none',
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Check circle */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 5,
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: `1.5px solid ${checked ? 'transparent' : 'rgba(10,10,10,0.25)'}`,
          background: checked ? '#0A0A0A' : 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, border-color 0.2s',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        {checked && <Check size={12} color="white" strokeWidth={2.5} />}
      </div>

      {/* Image area */}
      <div
        style={{
          aspectRatio: '4/3',
          background: '#F1EFE8',
          borderRadius: 10,
          marginBottom: 14,
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
        }}
      >
        <Svg />
        <span
          style={{
            position: 'absolute',
            bottom: 6,
            left: 8,
            fontSize: 8,
            color: '#A1A1A1',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          placeholder
        </span>
      </div>

      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#737373', marginBottom: 4 }}>
        {component.role}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', marginBottom: 4 }}>{component.name}</div>
      <div style={{ fontSize: 12, color: '#A1A1A1' }}>Quantity: {component.quantity}</div>
    </motion.button>
  );
}

function SupplyCard({ component }) {
  const { checkedComponents, toggleComponent } = useApp();
  const checked = !!checkedComponents[component.id];
  const Svg = component.placeholderSvg;

  return (
    <motion.button
      onClick={() => toggleComponent(component.id)}
      aria-pressed={checked}
      aria-label={`${component.name}, ${checked ? 'checked' : 'unchecked'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: checked ? '#F7F7F4' : 'white',
        border: `1px solid ${checked ? 'rgba(10,10,10,0.15)' : 'rgba(10,10,10,0.08)'}`,
        borderRadius: 10,
        padding: '10px 12px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.2s, border-color 0.2s',
        width: '100%',
      }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: 44,
          height: 44,
          background: '#F1EFE8',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
          padding: 6,
        }}
      >
        <Svg />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {component.name}
        </div>
        <div style={{ fontSize: 11, color: '#A1A1A1' }}>Qty {component.quantity}</div>
      </div>

      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `1.5px solid ${checked ? 'transparent' : 'rgba(10,10,10,0.2)'}`,
          background: checked ? '#0A0A0A' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        {checked && <Check size={10} color="white" strokeWidth={2.5} />}
      </div>
    </motion.button>
  );
}

function SectionDivider({ label, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#737373', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: 'rgba(10,10,10,0.08)' }} />
      <span style={{ fontSize: 11, color: '#A1A1A1', fontWeight: 500, whiteSpace: 'nowrap' }}>{count} {count === 1 ? 'item' : 'items'}</span>
    </div>
  );
}

export default function ChecklistGrid() {
  const { checkedComponents, markAllComponents, nextSection, prevSection } = useApp();
  const { toast, showToast } = useToast();

  const checkedCount = ALL_IDS.filter(id => !!checkedComponents[id]).length;
  const allChecked = checkedCount === TOTAL;

  function handleMarkAll() {
    if (allChecked) {
      markAllComponents(ALL_IDS, false);
    } else {
      markAllComponents(ALL_IDS, true);
    }
  }

  function handleMissingReport() {
    showToast('Reported — your teacher will follow up.');
  }

  const progress = (checkedCount / TOTAL) * 100;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#FAFAF7', paddingBottom: 120 }}>
      <div style={{ padding: '48px 64px 0' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(10,10,10,0.04)', border: '1px solid rgba(10,10,10,0.06)', marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#737373' }}>
                Before we start
              </span>
            </div>
            <h1 className="headline-lg" style={{ marginBottom: 12 }}>
              Let's <span className="font-serif-italic">check</span> your kit
            </h1>
            <p style={{ fontSize: 16, color: '#525252', lineHeight: 1.6, maxWidth: 520, letterSpacing: '-0.005em' }}>
              Find each part on your desk and tap it to mark it ready. You'll need all of them before we move to the circuit lab.
            </p>
          </div>

          {/* Counter */}
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 32 }}>
            <div style={{ fontSize: 36, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 6 }}>
              <span style={{ color: '#0A0A0A' }}>{checkedCount}</span>
              <span style={{ color: '#A1A1A1', fontSize: 24 }}>/{TOTAL} Parts ready</span>
            </div>
            <button
              onClick={handleMarkAll}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 11,
                fontWeight: 500,
                color: '#737373',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                padding: 0,
                textDecoration: 'underline',
                textDecorationColor: 'rgba(115,115,115,0.4)',
              }}
            >
              {allChecked ? '✓ Teacher shortcut: unmark all' : '✓ Teacher shortcut: mark all'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar" style={{ marginBottom: 40 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Core components */}
        <SectionDivider label="Core components" count={CORE.length} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40 }}>
          {CORE.map(c => <ComponentCard key={c.id} component={c} />)}
        </div>

        {/* Supplies */}
        <SectionDivider label="Supplies & Accessories" count={SUPPLY.length + 1} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {SUPPLY.map(c => <SupplyCard key={c.id} component={c} />)}

          {/* Missing card */}
          <button
            onClick={handleMissingReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: '1.5px dashed rgba(10,10,10,0.15)',
              borderRadius: 10,
              padding: '10px 12px',
              background: 'transparent',
              cursor: 'pointer',
              width: '100%',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(10,10,10,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(10,10,10,0.15)'}
            aria-label="Report a missing component"
          >
            <div style={{
              width: 44, height: 44,
              border: '1px dashed rgba(10,10,10,0.15)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: '#A1A1A1', fontSize: 20,
            }}>+</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#737373' }}>Missing something?</div>
              <div style={{ fontSize: 11, color: '#A1A1A1' }}>Report to teacher</div>
            </div>
          </button>
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(250,250,247,0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(10,10,10,0.08)',
        padding: '16px 64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 30,
      }}>
        <p style={{
          fontSize: 13,
          color: allChecked ? '#0A0A0A' : '#737373',
          fontWeight: allChecked ? 500 : 400,
          transition: 'color 0.3s',
        }}>
          {allChecked
            ? 'All parts ready. You can move to the circuit lab.'
            : `Tap each part you have on your desk. Continue will activate once all ${TOTAL} are ready.`}
        </p>

        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <button
            onClick={prevSection}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              border: '1px solid rgba(10,10,10,0.15)',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              color: '#0A0A0A',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => allChecked && nextSection()}
            disabled={!allChecked}
            aria-disabled={!allChecked}
            style={{
              padding: '10px 20px',
              background: allChecked ? '#0A0A0A' : 'rgba(10,10,10,0.1)',
              color: allChecked ? 'white' : '#A1A1A1',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: allChecked ? 'pointer' : 'not-allowed',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.2s, color 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { if (allChecked) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
          >
            Continue to circuit lab →
          </button>
        </div>
      </div>

      <Toast message={toast.message} show={toast.show} />
    </div>
  );
}
