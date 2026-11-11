import React from 'react';
import { PromptBox } from '@/components/ui/PromptBox';
import { useTranslation } from '@/context/LanguageContext';

/**
 * ChatInput - Powered by DesignBookmark Prompt Box
 *
 * Springs:
 * - H:  420 34 (Field height auto-growth)
 * - SH: 380 30 (Status line expand/collapse)
 * - M:  520 30 (Send Arrow <-> Stop Square morph)
 */
export function ChatInput({ onSend, onStop, disabled }) {
  const { t, language } = useTranslation();
  const isAr = language !== 'en';

  return (
    <PromptBox
      onSend={onSend}
      onStop={onStop}
      isBusy={disabled}
      placeholder={t('assistant.inputPlaceholder')}
      ariaLabel={t('assistant.inputLabel')}
      statusThinkText={isAr ? 'جارٍ التفكير واستحضار الإجابة...' : 'Thinking & formulating response...'}
      statusDoneText={isAr ? 'تم استحضار الرد بنجاح' : 'Answer ready'}
      statusStoppedText={isAr ? 'تم إيقاف التوليد' : 'Generation stopped'}
      minHeight={28}
      maxHeight={112}
      className="border-primary-200/90 dark:border-slate-800 shadow-[0_4px_16px_-4px_rgba(112,64,154,0.12)]"
    />
  );
}
