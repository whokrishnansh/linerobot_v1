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
          height: 44,
          background: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 16,
          flexShrink: 0,
          zIndex: 50,
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div
            style={{
              width: 18,
              height: 18,
              background: 'white',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ width: 6, height: 6, background: '#0A0A0A', borderRadius: '50%' }} />
          </div>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}>
            ATL Robot Lab
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        {[
          { label: 'Reset', onClick: handleReset },
          { label: 'Present', onClick: handlePresent },
          { label: 'Help', onClick: handleHelp },
        ].map(({ label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              background: 'none',
              border: 'none',
              color: '#A1A1A1',
              fontSize: 11,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '2px 4px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = '#A1A1A1'}
          >
            {label}
          </button>
        ))}
      </header>

      <Toast message={toast.message} show={toast.show} />
    </>
  );
}
