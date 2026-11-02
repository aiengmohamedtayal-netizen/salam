import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { prefersReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { AssistantAvatar } from './AssistantAvatar';

/**
 * Floating launcher for the AMAL Assistant.
 * Physically docked to the bottom-right corner in BOTH LTR and RTL, as
 * required by the design brief.
 */
export function AssistantLauncher({ isOpen, onOpen, launcherRef }) {
  const { t } = useTranslation();
  const internalRef = useRef(null);
  const reduceMotion = prefersReducedMotion();

  // Share the DOM node with the parent so focus can be restored on close.
  const setRefs = useCallback(
    (node) => {
      internalRef.current = node;
      if (launcherRef) launcherRef.current = node;
    },
    [launcherRef]
  );

  useEffect(() => {
    if (launcherRef) launcherRef.current = internalRef.current;
  }, [launcherRef]);

  return (
    <button
      type="button"
      ref={setRefs}
      onClick={onOpen}
      aria-label={t('assistant.open')}
      aria-expanded={isOpen}
      aria-controls="amal-assistant-panel"
      aria-describedby="amal-assistant-tooltip"
      className={cn(
        'group fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] right-3 z-40',
        'flex h-28 w-28 items-center justify-center rounded-full bg-transparent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
        isOpen && 'hidden'
      )}
    >
      <motion.span
        aria-hidden="true"
        className="flex h-full w-full items-center justify-center"
        animate={reduceMotion ? undefined : {
          y: [0, -6, 0],
          rotateX: [0, 3, 0, -3, 0],
          rotateY: [0, -6, 0, 6, 0],
          rotateZ: [0, -1.5, 1.5, 0],
        }}
        transition={reduceMotion ? undefined : { duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={reduceMotion ? undefined : { scale: 1.08, rotateX: -4, rotateY: 12, rotateZ: 0 }}
        style={{ transformPerspective: 700 }}
      >
        <AssistantAvatar className="h-40 w-40" />
      </motion.span>

      <span
        id="amal-assistant-tooltip"
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap',
          'rounded-[var(--radius-lg)] bg-text-primary px-3 py-1.5',
          'text-xs font-medium text-white shadow-[var(--shadow-lg)]',
          'opacity-0 transition-opacity duration-200',
          'group-hover:opacity-100 group-focus-visible:opacity-100'
        )}
      >
        {t('assistant.name')}
      </span>
    </button>
  );
}
