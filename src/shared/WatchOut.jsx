export function WatchOut({ children, color = '#B45309', bg = '#FEFBF3', title = 'WATCH OUT' }) {
  return (
    <div
      className="kid-surface"
      style={{
        background: bg,
        borderLeft: `6px solid ${color === '#EF4444' ? '#EF4444' : '#F59E0B'}`,
        borderRadius: 20,
        padding: '14px 16px',
      }}
    >
      <div className="eyebrow mb-1" style={{ color }}>
        {title}
      </div>
      <p className="line-clamp-3" style={{ fontSize: '13px', color: '#34415f', lineHeight: 1.6 }}>
        {children}
      </p>
    </div>
  );
}
