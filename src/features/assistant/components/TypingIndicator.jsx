import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { prefersReducedMotion } from '@/lib/motion';
import { AssistantAvatar } from './AssistantAvatar';

const DOT_DELAYS = [0, 0.15, 0.3];

/**
 * Three-dot typing indicator, rendered as an assistant turn so the log keeps
 * a single visual rhythm. The animated dots are hidden from assistive
 * technology; the live region announces the typing status instead.
 */
export function TypingIndicator() {
  const { t } = useTranslation();
  const reduceMotion = prefersReducedMotion();

  return (
    <div className="flex items-start gap-2.5" role="status" aria-live="polite">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary-50 dark:bg-primary-950/80 shadow-[0_4px_10px_-4px_rgba(112,64,154,0.5)]"
      >
        <AssistantAvatar className="h-9 w-9" />
      </span>

      <span className="flex items-center gap-2.5 rounded-[var(--radius-2xl)] rounded-es-[var(--radius-md)] border border-surface-border bg-surface-card px-4 py-3 shadow-[var(--shadow-card)]">
        <span className="flex items-center gap-1" aria-hidden="true">
          {DOT_DELAYS.map((delay) => (
            <motion.span
              key={delay}
              className="h-1.5 w-1.5 rounded-[var(--radius-full)] bg-primary-600"
              animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 0.9, repeat: Infinity, delay, ease: 'easeInOut' }
              }
            />
          ))}
        </span>

        <span className="text-xs text-text-secondary">{t('assistant.typing')}</span>
      </span>
    </div>
  );
}
