export function Badge({ children, color = '#4F46E5', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{ backgroundColor: `${color}18`, color }}
    >
      {children}
    </span>
  );
}

export function EyebrowPill({ dot, color = '#4F46E5', children }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4"
      style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      )}
      <span className="eyebrow" style={{ color }}>{children}</span>
    </div>
  );
}
