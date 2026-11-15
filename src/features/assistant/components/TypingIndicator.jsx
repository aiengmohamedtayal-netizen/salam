import { useTranslation } from '@/context/LanguageContext';
import { AssistantAvatar } from './AssistantAvatar';
import { GooThinking } from '@/components/ui/GooThinking';

/**
 * Goo Thinking indicator, rendered as an assistant turn so the log keeps
 * a single visual rhythm. Features DesignBookmark Motion spring physics
 * with SVG goo filter and interactive click-to-preview capability.
 */
export function TypingIndicator({ onReplyClick }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-2.5 my-1" role="status" aria-live="polite">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary-50 dark:bg-primary-950/80 shadow-[0_4px_10px_-4px_rgba(112,64,154,0.5)]"
      >
        <AssistantAvatar className="h-9 w-9" />
      </span>

      <div className="flex flex-col gap-1 items-start">
        <GooThinking
          interactive
          autoCycle={false}
          onComplete={onReplyClick}
        />
        <span className="text-[11px] text-text-secondary ps-1">
          {t('assistant.typing')}
        </span>
      </div>
    </div>
  );
}
