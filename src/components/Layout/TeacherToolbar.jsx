import { Bot, CircleHelp, Presentation, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast, Toast } from '../../shared/Toast';

export default function TeacherToolbar() {
  const { resetState } = useApp();
  const { toast, showToast } = useToast();

  function handlePresent() {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    showToast('Presentation mode — press Esc to exit');
  }

  function handleHelp() {
    showToast('Use the section steps at the top to navigate. Keyboard: ← → arrows');
  }

  function handleReset() {
    if (confirm('Reset all progress? This cannot be undone.')) {
      resetState();
    }
  }

  return (
    <>
      <header
        role="banner"
        style={{
          minHeight: 72,
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          padding: '14px 22px 10px',
          gap: 18,
          flexShrink: 0,
          zIndex: 50,
          position: 'relative',
        }}
      >
        <div
          className="kid-surface"
          style={{
            width: '100%',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, var(--yellow-500), var(--pink-500))',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 14px 22px rgba(255, 152, 82, 0.28)',
            }}
          >
            <Bot size={24} color="white" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div className="eyebrow" style={{ color: 'var(--pink-500)' }}>Robot Adventure Lab</div>
            <span style={{ color: 'var(--ink-900)', fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
              ATL Robot Lab
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {[
            { label: 'Reset', onClick: handleReset, icon: RotateCcw, bg: 'var(--orange-100)' },
            { label: 'Present', onClick: handlePresent, icon: Presentation, bg: 'var(--mint-100)' },
            { label: 'Help', onClick: handleHelp, icon: CircleHelp, bg: 'var(--purple-100)' },
          ].map(({ label, onClick, icon: Icon, bg }) => (
            <button
              key={label}
              onClick={onClick}
              className="kid-pill"
              style={{
                background: bg,
                color: 'var(--ink-900)',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </header>

      <Toast message={toast.message} show={toast.show} />
    </>
  );
}
