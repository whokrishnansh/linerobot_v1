import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'atl-robot-lab-state';

const defaultState = {
  currentSection: 1,
  checkedComponents: {},
  completedSteps: {},
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const navigateToSection = useCallback((n) => {
    setState(s => ({ ...s, currentSection: Math.max(1, Math.min(5, n)) }));
  }, []);

  const nextSection = useCallback(() => {
    setState(s => ({ ...s, currentSection: Math.min(5, s.currentSection + 1) }));
  }, []);

  const prevSection = useCallback(() => {
    setState(s => ({ ...s, currentSection: Math.max(1, s.currentSection - 1) }));
  }, []);

  const toggleComponent = useCallback((id) => {
    setState(s => ({
      ...s,
      checkedComponents: {
        ...s.checkedComponents,
        [id]: !s.checkedComponents[id],
      },
    }));
  }, []);

  const markAllComponents = useCallback((ids, checked) => {
    const newChecked = {};
    ids.forEach(id => { newChecked[id] = checked; });
    setState(s => ({ ...s, checkedComponents: newChecked }));
  }, []);

  const markStepComplete = useCallback((id) => {
    setState(s => ({
      ...s,
      completedSteps: { ...s.completedSteps, [id]: true },
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(defaultState);
  }, []);

  const value = {
    ...state,
    navigateToSection,
    nextSection,
    prevSection,
    toggleComponent,
    markAllComponents,
    markStepComplete,
    resetState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
