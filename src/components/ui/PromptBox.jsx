import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * PromptBox - Physics-driven AI Prompt Composer
 * Rebuilt from DesignBookmark Motion Study (https://designbookmark.com/motion#db-prompt-box)
 *
 * Springs:
 * - H:  stiffness 420, damping 34  (field auto-growth with text)
 * - SH: stiffness 380, damping 30  (status line unfold/fold)
 * - M:  stiffness 520, damping 30  (send arrow <-> stop square morph)
 */
export function PromptBox({
  value: controlledValue,
  onChange: controlledOnChange,
  placeholder,
  onSend,
  onStop,
  isBusy = false,
  autoPlay = false,
  prompts,
  minHeight = 26,
  maxHeight = 120,
  className,
  statusThinkText,
  statusDoneText,
  statusStoppedText,
  ariaLabel,
  disabled = false,
}) {
  const { t, language } = useTranslation();
  const isAr = language !== 'en';

  const defaultPrompts = isAr
    ? [
        'كيف أتعامل مع نوبات القلق والتوتر في بيئة العمل؟',
        'ما هي المؤشرات اللغوية المبكرة للإجهاد والضغط النفسي؟',
        'ساعدني في تمارين التنفس والاسترخاء للهدوء الذهني',
        'كيف يفسر أمل التعبيرات اللغوية في اللهجة المصرية؟',
      ]
    : [
        'How can I manage work-related anxiety and chronic stress?',
        'What are the early linguistic markers of emotional fatigue?',
        'Guide me through a calming mindful breathing session',
        'How does AMAL analyze emotional nuances in Arabic text?',
      ];

  const activePrompts = prompts && prompts.length > 0 ? prompts : defaultPrompts;

  // Uncontrolled fallback state
  const [internalValue, setInternalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const [statusState, setStatusState] = useState('idle'); // 'idle' | 'think' | 'done' | 'stopped'
  const [statusLabel, setStatusLabel] = useState('');
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // DOM element references
  const containerRef = useRef(null);
  const textareaRef = useRef(null);
  const statusRef = useRef(null);
  const arrowRef = useRef(null);
  const stopRef = useRef(null);
  const sendBtnRef = useRef(null);

  // Timers and autoplay state
  const timersRef = useRef([]);
  const promptIdxRef = useRef(0);
  const wasBusyRef = useRef(isBusy);

  // Spring physics engine state
  // S(x, k, c) => { x, v, t, k, c }
  const springsRef = useRef({
    H: { x: minHeight, v: 0, t: minHeight, k: 420, c: 34 },
    SH: { x: 0, v: 0, t: 0, k: 380, c: 30 },
    M: { x: 0, v: 0, t: 0, k: 520, c: 30 },
  });

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn, delayMs) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((tId) => tId !== id);
      fn();
    }, delayMs);
    timersRef.current.push(id);
    return id;
  }, []);

  // Update text height target
  const fitHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Temporarily reset height to measure true scrollHeight
    textarea.style.height = 'auto';
    const measured = textarea.scrollHeight;
    const targetH = clamp(measured, minHeight, maxHeight);
    springsRef.current.H.t = targetH;
    textarea.style.height = `${springsRef.current.H.x}px`;
  }, [minHeight, maxHeight]);

  // Handle value change
  const handleInputChange = (e) => {
    const newVal = e.target.value;
    if (!isControlled) {
      setInternalValue(newVal);
    }
    if (controlledOnChange) {
      controlledOnChange(newVal);
    }
    fitHeight();
  };

  // Set status helper
  const setStatus = useCallback(
    (kind, text) => {
      setStatusState(kind);
      setStatusLabel(text);
      if (kind === 'think') {
        springsRef.current.SH.t = 1;
        springsRef.current.M.t = 1;
      } else if (kind === 'done' || kind === 'stopped') {
        springsRef.current.SH.t = 1;
        springsRef.current.M.t = 0;
      } else {
        springsRef.current.SH.t = 0;
        springsRef.current.M.t = 0;
      }
    },
    []
  );

  // Submit action
  const submitMessage = useCallback(() => {
    const textToSend = currentValue.trim();
    if (!textToSend || isBusy) return;

    setStatus('think', statusThinkText || (isAr ? 'جارٍ التفكير والتحليل الذكي...' : 'Thinking & analyzing...'));

    if (onSend) {
      onSend(textToSend);
    }

    if (!isControlled) {
      setInternalValue('');
    } else if (controlledOnChange) {
      controlledOnChange('');
    }

    // Shrink height back to min
    springsRef.current.H.t = minHeight;
  }, [
    currentValue,
    isBusy,
    isAr,
    statusThinkText,
    onSend,
    isControlled,
    controlledOnChange,
    minHeight,
    setStatus,
  ]);

  // Stop action
  const handleStop = useCallback(() => {
    clearAllTimers();
    setStatus('stopped', statusStoppedText || (isAr ? 'تم إيقاف التوليد' : 'Generation stopped'));
    springsRef.current.M.t = 0;

    if (onStop) {
      onStop();
    }

    addTimer(() => {
      springsRef.current.SH.t = 0;
    }, 1400);
  }, [clearAllTimers, setStatus, statusStoppedText, isAr, onStop, addTimer]);

  // Autoplay demonstration loop (active when autoPlay is true and user hasn't typed)
  const runAutoplay = useCallback(() => {
    if (!autoPlay || isUserInteracting || isBusy) return;

    clearAllTimers();
    const promptText = activePrompts[promptIdxRef.current % activePrompts.length];
    promptIdxRef.current += 1;

    // Type character by character
    const chars = [...promptText];
    chars.forEach((_, idx) => {
      addTimer(() => {
        if (isUserInteracting) return;
        const partial = chars.slice(0, idx + 1).join('');
        if (!isControlled) setInternalValue(partial);
        if (controlledOnChange) controlledOnChange(partial);
        fitHeight();
      }, idx * 36);
    });

    // Auto submit after typing completes
    const totalTypingTime = chars.length * 36 + 650;
    addTimer(() => {
      if (isUserInteracting) return;
      setStatus('think', statusThinkText || (isAr ? 'جارٍ التفكير والتحليل الذكي...' : 'Thinking & analyzing...'));
      if (!isControlled) setInternalValue('');
      if (controlledOnChange) controlledOnChange('');
      springsRef.current.H.t = minHeight;

      // Finish thinking after ~2.2s
      addTimer(() => {
        if (isUserInteracting) return;
        setStatus('done', statusDoneText || (isAr ? 'جاهز للإرشاد التوعوي' : 'Guidance ready'));

        // Close status and schedule next auto prompt
        addTimer(() => {
          if (isUserInteracting) return;
          springsRef.current.SH.t = 0;
          addTimer(() => {
            if (!isUserInteracting) runAutoplay();
          }, 800);
        }, 1600);
      }, 2200);
    }, totalTypingTime);
  }, [
    autoPlay,
    isUserInteracting,
    isBusy,
    clearAllTimers,
    activePrompts,
    addTimer,
    isControlled,
    controlledOnChange,
    fitHeight,
    setStatus,
    statusThinkText,
    isAr,
    minHeight,
    statusDoneText,
  ]);

  // Synchronize external isBusy changes
  useEffect(() => {
    if (isBusy && !wasBusyRef.current) {
      // Transitioned to busy
      setStatus('think', statusThinkText || (isAr ? 'جارٍ التفكير والتحليل الذكي...' : 'Thinking & analyzing...'));
    } else if (!isBusy && wasBusyRef.current) {
      // Transitioned to finished
      setStatus('done', statusDoneText || (isAr ? 'تم استحضار الرد' : 'Response ready'));
      addTimer(() => {
        springsRef.current.SH.t = 0;
      }, 1600);
    }
    wasBusyRef.current = isBusy;
  }, [isBusy, isAr, statusThinkText, statusDoneText, setStatus, addTimer]);

  // Autoplay trigger
  useEffect(() => {
    if (autoPlay && !isUserInteracting) {
      const timer = addTimer(() => runAutoplay(), 700);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoPlay, isUserInteracting, runAutoplay, addTimer]);

  // User takes over on focus
  const handleFocus = () => {
    if (!isUserInteracting) {
      setIsUserInteracting(true);
      clearAllTimers();
      if (!isBusy) {
        springsRef.current.SH.t = 0;
        springsRef.current.M.t = 0;
        if (!isControlled && internalValue === '') {
          fitHeight();
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isBusy) {
        handleStop();
      } else {
        submitMessage();
      }
    }
  };

  // Main spring physics animation loop (matches DesignBookmark sub-stepping)
  useEffect(() => {
    let animId;
    let lastTime = performance.now();
    const springs = springsRef.current;

    const stepSpring = (s, dt) => {
      const a = -s.k * (s.x - s.t) - s.c * s.v;
      s.v += a * dt;
      s.x += s.v * dt;
    };

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      // 4 sub-steps for maximum stability and bounce precision
      const sub = 4;
      for (let k = 0; k < sub; k++) {
        stepSpring(springs.H, dt / sub);
        stepSpring(springs.SH, dt / sub);
        stepSpring(springs.M, dt / sub);
      }

      // Render styles directly to DOM for silky smooth 60/120fps performance
      if (textareaRef.current) {
        textareaRef.current.style.height = `${springs.H.x.toFixed(2)}px`;
      }

      if (statusRef.current) {
        const o = clamp(springs.SH.x, 0, 1);
        statusRef.current.style.height = `${(Math.max(0, springs.SH.x) * 28).toFixed(2)}px`;
        statusRef.current.style.opacity = o.toFixed(3);
      }

      const m = clamp(springs.M.x, 0, 1.2);
      if (arrowRef.current) {
        arrowRef.current.style.transform = `scale(${Math.max(0, 1 - m).toFixed(3)}) rotate(${(m * 90).toFixed(1)}deg)`;
      }
      if (stopRef.current) {
        stopRef.current.style.transform = `scale(${Math.max(0, m).toFixed(3)})`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const hasText = currentValue.trim().length > 0;
  const isReady = hasText || isBusy;

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative w-full rounded-[24px] border border-surface-border bg-surface-card p-2 sm:p-2.5',
        'shadow-[0_4px_20px_-4px_rgba(112,64,154,0.08)] backdrop-blur-sm transition-all duration-200',
        'focus-within:border-primary-400 focus-within:shadow-[0_0_0_3px_rgba(161,105,207,0.16)]',
        'dark:border-slate-800 dark:bg-slate-900/90 dark:focus-within:border-primary-500/60',
        className
      )}
    >
      {/* Animated Spring Status Line */}
      <div
        ref={statusRef}
        className="flex items-center gap-2 overflow-hidden px-2 text-xs font-medium text-text-muted"
        style={{ height: '0px', opacity: 0 }}
        aria-live="polite"
      >
        <span
          className={cn(
            'h-2 w-2 shrink-0 rounded-full transition-colors duration-250',
            statusState === 'think' && 'bg-primary-500 pb-mark-pulse shadow-[0_0_8px_rgba(161,105,207,0.8)]',
            statusState === 'done' && 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]',
            statusState === 'stopped' && 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]',
            statusState === 'idle' && 'bg-text-muted'
          )}
        />
        <span
          className={cn(
            'truncate transition-colors duration-200',
            statusState === 'think' && 'pb-shine-text font-bold text-primary-600 dark:text-primary-300',
            statusState === 'done' && 'font-semibold text-emerald-700 dark:text-emerald-300',
            statusState === 'stopped' && 'font-semibold text-amber-700 dark:text-amber-300'
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* Input Row: Textarea + Morphing Send/Stop Button */}
      <div className="flex items-end gap-2 px-1">
        <textarea
          ref={textareaRef}
          value={currentValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (isAr ? 'اكتب سؤالك أو ما تشعر به هنا...' : 'Ask anything...')}
          aria-label={ariaLabel || (isAr ? 'حقل السؤال والإرشاد' : 'Prompt field')}
          rows={1}
          disabled={disabled}
          className={cn(
            'flex-1 resize-none overflow-hidden border-0 bg-transparent p-0 py-1.5',
            'font-cairo text-sm sm:text-base leading-6 text-text-primary placeholder:text-text-muted',
            'outline-none focus:outline-none focus:ring-0',
            'selection:bg-primary-200 dark:selection:bg-primary-900/60'
          )}
          style={{ height: `${minHeight}px` }}
        />

        {/* Morphing Button: Arrow Up <-> Stop Square */}
        <button
          ref={sendBtnRef}
          type="button"
          onClick={() => {
            if (isBusy || statusState === 'think') {
              handleStop();
            } else {
              submitMessage();
            }
          }}
          disabled={disabled || (!isReady && !isBusy)}
          aria-label={isBusy ? (isAr ? 'إيقاف' : 'Stop') : (isAr ? 'إرسال' : 'Send')}
          className={cn(
            'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200',
            'cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-primary-500',
            isReady
              ? 'bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-md hover:shadow-lg active:scale-95'
              : 'bg-surface-muted text-text-muted cursor-not-allowed opacity-60 dark:bg-slate-800 dark:text-slate-500'
          )}
        >
          {/* Arrow Icon Layer */}
          <span
            ref={arrowRef}
            className="absolute inset-0 flex items-center justify-center will-change-transform"
            style={{ transform: 'scale(1) rotate(0deg)' }}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </span>

          {/* Stop Square Layer */}
          <span
            ref={stopRef}
            className="absolute inset-0 flex items-center justify-center will-change-transform"
            style={{ transform: 'scale(0)' }}
          >
            <span className="h-2.5 w-2.5 rounded-[2.5px] bg-white" />
          </span>
        </button>
      </div>
    </div>
  );
}
