import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Info, Lock } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { safeMotion, slideInFromStart } from '@/lib/motion';
import { sendAssistantMessage } from '@/services/amalApi';
import { matchAssistantResponse } from '../data/assistantResponses';
import { AssistantHeader } from './AssistantHeader';
import { AssistantLauncher } from './AssistantLauncher';
import { ChatMessage } from './ChatMessage';
import { QuickPrompt } from './QuickPrompt';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { SafetyCard } from './SafetyCard';

const MOBILE_QUERY = '(max-width: 767px)';
const SCROLL_TRIGGER = 120;

function subscribeToViewport(callback) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function getIsMobileViewport() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

/**
 * The assistant panel.
 *
 * Desktop (md+): a docked side panel with no backdrop, so the page behind
 * stays visible and usable. Mobile: a full-height, nearly full-width sheet
 * with a backdrop and body scroll lock.
 *
 * The conversation lives in React state only — nothing is persisted.
 */
export function AssistantDrawer({ onClose }) {
  const { t, language } = useTranslation();

  const [messages, setMessages] = useState(() => [
    { id: 'welcome', role: 'assistant', text: t('assistant.welcome') },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserMessage, setHasUserMessage] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Mobile breakpoint drives aria-modal and the body scroll lock.
  const isMobile = useSyncExternalStore(subscribeToViewport, getIsMobileViewport, () => false);

  const scrollRef = useRef(null);
  const inputAreaRef = useRef(null);
  const messageIdRef = useRef(0);

  const quickPromptTexts = [
    t('assistant.quickPrompts.work'),
    t('assistant.quickPrompts.result'),
    t('assistant.quickPrompts.text'),
    t('assistant.quickPrompts.voice'),
    t('assistant.quickPrompts.privacy'),
    t('assistant.quickPrompts.support'),
  ];

  // Escape closes the panel.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Body scroll lock — mobile only, so the desktop page stays scrollable.
  useEffect(() => {
    if (!isMobile) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile]);

  // Move focus into the composer when the panel opens.
  useEffect(() => {
    inputAreaRef.current?.querySelector('textarea')?.focus();
  }, []);

  // Keep the newest message in view.
  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, isTyping]);

  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    setShowScrollButton(distance > SCROLL_TRIGGER);
  }, []);

  const scrollToLatest = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
    setShowScrollButton(false);
  }, []);

  const handleSend = useCallback(
    async (rawText) => {
      const text = typeof rawText === 'string' ? rawText.trim() : '';
      if (!text || isTyping) return;

      const { kind } = matchAssistantResponse(text);
      messageIdRef.current += 1;
      const currentId = messageIdRef.current;

      const userMsg = { id: `user-${currentId}`, role: 'user', text };
      setMessages((previous) => [...previous, userMsg]);
      setHasUserMessage(true);

      // Crisis check: immediate safety response without waiting for network
      if (kind === 'safety') {
        setMessages((previous) => [
          ...previous,
          { id: `assistant-${currentId}`, role: 'assistant', kind: 'safety', text: '' },
        ]);
        return;
      }

      setIsTyping(true);

      try {
        // Requests go through the privacy-reviewed AMAL API boundary.
        const response = await sendAssistantMessage({
          message: text,
          history: messages
            .filter((item) => item.id !== 'welcome')
            .slice(-6)
            .map(({ role, text: messageText }) => ({ role, text: messageText })),
          lang: language,
        });

        setMessages((previous) => [
          ...previous,
          {
            id: `assistant-${currentId}`,
            role: 'assistant',
            kind: 'answer',
            text: response.text,
          },
        ]);
      } catch (err) {
        setMessages((previous) => [
          ...previous,
          {
            id: `assistant-${currentId}`,
            role: 'assistant',
            kind: 'unsupported',
            text: language === 'en'
              ? `The assistant service is unavailable right now.${err?.requestId ? ` Request ID: ${err.requestId}` : ''}`
              : `خدمة المساعد غير متاحة حالياً.${err?.requestId ? ` رقم الطلب: ${err.requestId}` : ''}`,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping, messages, language]
  );

  return (
    <>
      {isMobile && (
        <motion.div
          {...safeMotion({ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } })}
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-[55] bg-text-primary/40 backdrop-blur-[2px]"
        />
      )}

      <motion.div
        id="amal-assistant-panel"
        role="dialog"
        aria-modal={isMobile ? 'true' : 'false'}
        aria-labelledby="amal-assistant-title"
        {...safeMotion(slideInFromStart)}
        className="fixed inset-y-0 left-2 right-2 z-[60] flex flex-col overflow-hidden border border-surface-border bg-surface-card font-cairo shadow-[var(--shadow-xl)] md:inset-y-4 md:left-auto md:right-4 md:w-[400px] md:max-w-[440px] md:rounded-[var(--radius-2xl)]"
      >
        <AssistantHeader onClose={onClose} />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            className="chat-surface flex flex-1 flex-col overflow-y-auto px-4 py-4"
          >
            <div className="mt-auto flex flex-col gap-3.5">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col gap-1">
                  {message.kind === 'safety' ? (
                    <SafetyCard />
                  ) : (
                    <ChatMessage message={message} />
                  )}
                  {message.id === 'welcome' && (
                    <p className="flex items-start gap-1.5 ps-[42px] text-[11px] leading-relaxed text-text-secondary">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                      {t('assistant.disclaimer')}
                    </p>
                  )}
                </div>
              ))}

              {isTyping && <TypingIndicator />}
            </div>
          </div>

          {showScrollButton && (
            <button
              type="button"
              onClick={scrollToLatest}
              aria-label={t('assistant.scrollToBottom')}
              className="absolute bottom-3 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-[var(--radius-full)] border border-surface-border bg-surface-card/95 text-text-secondary shadow-[var(--shadow-lg)] backdrop-blur transition-colors duration-200 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {!hasUserMessage && (
          <div className="border-t border-surface-border/70 bg-surface-card/80 px-4 py-3">
            <p className="mb-2 text-[11px] font-semibold text-text-muted">
              {t('assistant.quickPromptsLabel')}
            </p>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 pe-8 [mask-image:linear-gradient(to_right,#000_calc(100%_-_32px),transparent)] rtl:[mask-image:linear-gradient(to_left,#000_calc(100%_-_32px),transparent)]">
              {quickPromptTexts.map((text, index) => (
                <QuickPrompt key={text} text={text} index={index} onSelect={handleSend} />
              ))}
            </div>
          </div>
        )}

        <footer className="border-t border-surface-border bg-surface-card/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur">
          <div ref={inputAreaRef}>
            <ChatInput onSend={handleSend} onStop={() => setIsTyping(false)} disabled={isTyping} />
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-text-secondary">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            {t('assistant.privacyNotice')}
          </p>
        </footer>
      </motion.div>
    </>
  );
}


/**
 * Floating entry point: renders the launcher and, once opened, the panel.
 * Closing returns focus to the launcher button.
 */
export function AmalAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef(null);
  const wasOpenRef = useRef(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      launcherRef.current?.focus();
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <>
      <AssistantLauncher isOpen={isOpen} onOpen={handleOpen} launcherRef={launcherRef} />
      {isOpen && <AssistantDrawer onClose={handleClose} />}
    </>
  );
}

export const SalamAssistant = AmalAssistant;
