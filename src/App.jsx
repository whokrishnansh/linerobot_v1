import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from './context/AppContext';
import TeacherToolbar from './components/Layout/TeacherToolbar';
import SectionNav from './components/Layout/SectionNav';
import HeroSection from './components/Section1_Hero/HeroSection';
import ChecklistGrid from './components/Section2_Checklist/ChecklistGrid';
import CircuitLab from './components/Section3_CircuitLab/CircuitLab';
import AssemblyViewer from './components/Section4_Assembly/AssemblyViewer';
import RealWorld from './components/Section5_RealWorld/RealWorld';

const SECTIONS = {
  1: HeroSection,
  2: ChecklistGrid,
  3: CircuitLab,
  4: AssemblyViewer,
  5: RealWorld,
};

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

function SectionRouter({ currentSection }) {
  const SectionComponent = SECTIONS[currentSection];
  if (!SectionComponent) return null;
  return <SectionComponent />;
}

export default function App() {
  const { currentSection, prevSection, nextSection } = useApp();

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') nextSection();
      if (e.key === 'ArrowLeft') prevSection();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextSection, prevSection]);

  return (
    <div
      className="app-shell"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Persistent chrome */}
      <TeacherToolbar />
      <SectionNav />

      {/* Section body */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait" initial={false} custom={currentSection}>
          <motion.div
            key={currentSection}
            custom={currentSection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="section-frame"
          >
            <SectionRouter currentSection={currentSection} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
