import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * OtpCode - Physics-driven 6-digit OTP Verification Component
 * Rebuilt from DesignBookmark Motion Study (https://designbookmark.com/motion#db-otp-code)
 *
 * Springs:
 * - y: stiffness 520, damping 16  (digit drop with bounce)
 * - o: stiffness 400, damping 28  (digit opacity)
 * - a: stiffness 300, damping 26  (active box glow / caret)
 * - M: stiffness 260, damping 24  (fusing boxes into single pill)
 * - G: stiffness 220, damping 28  (green verified pill + checkmark)
 */
export function OtpCode({
  length = 6,
  value: controlledValue,
  onChange: controlledOnChange,
  onComplete,
  autoPlay = false,
  disabled = false,
  error = false,
  verifiedText,
  className,
}) {
  const { language } = useTranslation();
  const isAr = language !== 'en';
  const N = length;

  const [internalValue, setInternalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isDone, setIsDone] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // References
  const containerRef = useRef(null);
  const boxesWrapRef = useRef(null);
  const inputRef = useRef(null);
  const okRef = useRef(null);
  const boxElementsRef = useRef([]);

  // Springs state
  // Each box has: y (drop), o (opacity), a (active focus)
  const boxSpringsRef = useRef(
    [...Array(N)].map(() => ({
      y: { x: 0, v: 0, t: 0, k: 520, c: 16 },
      o: { x: 0, v: 0, t: 0, k: 400, c: 28 },
      a: { x: 0, v: 0, t: 0, k: 300, c: 26 },
    }))
  );

  // Global morph springs
  const MRef = useRef({ x: 0, v: 0, t: 0, k: 260, c: 24 }); // morph boxes into single pill
  const GRef = useRef({ x: 0, v: 0, t: 0, k: 220, c: 28 }); // green success & verified text

  const timersRef = useRef([]);
  const clockRef = useRef(0);
  const prevValRef = useRef('');

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn, delayMs) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delayMs);
    timersRef.current.push(id);
    return id;
  }, []);

  // Update value and trigger digit spring drops
  const applyValue = useCallback(
    (nextVal) => {
      const sanitized = nextVal.replace(/\D/g, '').slice(0, N);
      const prev = prevValRef.current;

      for (let i = 0; i < N; i++) {
        const c = sanitized[i] || '';
        const prevC = prev[i] || '';
        const s = boxSpringsRef.current[i];

        if (c && c !== prevC) {
          // Drop bounce
          s.y.x = -16;
          s.y.v = 0;
          s.y.t = 0;
          s.o.x = 0;
          s.o.t = 1;
        } else if (!c) {
          s.o.t = 0;
        }
      }

      prevValRef.current = sanitized;
      if (!isControlled) {
        setInternalValue(sanitized);
      }
      if (controlledOnChange) {
        controlledOnChange(sanitized);
      }

      // Check if code completed
      if (sanitized.length === N && !isDone) {
        setIsDone(true);
        // Start morph after 220ms
        addTimer(() => {
          MRef.current.t = 1;
        }, 220);

        // Turn green & show verified after 520ms
        addTimer(() => {
          GRef.current.t = 1;
        }, 520);

        // Fire onComplete
        if (onComplete) {
          addTimer(() => {
            onComplete(sanitized);
          }, 1100);
        }

        // If in autoplay mode, reset after 3.2s
        if (autoPlay) {
          addTimer(() => {
            setIsDone(false);
            GRef.current.t = 0;
            MRef.current.t = 0;
            addTimer(() => applyValue(''), 350);
          }, 3200);
        }
      }
    },
    [N, isControlled, controlledOnChange, isDone, onComplete, autoPlay, addTimer]
  );

  // Handle input event
  const handleInputChange = (e) => {
    setUserInteracted(true);
    clearTimers();
    if (isDone) {
      setIsDone(false);
      MRef.current.t = 0;
      GRef.current.t = 0;
    }
    applyValue(e.target.value);
  };

  const handleInputFocus = () => {
    setUserInteracted(true);
    clearTimers();
  };

  // Autoplay demonstration loop
  useEffect(() => {
    if (!autoPlay || userInteracted) return;

    let cancel = false;
    const playDemo = () => {
      if (cancel || userInteracted) return;
      const demoCode = '482916';
      [...demoCode].forEach((c, idx) => {
        addTimer(() => {
          if (cancel || userInteracted) return;
          applyValue(demoCode.slice(0, idx + 1));
        }, 400 + idx * 240);
      });

      // Repeat loop after 6.5s
      addTimer(() => {
        if (!cancel && !userInteracted) playDemo();
      }, 6500);
    };

    const initialTimer = addTimer(playDemo, 600);

    return () => {
      cancel = true;
      clearTimeout(initialTimer);
      clearTimers();
    };
  }, [autoPlay, userInteracted, applyValue, addTimer, clearTimers]);

  // Main physics loop (Euler sub-stepping)
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const stepSpring = (s, dt) => {
      const a = -s.k * (s.x - s.t) - s.c * s.v;
      s.v += a * dt;
      s.x += s.v * dt;
    };

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      clockRef.current += dt;
      const clock = clockRef.current;

      const val = prevValRef.current;
      const springs = boxSpringsRef.current;
      const M = MRef.current;
      const G = GRef.current;

      // Update target states and step physics
      for (let i = 0; i < N; i++) {
        const b = springs[i];
        b.a.t = !isDone && i === Math.min(val.length, N - 1) ? 1 : 0;
      }

      // 4 sub-steps for stability and precision
      const sub = 4;
      for (let k = 0; k < sub; k++) {
        for (let i = 0; i < N; i++) {
          stepSpring(springs[i].y, dt / sub);
          stepSpring(springs[i].o, dt / sub);
          stepSpring(springs[i].a, dt / sub);
        }
        stepSpring(M, dt / sub);
        stepSpring(G, dt / sub);
      }

      // DOM Rendering
      const wrap = boxesWrapRef.current;
      if (wrap) {
        const W = wrap.offsetWidth || 320;
        const gap0 = 8;
        const bw = Math.min(48, Math.floor((W - gap0 * (N - 1)) / N));
        const m = clamp(M.x, 0, 1.1);
        const gap = gap0 * (1 - clamp(m, 0, 1));
        const total = bw * N + gap * (N - 1);
        const left0 = (W - total) / 2;

        for (let i = 0; i < N; i++) {
          const el = boxElementsRef.current[i];
          if (!el) continue;

          const s = springs[i];
          const xPos = left0 + i * (bw + gap);
          const extraW = i < N - 1 ? gap0 * clamp(m, 0, 1) + 1 : 0;
          el.style.left = `${xPos.toFixed(2)}px`;
          el.style.width = `${(bw + extraW).toFixed(2)}px`;

          // Inner corners square off as they fuse; outer corners stay rounded (14px)
          const r = 14 * (1 - clamp(m, 0, 1));
          el.style.borderRadius =
            i === 0
              ? `14px ${r.toFixed(1)}px ${r.toFixed(1)}px 14px`
              : i === N - 1
              ? `${r.toFixed(1)}px 14px 14px ${r.toFixed(1)}px`
              : `${r.toFixed(1)}px`;

          const a = clamp(s.a.x, 0, 1);
          const g = clamp(G.x, 0, 1);

          // Background interpolation: surface -> active glow -> emerald green
          if (g > 0.01) {
            el.style.backgroundColor = `color-mix(in srgb, #10b981 ${(g * 100).toFixed(1)}%, var(--color-surface-card))`;
            el.style.borderColor = 'transparent';
          } else if (a > 0.01) {
            el.style.backgroundColor = `color-mix(in srgb, rgba(161,105,207,0.14) ${(a * 100).toFixed(1)}%, var(--color-surface-card))`;
            el.style.borderColor = `color-mix(in srgb, #a169cf ${(a * 100).toFixed(1)}%, var(--color-surface-border))`;
          } else {
            el.style.backgroundColor = '';
            el.style.borderColor = '';
          }

          // Digit letter
          const digitEl = el.querySelector('.otp-digit');
          if (digitEl) {
            digitEl.style.opacity = (clamp(s.o.x, 0, 1) * (1 - g)).toFixed(3);
            digitEl.style.transform = `translateY(${s.y.x.toFixed(2)}px)`;
          }

          // Caret cursor
          const caretEl = el.querySelector('.otp-caret');
          if (caretEl) {
            const showCaret = a > 0.5 && !val[i] && (clock * 1.8) % 2 < 1.2;
            caretEl.style.opacity = showCaret ? '1' : '0';
          }
        }
      }

      // Verified success badge
      const ok = okRef.current;
      if (ok) {
        ok.style.opacity = clamp(G.x * 1.6 - 0.5, 0, 1).toFixed(3);
        ok.style.transform = `translateY(${((1 - clamp(G.x, 0, 1)) * 8).toFixed(2)}px)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [N, isDone]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full max-w-[340px] mx-auto select-none', className)}
    >
      {/* Box Rails Container - explicitly LTR for universal numeric display */}
      <div
        ref={boxesWrapRef}
        dir="ltr"
        className="relative h-14 w-full cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Six Animated Spring Boxes */}
        {[...Array(N)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (boxElementsRef.current[i] = el)}
            className={cn(
              'absolute top-0 h-14 rounded-[14px] border border-surface-border bg-surface-card',
              'flex items-center justify-center font-cairo text-2xl font-bold text-text-primary tabular-nums',
              'shadow-sm transition-shadow duration-200 will-change-transform',
              error && 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/30'
            )}
            style={{ width: '48px', left: `${i * 56}px` }}
          >
            {/* Digit */}
            <span className="otp-digit inline-block will-change-transform">
              {currentValue[i] || ''}
            </span>

            {/* Blinking Caret */}
            <span
              className="otp-caret absolute left-1/2 top-4 -ml-[1px] h-6 w-[2px] rounded-[1px] bg-primary-600 dark:bg-primary-400 pointer-events-none transition-opacity"
              style={{ opacity: 0 }}
            />
          </div>
        ))}

        {/* Fused Green Pill "Verified" Overlay */}
        <div
          ref={okRef}
          className="absolute inset-0 flex items-center justify-center gap-2 font-cairo text-base font-bold text-white pointer-events-none will-change-transform z-10"
          style={{ opacity: 0 }}
        >
          <svg
            className="w-5 h-5 stroke-current fill-none stroke-[2.6] stroke-linecap-round stroke-linejoin-round"
            viewBox="0 0 24 24"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
          <span>{verifiedText || (isAr ? 'تم التحقق بنجاح' : 'Verified')}</span>
        </div>

        {/* Hidden Native Input capturing keystrokes, numeric keyboard, and auto-fill */}
        <input
          ref={inputRef}
          id="otp-native-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={N}
          value={currentValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled || isDone}
          aria-label={isAr ? 'رمز التحقق المكون من 6 أرقام' : '6 digit OTP verification code'}
          className="absolute inset-0 h-full w-full opacity-0 border-0 cursor-text caret-transparent z-20"
        />
      </div>
    </div>
  );
}
