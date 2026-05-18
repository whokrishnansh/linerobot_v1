export function Badge({ children, color = '#4F46E5', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${className}`}
      style={{
        background: `linear-gradient(180deg, ${color}26, ${color}14)`,
        color,
        border: `1px solid ${color}22`,
        boxShadow: '0 6px 14px rgba(87, 101, 143, 0.08)',
      }}
    >
      {children}
    </span>
  );
}

export function EyebrowPill({ dot, color = '#4F46E5', children }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4"
      style={{
        borderColor: `${color}30`,
        background: `linear-gradient(180deg, ${color}15, rgba(255,255,255,0.92))`,
        boxShadow: '0 8px 16px rgba(87, 101, 143, 0.08)',
      }}
    >
      {dot && (
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 0 5px ${color}1f` }} />
      )}
      <span className="eyebrow" style={{ color }}>{children}</span>
    </div>
  );
}
