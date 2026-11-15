import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * DesignBookmark Motion - Goo Thinking component.
 * Three dots bounce in a pill through an SVG goo filter, stretching toward each other.
 * When the answer is ready, they merge together into one drop, the drop sinks away,
 * and the pill elastically springs open into the reply.
 *
 * Springs & Tokens:
 * - dots x: stiffness 300, damping 22
 * - dots y: stiffness 420, damping 14
 * - W (width):  stiffness 240, damping 24
 * - H (height): stiffness 240, damping 24
 * - drop: stiffness 300, damping 26
 * - A (answer opacity): stiffness 260, damping 28
 * - big (drop scale): stiffness 300, damping 24
 */

function createSpring(x, k = 400, c = 30) {
  return { x, v: 0, t: x, k, c };
}

function tuneSpring(s, k, c, reduce = false) {
  s.k = k;
  s.c = reduce ? 2 * Math.sqrt(k) : c;
}

function stepSpring(s, dt) {
  const a = -s.k * (s.x - s.t) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

const AR_REPLIES = [
  'أنا هنا لمساعدتك والاستماع إليك. خذ نفساً عميقاً وتذكر أن كل مشاعرك مرحب بها.',
  'تقنية التنفس الهادئ (4-7-8) يمكن أن تساعدك في تخفيف التوتر واستعادة التوازن الآن.',
  'يمكنك إجراء التقييم النفسي السريع في أي وقت للتعرف على مؤشرات القلق والمزاج بدقة.',
  'خطوة صغيرة واحدة نحو العناية بنفسك اليوم كفيلة بإحداث فارق كبير في راحتك النفسية.',
];

const EN_REPLIES = [
  "I'm here to support and listen. Take a deep breath and know that your feelings are valid.",
  'Gentle 4-7-8 breathing can help ease tension and restore calm right now.',
  'You can take the quick AMAL assessment anytime for personalized wellbeing insights.',
  'One small mindful step today can make a meaningful difference in your peace of mind.',
];

export function GooThinking({
  text,
  autoCycle = false,
  interactive = true,
  onComplete,
  className,
  initialPhase = 'think',
}) {
  const { language } = useTranslation();
  const isRtl = language === 'ar';
  const replies = isRtl ? AR_REPLIES : EN_REPLIES;

  const wrapRef = useRef(null);
  const bubbleRef = useRef(null);
  const answerRef = useRef(null);
  const dot0Ref = useRef(null);
  const dot1Ref = useRef(null);
  const dot2Ref = useRef(null);

  const replyIndexRef = useRef(0);
  const phaseRef = useRef(initialPhase);
  const [currentText, setCurrentText] = useState(text || replies[0]);

  useEffect(() => {
    if (text) setCurrentText(text);
  }, [text]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initialize springs exactly from tokens.css
    const dots = [
      { el: dot0Ref.current, x: createSpring(19, 300, 22), y: createSpring(0, 420, 14), i: 0 },
      { el: dot1Ref.current, x: createSpring(32, 300, 22), y: createSpring(0, 420, 14), i: 1 },
      { el: dot2Ref.current, x: createSpring(45, 300, 22), y: createSpring(0, 420, 14), i: 2 },
    ];

    dots.forEach((d) => {
      tuneSpring(d.x, 300, 22, reduce);
      tuneSpring(d.y, 420, 14, reduce);
    });

    const W = createSpring(64, 240, 24);
    const H = createSpring(40, 240, 24);
    const drop = createSpring(1, 300, 26);
    const A = createSpring(0, 260, 28);
    const big = createSpring(1, 300, 24);

    [W, H].forEach((s) => tuneSpring(s, 240, 24, reduce));
    tuneSpring(drop, 300, 26, reduce);
    tuneSpring(A, 260, 28, reduce);
    tuneSpring(big, 300, 24, reduce);

    let hop = 0.3;
    let k = 0;
    let activeTimers = [];

    const later = (sec, fn) => {
      const timer = {
        t: sec,
        fn: () => {
          activeTimers = activeTimers.filter((item) => item !== timer);
          fn();
        },
      };
      activeTimers.push(timer);
      return timer;
    };

    const clearAllTimers = () => {
      activeTimers = [];
    };

    function startThink() {
      phaseRef.current = 'think';
      A.t = 0;
      later(0.25, () => {
        W.t = 64;
        H.t = 40;
        dots.forEach((d) => {
          d.x.t = 19 + d.i * 13;
        });
        drop.t = 1;
        big.t = 1;
        bubbleRef.current?.setAttribute('aria-label', isRtl ? 'جارٍ التفكير...' : 'Thinking...');
      });

      if (autoCycle) {
        later(2.8, startReply);
      }
    }

    function startReply() {
      phaseRef.current = 'merge';
      // Dots run together into the center
      dots.forEach((d) => {
        d.x.t = 32 - 4.5;
        d.y.t = 0;
      });
      big.t = 1.45;

      later(0.45, () => {
        drop.t = 0; // drop sinks away
      });

      later(0.6, () => {
        phaseRef.current = 'answer';
        const nextContent = text || replies[replyIndexRef.current % replies.length];
        replyIndexRef.current += 1;
        setCurrentText(nextContent);

        if (answerRef.current && wrapRef.current) {
          answerRef.current.textContent = nextContent;
          bubbleRef.current?.setAttribute('aria-label', nextContent);

          const maxAvailableWidth = wrapRef.current.offsetWidth || 320;
          const targetW = Math.max(160, Math.min(340, maxAvailableWidth));
          answerRef.current.style.width = `${targetW - 32}px`;
          const targetH = Math.max(48, answerRef.current.offsetHeight + 24);

          W.t = targetW;
          H.t = targetH;
        }

        later(0.12, () => {
          A.t = 1;
          if (onComplete) onComplete();
        });

        if (autoCycle) {
          later(4.8, startThink);
        }
      });
    }

    // Interactive click handler
    const handleBubbleClick = () => {
      if (!interactive) return;
      clearAllTimers();
      if (phaseRef.current === 'answer') {
        startThink();
      } else {
        startReply();
      }
    };

    const bubbleEl = bubbleRef.current;
    if (bubbleEl) {
      bubbleEl.addEventListener('click', handleBubbleClick);
    }

    // Initial phase setup
    if (initialPhase === 'answer') {
      startReply();
    } else {
      startThink();
    }

    // Animation Loop with 4 sub-steps per frame
    let animId;
    let lastTime = performance.now();

    function loop(now) {
      let dt = (now - lastTime) / 1000;
      lastTime = now;
      if (dt > 0.05) dt = 0.05;
      if (dt < 0.001) dt = 0.001;

      // Update sim timers
      for (let i = activeTimers.length - 1; i >= 0; i--) {
        const item = activeTimers[i];
        if (item) {
          item.t -= dt;
          if (item.t <= 0) {
            activeTimers.splice(i, 1);
            item.fn();
          }
        }
      }

      // Physics sub-stepping (4 steps)
      const sub = 4;
      const subDt = dt / sub;
      for (let sIdx = 0; sIdx < sub; sIdx++) {
        if (phaseRef.current === 'think') {
          hop -= subDt;
          if (hop <= 0) {
            dots[k % 3].y.v = -95;
            k++;
            hop = k % 3 ? 0.16 : 0.46;
          }
        }

        [W, H, drop, A, big].forEach((s) => stepSpring(s, subDt));
        dots.forEach((d) => {
          stepSpring(d.x, subDt);
          stepSpring(d.y, subDt);
        });
      }

      // Render styles
      if (bubbleRef.current) {
        bubbleRef.current.style.width = `${W.x.toFixed(2)}px`;
        bubbleRef.current.style.height = `${H.x.toFixed(2)}px`;
      }

      const s = clamp(drop.x, 0, 1.2) * big.x;
      dots.forEach((d) => {
        if (d.el) {
          d.el.style.transform = `translate(${d.x.x.toFixed(2)}px, ${(15.5 + d.y.x).toFixed(2)}px) scale(${s.toFixed(3)})`;
        }
      });

      if (answerRef.current) {
        answerRef.current.style.opacity = clamp(A.x, 0, 1).toFixed(3);
        const yOffset = (1 - A.x) * 8;
        answerRef.current.style.transform = `translateY(${yOffset.toFixed(2)}px)`;
      }

      animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      clearAllTimers();
      if (bubbleEl) {
        bubbleEl.removeEventListener('click', handleBubbleClick);
      }
    };
  }, [autoCycle, interactive, onComplete, initialPhase, language, isRtl, replies, text]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        'relative inline-block max-w-full font-cairo select-none text-start',
        className
      )}
    >
      {/* SVG Goo Filter with exact matrix thresholds */}
      <svg
        width="0"
        height="0"
        className="absolute pointer-events-none opacity-0"
        aria-hidden="true"
      >
        <filter id="amal-dotgoo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
          />
        </filter>
      </svg>

      {/* Pill Bubble */}
      <div
        ref={bubbleRef}
        role="status"
        aria-live="polite"
        title={interactive ? (isRtl ? 'اضغط للمعاينة والتبديل' : 'Click to preview reply') : undefined}
        className={cn(
          'relative overflow-hidden transition-shadow duration-300',
          'rounded-[20px]',
          'bg-white dark:bg-[#261b33]',
          'border border-primary-500/25 dark:border-primary-400/20',
          'shadow-[0_4px_16px_rgba(112,64,154,0.15)] dark:shadow-[0_4px_20px_rgba(161,105,207,0.2)]',
          interactive && 'cursor-pointer hover:border-primary-500/50 hover:shadow-[0_6px_22px_rgba(161,105,207,0.3)]'
        )}
        style={{ width: '64px', height: '40px' }}
      >
        {/* Goo Layer with 3 dots */}
        <div
          className="absolute left-0 top-0 pointer-events-none"
          style={{
            width: '64px',
            height: '40px',
            filter: 'url(#amal-dotgoo)',
          }}
        >
          <i
            ref={dot0Ref}
            className="absolute left-0 top-0 w-[9px] h-[9px] rounded-full bg-primary-600 dark:bg-primary-400 will-change-transform"
          />
          <i
            ref={dot1Ref}
            className="absolute left-0 top-0 w-[9px] h-[9px] rounded-full bg-primary-600 dark:bg-primary-400 will-change-transform"
          />
          <i
            ref={dot2Ref}
            className="absolute left-0 top-0 w-[9px] h-[9px] rounded-full bg-primary-600 dark:bg-primary-400 will-change-transform"
          />
        </div>

        {/* Answer Text */}
        <p
          ref={answerRef}
          className={cn(
            'absolute top-[12px] m-0 text-[13.5px] sm:text-[14px] leading-[22px]',
            'text-text-primary dark:text-[#f4effa] font-normal will-change-transform',
            isRtl ? 'right-[16px] text-right' : 'left-[16px] text-left'
          )}
          style={{ opacity: 0 }}
        >
          {currentText}
        </p>
      </div>
    </div>
  );
}
