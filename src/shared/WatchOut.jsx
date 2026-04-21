export function WatchOut({ children, color = '#B45309', bg = '#FEFBF3', title = 'WATCH OUT' }) {
  return (
    <div
      className="rounded-r-lg"
      style={{
        background: bg,
        borderLeft: `3px solid ${color === '#EF4444' ? '#EF4444' : '#F59E0B'}`,
        padding: '10px 14px',
      }}
    >
      <div className="eyebrow mb-1" style={{ color }}>
        {title}
      </div>
      <p className="line-clamp-3" style={{ fontSize: '12.5px', color: '#262626', lineHeight: 1.55 }}>
        {children}
      </p>
    </div>
  );
}
