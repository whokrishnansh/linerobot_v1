import { useApp } from '../../context/AppContext';

const SECTIONS = [
  { id: 1, label: 'Intro' },
  { id: 2, label: 'Kit check' },
  { id: 3, label: 'Circuit lab' },
  { id: 4, label: 'Assembly' },
  { id: 5, label: 'Real world' },
];

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function SectionNav() {
  const { currentSection, navigateToSection } = useApp();

  return (
    <nav
      role="navigation"
      aria-label="Section navigation"
      style={{
        minHeight: 84,
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        padding: '0 22px 16px',
        gap: 0,
        flexShrink: 0,
        zIndex: 40,
        position: 'relative',
      }}
    >
      <div
        className="kid-surface"
        style={{
          width: '100%',
          borderRadius: 28,
          display: 'flex',
          alignItems: 'center',
          padding: '14px 18px',
          gap: 14,
        }}
      >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
        {SECTIONS.map((section, i) => {
          const isCompleted = section.id < currentSection;
          const isActive = section.id === currentSection;
          const isUpcoming = section.id > currentSection;
          const isClickable = !isUpcoming;

          return (
            <div key={section.id} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <div
                  style={{
                    width: 26,
                    height: 8,
                    background: isCompleted ? 'linear-gradient(90deg, var(--mint-500), var(--teal-500))' : 'rgba(104, 132, 231, 0.18)',
                    marginLeft: 6,
                    marginRight: 6,
                    borderRadius: 999,
                  }}
                />
              )}
              <button
                onClick={() => isClickable && navigateToSection(section.id)}
                disabled={isUpcoming}
                aria-current={isActive ? 'step' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: isActive ? 'linear-gradient(135deg, var(--purple-100), rgba(255,255,255,0.95))' : 'transparent',
                  border: isActive ? '1px solid rgba(141, 105, 255, 0.22)' : 'none',
                  cursor: isClickable ? 'pointer' : 'default',
                  padding: '8px 12px',
                  borderRadius: 18,
                  transition: 'background 0.15s',
                  opacity: isUpcoming ? 0.62 : 1,
                }}
                onMouseEnter={e => {
                  if (isClickable && !isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.72)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isActive ? 'linear-gradient(135deg, var(--purple-100), rgba(255,255,255,0.95))' : 'transparent';
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: isActive
                      ? 'linear-gradient(135deg, var(--pink-500), var(--orange-500))'
                      : isCompleted
                      ? 'linear-gradient(135deg, var(--mint-500), var(--teal-500))'
                      : 'white',
                    border: isActive
                      ? 'none'
                      : isCompleted
                      ? 'none'
                      : '1.5px solid rgba(104, 132, 231, 0.22)',
                    transition: 'background 0.2s, border-color 0.2s',
                    boxShadow: isActive ? '0 10px 18px rgba(255, 122, 182, 0.22)' : 'none',
                  }}
                >
                  {isCompleted ? (
                    <CheckIcon />
                  ) : (
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        fontFamily: 'var(--font-display)',
                        color: isActive ? 'white' : 'var(--ink-900)',
                        lineHeight: 1,
                      }}
                    >
                      {section.id}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: 15,
                    fontFamily: 'var(--font-body)',
                    fontWeight: isActive ? 800 : 700,
                    color: isActive ? 'var(--ink-900)' : isCompleted ? 'var(--ink-900)' : 'var(--ink-700)',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s',
                  }}
                >
                  {section.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Step counter */}
      <span className="kid-pill" style={{ fontSize: 13, color: 'var(--ink-900)', fontWeight: 800, flexShrink: 0, background: 'var(--yellow-100)' }}>
        Step {currentSection} of 5
      </span>
      </div>
    </nav>
  );
}
