import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { messageEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { AssistantAvatar } from './AssistantAvatar';

const AVATAR_CLASSES =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary-50 dark:bg-primary-950/80 shadow-[0_4px_10px_-4px_rgba(112,64,154,0.5)]';

/**
 * A user turn — a solid orchid bubble aligned to the logical END side of the log.
 */
export function UserMessage({ text }) {
  return (
    <motion.div
      {...messageEnter}
      className="flex justify-end"
    >
      <div
        className={cn(
          'max-w-[85%] rounded-[var(--radius-2xl)] rounded-ee-[var(--radius-md)]',
          'bg-gradient-to-br from-primary-700 to-primary-900 px-4 py-2.5',
          'text-[15px] leading-7 break-words whitespace-pre-wrap text-white',
          'shadow-[0_10px_24px_-12px_rgba(112,64,154,0.8)]'
        )}
      >
        {text}
      </div>
    </motion.div>
  );
}

/**
 * Copy-to-clipboard control for an assistant reply.
 * The confirmation is announced to assistive technology, not only shown.
 */
function CopyReplyButton({ text }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // Clipboard access can be denied — the confirmation still helps.
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? t('assistant.copied') : t('assistant.copy')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          copied
            ? 'bg-primary-50 text-primary-700'
            : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {copied ? t('assistant.copied') : t('assistant.copy')}
      </button>

      <span role="status" aria-live="polite" className="sr-only">
        {copied ? t('assistant.copied') : ''}
      </span>
    </>
  );
}

/**
 * An assistant turn — a raised card on the logical START side with a small
 * gradient avatar. The speaker is exposed to assistive technology via
 * role="group".
 */
export function AssistantMessage({ text }) {
  const { t } = useTranslation();

  return (
    <motion.div
      {...messageEnter}
      role="group"
      aria-label={t('assistant.name')}
      className="flex items-start gap-2.5"
    >
      <span aria-hidden="true" className={cn('mt-0.5', AVATAR_CLASSES)}>
        <AssistantAvatar className="h-9 w-9" />
      </span>

      <div className="flex min-w-0 flex-col gap-1">
        <div
          className={cn(
            'max-w-[85%] rounded-[var(--radius-2xl)] rounded-es-[var(--radius-md)]',
            'border border-surface-border bg-surface-card px-4 py-2.5',
            'text-[15px] leading-7 break-words whitespace-pre-wrap text-text-primary',
            'shadow-[var(--shadow-card)]'
          )}
        >
          {text}
        </div>

        <div className="ps-4">
          <CopyReplyButton text={text} />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Renders a single log entry by role.
 */
export function ChatMessage({ message }) {
  if (message.role === 'user') {
    return <UserMessage text={message.text} />;
  }

  return <AssistantMessage text={message.text} />;
}
