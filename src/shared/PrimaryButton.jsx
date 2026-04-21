export function PrimaryButton({ children, onClick, disabled, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-[22px] py-[14px] rounded-[10px] text-[15px] font-medium transition-all duration-200 ${
        disabled
          ? 'cursor-not-allowed'
          : 'hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0'
      } ${className}`}
      style={{
        background: disabled ? 'rgba(10,10,10,0.1)' : '#0A0A0A',
        color: disabled ? '#A1A1A1' : 'white',
        fontFamily: 'Inter, sans-serif',
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-[22px] py-[14px] rounded-[10px] text-[15px] font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${className}`}
      style={{
        background: 'transparent',
        color: '#0A0A0A',
        fontFamily: 'Inter, sans-serif',
        border: '1px solid rgba(10,10,10,0.2)',
      }}
      {...props}
    >
      {children}
    </button>
  );
}
