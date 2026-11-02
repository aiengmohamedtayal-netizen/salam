import { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const MAX_HEIGHT = 128;

/**
 * Chat composer. Enter sends, Shift+Enter inserts a newline, the field grows
 * with the message up to a cap, and both the textarea and the send button are
 * disabled while a reply is pending.
 */
export function ChatInput({ onSend, disabled }) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !disabled;

  // Grow the field with the content, then cap it and let it scroll.
  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className={cn(
        'flex items-end gap-1.5 rounded-[var(--radius-xl)] border border-surface-border',
        'bg-surface-card p-1.5 shadow-[var(--shadow-card)]',
        'transition-[border-color,box-shadow] duration-200',
        'focus-within:border-primary-400 focus-within:shadow-[0_0_0_3px_rgba(161,105,207,0.16)]'
      )}
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('assistant.inputPlaceholder')}
        aria-label={t('assistant.inputLabel')}
        rows={1}
        disabled={disabled}
        className={cn(
          'flex-1 [&_textarea]:min-h-[44px] [&_textarea]:max-h-32 [&_textarea]:border-0',
          '[&_textarea]:bg-transparent [&_textarea]:p-0 [&_textarea]:py-2.5',
          '[&_textarea]:shadow-none [&_textarea]:focus:border-transparent [&_textarea]:focus:ring-0',
          '[&_textarea]:resize-none [&_textarea]:text-[15px] [&_textarea]:leading-7',
          '[&_textarea]:placeholder:text-text-secondary'
        )}
      />

      <Button
        type="submit"
        variant="primary"
        size="sm"
        disabled={!canSend}
        aria-label={t('assistant.send')}
        className={cn(
          'h-10 w-10 shrink-0 rounded-[var(--radius-full)] p-0',
          'bg-gradient-to-br from-primary-600 to-primary-800',
          'shadow-[0_6px_16px_-8px_rgba(112,64,154,0.8)]',
          'transition-[transform,box-shadow,opacity] duration-200',
          'hover:shadow-[0_10px_22px_-8px_rgba(112,64,154,0.9)] active:scale-95',
          'disabled:from-surface-border disabled:to-surface-border disabled:text-text-secondary disabled:shadow-none'
        )}
      >
        <ArrowUp className="h-[18px] w-[18px]" aria-hidden="true" />
        <span className="sr-only">{t('assistant.send')}</span>
      </Button>
    </form>
  );
}
