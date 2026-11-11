import { useState, useRef, useEffect, useCallback, useId } from 'react';
import { Lock } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Animated Password Strength Component
 * Rebuilt from DesignBookmark Motion Studies (https://designbookmark.com/motion#db-password-strength)
 *
 * Springs & Timing (DesignBookmark Tokens):
 * - Bars width spring: stiffness = 260, damping = 24, stagger = 0.06s
 * - Eye slash & pupil: stiffness = 300, damping = 24
 * - Word rise / fade:  stiffness = 300, damping = 24
 * - Score colors: Red (#f43f5e) -> Orange (#f59e0b) -> Amber/Sky (#38bdf8) -> Emerald (#10b981)
 */

function createSpring(x, k = 300, c = 24) {
  return { x, v: 0, t: x, k, c };
}

function stepSpring(s, dt) {
  const a = -s.k * (s.x - s.t) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

const COLORS = ['#f43f5e', '#f59e0b', '#38bdf8', '#10b981'];

const WORDS_AR = ['قصيرة جداً', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية جداً'];
const WORDS_EN = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export function ratePassword(p) {
  if (!p || p.length < 6) return 0;
  let s = 1;
  // Lower + Upper or Arabic letters + length >= 8
  if (p.length >= 8 && (/[a-z]/.test(p) && /[A-Z]/.test(p) || /[\u0600-\u06FF]/.test(p))) s++;
  // Number
  if (/\d/.test(p)) s++;
  // Symbol or length >= 10
  if (/[^A-Za-z0-9\u0600-\u06FF]/.test(p) && p.length >= 10) s++;
  return Math.min(s, 4);
}

export function PasswordStrength({
  value: controlledValue,
  password: propPassword,
  defaultValue = '',
  onChange,
  onStrengthChange,
  showInput = true,
  showEye = true,
  autoplay = false,
  label,
  placeholder,
  rulesText,
  id,
  className,
  error,
  disabled = false,
  required = false,
  name,
  autoComplete,
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const { language } = useTranslation();
  const isAr = language !== 'en';

  const actualControlled = controlledValue !== undefined ? controlledValue : propPassword;
  const [password, setPassword] = useState(
    actualControlled !== undefined ? actualControlled : defaultValue
  );
  const [shown, setShown] = useState(false);
  const [score, setScore] = useState(0);

  const inputRef = useRef(null);
  const barElsRef = useRef([]);
  const wordElRef = useRef(null);
  const slashElRef = useRef(null);
  const pupilElRef = useRef(null);

  const slashLen = 22;

  // Springs matching DesignBookmark tokens
  const springsRef = useRef({
    bars: [
      createSpring(0, 260, 24),
      createSpring(0, 260, 24),
      createSpring(0, 260, 24),
      createSpring(0, 260, 24),
    ],
    E: createSpring(0, 300, 24), // eye slash
    WD: createSpring(1, 300, 24), // word rise
  });

  const stateRef = useRef({
    clock: 0,
    userUntil: 0,
    currentScore: 0,
    staggerTimers: [],
    autoplayTimers: [],
  });

  // Sync controlled value
  useEffect(() => {
    if (actualControlled !== undefined) {
      setPassword(actualControlled);
    }
  }, [actualControlled]);

  // Update score & trigger staggered springs
  const evaluate = useCallback(
    (val) => {
      const s = ratePassword(val);
      onStrengthChange?.(s);
      if (s === stateRef.current.currentScore && val.length > 0) return;

      stateRef.current.currentScore = s;
      setScore(s);

      // Clear existing stagger timers
      stateRef.current.staggerTimers.forEach(clearTimeout);
      stateRef.current.staggerTimers = [];

      // Stagger bars: i * 60ms
      const springs = springsRef.current;
      springs.bars.forEach((b, i) => {
        const timer = setTimeout(() => {
          b.t = i < s ? 1 : 0;
        }, i * 60);
        stateRef.current.staggerTimers.push(timer);
      });

      // Word bounce rise
      springs.WD.x = 0;
      springs.WD.t = 1;
    },
    [onStrengthChange]
  );

  useEffect(() => {
    evaluate(password);
  }, [password, evaluate]);

  // Main animation frame loop
  useEffect(() => {
    let animId;
    let last = performance.now();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      const springs = springsRef.current;
      springs.bars.forEach((b) => (b.c = 2 * Math.sqrt(b.k)));
      springs.E.c = 2 * Math.sqrt(springs.E.k);
      springs.WD.c = 2 * Math.sqrt(springs.WD.k);
    }

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      stateRef.current.clock += dt;

      const springs = springsRef.current;
      stepSpring(springs.E, dt);
      stepSpring(springs.WD, dt);
      springs.bars.forEach((b) => stepSpring(b, dt));

      // Render Bar widths & colors
      const curScore = stateRef.current.currentScore;
      const col = COLORS[clamp(curScore - 1, 0, 3)] || COLORS[0];

      barElsRef.current.forEach((barEl, i) => {
        if (!barEl) return;
        const bSpring = springs.bars[i];
        const w = clamp(bSpring.x, 0, 1.05) * 100;
        barEl.style.width = `${w.toFixed(2)}%`;
        barEl.style.backgroundColor = col;
      });

      // Render Word rise & color
      if (wordElRef.current) {
        const wdVal = clamp(springs.WD.x, 0, 1);
        wordElRef.current.style.opacity = wdVal.toFixed(3);
        wordElRef.current.style.transform = `translateY(${((1 - wdVal) * 6).toFixed(2)}px)`;
        wordElRef.current.style.color = curScore > 0 && password ? col : 'var(--color-text-muted, #94a3b8)';
      }

      // Render Eye slash & pupil
      if (slashElRef.current && pupilElRef.current) {
        const e = clamp(springs.E.x, 0, 1);
        // When shown=false (e=0), slash is drawn (dashoffset=0). When shown=true (e=1), slash disappears (dashoffset=22).
        slashElRef.current.style.strokeDashoffset = (slashLen * e).toFixed(2);
        pupilElRef.current.style.transform = `scale(${(0.5 + 0.5 * e).toFixed(3)})`;
        pupilElRef.current.style.transformOrigin = '12px 12px';
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [password]);

  // Autoplay typing loop when enabled
  useEffect(() => {
    if (!autoplay) return;

    let stopped = false;
    const play = () => {
      if (stopped) return;
      if (stateRef.current.clock < stateRef.current.userUntil) {
        const tid = setTimeout(play, 1500);
        stateRef.current.autoplayTimers.push(tid);
        return;
      }

      setPassword('');
      const demoPass = 'Amal2026!سلام';
      demoPass.split('').forEach((ch, idx) => {
        const tid = setTimeout(() => {
          if (stopped) return;
          setPassword((prev) => prev + ch);
        }, 350 + idx * 140);
        stateRef.current.autoplayTimers.push(tid);
      });

      const totalTyping = 350 + demoPass.length * 140;
      const tid1 = setTimeout(() => {
        if (!stopped) {
          setShown(true);
          springsRef.current.E.t = 1;
        }
      }, totalTyping + 500);

      const tid2 = setTimeout(() => {
        if (!stopped) {
          setShown(false);
          springsRef.current.E.t = 0;
        }
      }, totalTyping + 2000);

      const tid3 = setTimeout(play, totalTyping + 3400);

      stateRef.current.autoplayTimers.push(tid1, tid2, tid3);
    };

    const initialTid = setTimeout(play, 800);
    stateRef.current.autoplayTimers.push(initialTid);

    return () => {
      stopped = true;
      stateRef.current.autoplayTimers.forEach(clearTimeout);
    };
  }, [autoplay]);

  const toggleShown = () => {
    stateRef.current.userUntil = stateRef.current.clock + 10;
    setShown((prev) => {
      const next = !prev;
      springsRef.current.E.t = next ? 1 : 0;
      return next;
    });
  };

  const handleInputChange = (e) => {
    stateRef.current.userUntil = stateRef.current.clock + 12;
    const val = e.target.value;
    setPassword(val);
    onChange?.(e);
  };

  const handleInputFocus = () => {
    stateRef.current.userUntil = stateRef.current.clock + 12;
    stateRef.current.autoplayTimers.forEach(clearTimeout);
  };

  const words = isAr ? WORDS_AR : WORDS_EN;
  const wordText = password ? words[score] : words[0];
  const defaultRules = isAr
    ? '8+ أحرف، رقم، ورمز خاص'
    : '8+ chars, a number, a symbol';

  return (
    <div className={cn('w-full space-y-2 text-start select-none', className)}>
      {/* Label */}
      {label !== null && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-text-primary"
        >
          {label || (isAr ? 'كلمة المرور' : 'Password')}
        </label>
      )}

      {/* Input Field with Start Lock & End Animated Eye */}
      {showInput && (
        <div
          className={cn(
            'relative flex items-center h-10 sm:h-11 w-full rounded-xl bg-surface-card border transition-all duration-200 shadow-2xs',
            error
              ? 'border-error focus-within:border-error focus-within:ring-2 focus-within:ring-error/20'
              : 'border-surface-border focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 hover:border-surface-border-strong',
            disabled && 'opacity-60 cursor-not-allowed bg-surface-muted/40'
          )}
        >
          {/* Start Lock Icon */}
          <div className="ps-3 pe-1 text-text-muted flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" aria-hidden="true" />
          </div>

          {/* Real Input */}
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type={shown ? 'text' : 'password'}
            value={password}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder || (isAr ? 'أدخل كلمة المرور...' : 'Create a strong password...')}
            autoComplete={autoComplete || 'new-password'}
            disabled={disabled}
            required={required}
            spellCheck="false"
            className="flex-1 min-w-0 bg-transparent px-2.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden disabled:cursor-not-allowed"
          />

          {/* End Animated Eye Toggle Button */}
          {showEye && (
            <button
              type="button"
              onClick={toggleShown}
              disabled={disabled}
              className="pe-3 ps-1 h-full text-text-muted hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-primary-500 rounded-r-xl disabled:cursor-not-allowed"
              aria-label={shown ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
              aria-pressed={shown}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-none stroke-current stroke-[1.9] stroke-linecap-round stroke-linejoin-round"
                aria-hidden="true"
              >
                {/* Eyelid */}
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                {/* Pupil (Scales when hidden) */}
                <circle ref={pupilElRef} cx="12" cy="12" r="2.8" />
                {/* Slash (Draws in/out via dashoffset) */}
                <path
                  ref={slashElRef}
                  d="M4.5 4.5l15 15"
                  style={{ strokeDasharray: slashLen }}
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Error Feedback */}
      {showInput && error && (
        <p className="text-xs text-error font-medium" role="alert">
          {error}
        </p>
      )}

      {/* 4 Animated Strength Bars */}
      <div className="flex gap-1.5 pt-1 w-full" aria-hidden="true">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="relative flex-1 h-[5px] rounded-full bg-surface-muted/60 dark:bg-white/10 overflow-hidden"
          >
            <div
              ref={(el) => (barElsRef.current[idx] = el)}
              className="absolute inset-y-0 start-0 rounded-full transition-colors duration-200"
              style={{ width: '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Strength Word & Rules Text */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <span
          ref={wordElRef}
          className="font-bold text-xs transition-colors duration-200"
        >
          {wordText}
        </span>
        <span className="text-[11px] text-text-muted">
          {rulesText || defaultRules}
        </span>
      </div>
    </div>
  );
}

export default PasswordStrength;
