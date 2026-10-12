/**
 * Shared Framer Motion animation presets.
 * Reuse these across all components for visual consistency.
 * All respect the design system's motion tokens.
 */

/** Standard fade-up entrance for sections/cards */
export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.4, ease: [0, 0, 0.2, 1] },
};

/** Stagger container — wrap children that each use fadeUp */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/** Scale-in for modals/dialogs */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
};

/** Slide from start (RTL-aware — slides from logical start) */
export const slideInFromStart = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
  transition: { duration: 0.3, ease: [0, 0, 0.2, 1] },
};

/** Backdrop overlay for dialogs/drawers */
export const backdropFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

/** Collapse/expand for accordions */
export const collapseExpand = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

/**
 * Hook to check if user prefers reduced motion.
 * Use outside of components — read from matchMedia directly.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Return empty animation props if reduced motion is preferred.
 * @param {object} motionProps - Normal animation props
 * @returns {object} motionProps or empty object
 */
export function safeMotion(motionProps) {
  if (prefersReducedMotion()) {
    return {};
  }
  return motionProps;
}
