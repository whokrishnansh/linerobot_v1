import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast, Toast } from '../../shared/Toast';

export default function TeacherToolbar() {
  const { resetState, navigateToSection } = useApp();
  const [activeLang, setActiveLang] = useState('English');
  const { toast, showToast } = useToast();

  function handleLangClick(lang) {
    if (lang === 'English') {
      setActiveLang('English');
    } else {
      showToast('Coming soon — translation in progress');
    }
  }

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

        {/* Language pill group */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#1F1F1F',
            borderRadius: 6,
            padding: 2,
            gap: 2,
          }}
          role="group"
          aria-label="Language selector"
        >
          {['English', 'हिन्दी', 'Hinglish'].map((lang) => (
            <button
              key={lang}
              onClick={() => handleLangClick(lang)}
              aria-pressed={activeLang === lang}
              style={{
                padding: '3px 10px',
                borderRadius: 4,
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
                fontWeight: activeLang === lang ? 600 : 500,
                background: activeLang === lang ? 'white' : 'transparent',
                color: activeLang === lang ? '#0A0A0A' : '#A1A1A1',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)' }} />

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
