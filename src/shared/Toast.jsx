import { useState, useCallback } from 'react';

let toastTimeout = null;

export function useToast() {
  const [toast, setToast] = useState({ message: '', show: false });

  const showToast = useCallback((message) => {
    setToast({ message, show: true });
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);

  return { toast, showToast };
}

export function Toast({ message, show }) {
  return (
    <div className={`toast ${show ? 'show' : ''}`} role="alert" aria-live="polite">
      {message}
    </div>
  );
}
