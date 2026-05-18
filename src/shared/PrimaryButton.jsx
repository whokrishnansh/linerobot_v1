export function PrimaryButton({ children, onClick, disabled, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`kid-primary ${className}`}
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
      className={`kid-secondary ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
