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
      <path d="M1 4L3.5 6.5L9 1" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
        height: 44,
        background: '#FAFAF7',
        borderBottom: '1px solid rgba(10,10,10,0.06)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px 0 20px',
        gap: 0,
        flexShrink: 0,
        zIndex: 40,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
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
                    width: 24,
                    height: 1,
                    background: isCompleted ? '#A1A1A1' : 'rgba(10,10,10,0.12)',
                    marginLeft: 4,
                    marginRight: 4,
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
                  gap: 6,
                  background: 'none',
                  border: 'none',
                  cursor: isClickable ? 'pointer' : 'default',
                  padding: '4px 6px',
                  borderRadius: 6,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (isClickable) e.currentTarget.style.background = 'rgba(10,10,10,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: isActive ? '#0A0A0A' : 'white',
                    border: isActive
                      ? 'none'
                      : isCompleted
                      ? '1px solid #A1A1A1'
                      : '1px solid rgba(10,10,10,0.2)',
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                >
                  {isCompleted ? (
                    <CheckIcon />
                  ) : (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif',
                        color: isActive ? 'white' : '#A1A1A1',
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
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#0A0A0A' : isCompleted ? '#737373' : '#A1A1A1',
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
      <span style={{ fontSize: 11, color: '#A1A1A1', fontWeight: 500, fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
        Step {currentSection} of 5
      </span>
    </nav>
  );
}
