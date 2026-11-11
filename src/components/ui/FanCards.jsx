import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Fan Cards Component
 * Rebuilt from DesignBookmark Motion Studies (https://designbookmark.com/motion#db-fan-cards)
 *
 * Springs & Timing (DesignBookmark Tokens):
 * - Fan spring (f): stiffness = 220, damping = 18 (smooth spreading fan)
 * - Card Lift:      stiffness = 420, damping = 20 (lift = -22px on hover, impulse = -260 on click)
 * - Card Scale:     stiffness = 420, damping = 22 (scale = 1.06 on hover)
 * - Autoplay cycle: 1.4s on close, 0.75s between card steps when idle.
 */

function createSpring(x, k = 400, c = 30) {
  return { x, v: 0, t: x, k, c };
}

function stepSpring(s, dt) {
  const a = -s.k * (s.x - s.t) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
}

// Glowing orb presets inspired by bencho.dev / DesignBookmark
export const AVATAR_PRESETS = {
  1: { a: '#ff6ad5', b: '#7b5cff' },
  2: { a: '#3ec9ff', b: '#5b5bff' },
  3: { a: '#a6f24a', b: '#16c7a4' },
  4: { a: '#ff8a5c', b: '#f0365a' },
  5: { a: '#ffd23f', b: '#ff7a1a' }, // Warm Gold & Amber (AMAL Energy)
  6: { a: '#4ff0e0', b: '#2f7bff' },
  7: { a: '#c69bff', b: '#ff5c9e' }, // AMAL Orchid & Rose
  8: { a: '#6dffb0', b: '#12b86a' }, // Emerald Calm
  9: { a: '#ffb38a', b: '#ff4f86' }, // Coral Flare
  10: { a: '#9d6bff', b: '#3a3ad9' },
  11: { a: '#e6ff5c', b: '#3fcf5a' },
  12: { a: '#ff7ab0', b: '#a64dff' },
};

// Default AMAL Product Cards
const DEFAULT_AMAL_CARDS = [
  {
    id: 'linguistic',
    num: '01',
    title: 'التحليل اللغوي',
    titleEn: 'Text Analysis',
    subtitle: 'أنماط التعبير والمشاعر',
    subtitleEn: 'Linguistic Tone & Emotion',
    avatar: '7',
    badge: 'NLP',
  },
  {
    id: 'voice',
    num: '02',
    title: 'تحليل نبرة الصوت',
    titleEn: 'Voice Biomarkers',
    subtitle: 'مؤشرات النبرة والإجهاد',
    subtitleEn: 'Vocal Biomarkers & Stress',
    avatar: '5',
    badge: 'Audio',
  },
  {
    id: 'radar',
    num: '03',
    title: 'راصد الشائعات',
    titleEn: 'Rumor Radar',
    subtitle: 'توعية معرفية موثوقة',
    subtitleEn: 'Fact-checked Awareness',
    avatar: '9',
    badge: 'Truth',
  },
];

export function FanCards({
  cards = DEFAULT_AMAL_CARDS,
  onSelect,
  spread = 156,
  autoplay = true,
  className,
  width = 164,
  height = 214,
}) {
  const { language } = useTranslation();
  const isAr = language !== 'en';

  const containerRef = useRef(null);
  const cardElsRef = useRef([]);
  const springsRef = useRef({
    f: createSpring(0, 220, 18),
    cards: [
      { lift: createSpring(0, 420, 20), sc: createSpring(1, 420, 22) },
      { lift: createSpring(0, 420, 20), sc: createSpring(1, 420, 22) },
      { lift: createSpring(0, 420, 20), sc: createSpring(1, 420, 22) },
    ],
  });

  const stateRef = useRef({
    hot: -1,
    clock: 0,
    userUntil: 0,
    inside: false,
    autoStep: 0,
    timer: null,
  });

  const getBaseZIndex = useCallback((idx) => {
    // Center card (idx 1) is naturally raised at rest (z-index 3),
    // outer cards fan out underneath (z-index 1) so center title is never covered.
    if (idx === 1) return 3;
    return 1;
  }, []);

  const setHot = useCallback((i) => {
    stateRef.current.hot = i;
    const springs = springsRef.current;
    springs.cards.forEach((c, idx) => {
      c.lift.t = idx === i ? -22 : 0;
      c.sc.t = idx === i ? 1.06 : 1;
      const el = cardElsRef.current[idx];
      if (el) {
        el.style.zIndex = idx === i ? '20' : String(getBaseZIndex(idx));
      }
    });
  }, [getBaseZIndex]);

  // Main animation frame loop with physics sub-stepping
  useEffect(() => {
    let animId;
    let last = performance.now();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Apply reduced motion damping if requested by user OS
    if (reduced) {
      springsRef.current.f.c = 2 * Math.sqrt(springsRef.current.f.k);
      springsRef.current.cards.forEach((c) => {
        c.lift.c = 2 * Math.sqrt(c.lift.k);
        c.sc.c = 2 * Math.sqrt(c.sc.k);
      });
    }

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      stateRef.current.clock += dt;

      // Sub-stepping for ultra-stable spring physics
      const sub = 4;
      const subDt = dt / sub;
      const springs = springsRef.current;

      for (let k = 0; k < sub; k++) {
        stepSpring(springs.f, subDt);
        springs.cards.forEach((c) => {
          stepSpring(c.lift, subDt);
          stepSpring(c.sc, subDt);
        });
      }

      // Render transforms
      const fVal = springs.f.x;
      const dir = isAr ? -1 : 1; // Natural Arabic fan mirror

      springs.cards.forEach((c, i) => {
        const el = cardElsRef.current[i];
        if (!el) return;

        const d = (i - 1) * dir;
        const x = d * (6 + fVal * (spread - 6));
        const r = d * (3 + fVal * 9);
        const y = Math.abs(d) * fVal * 12 + c.lift.x;
        const sc = c.sc.x;

        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg) scale(${sc.toFixed(4)})`;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [spread, isAr]);

  // Autoplay sequencer
  useEffect(() => {
    if (!autoplay) return;

    let timeoutId;
    const SEQ = [
      () => {
        springsRef.current.f.t = 1;
      },
      () => setHot(0),
      () => setHot(1),
      () => setHot(2),
      () => setHot(-1),
      () => {
        springsRef.current.f.t = 0;
      },
    ];

    const runAuto = () => {
      const state = stateRef.current;
      if (state.clock >= state.userUntil && !state.inside) {
        const fn = SEQ[state.autoStep % SEQ.length];
        fn();
        state.autoStep++;
      }
      const delay = state.autoStep % SEQ.length === 0 ? 1400 : 750;
      timeoutId = setTimeout(runAuto, delay);
    };

    timeoutId = setTimeout(runAuto, 1000);
    return () => clearTimeout(timeoutId);
  }, [autoplay, setHot]);

  const handlePointerEnter = () => {
    const state = stateRef.current;
    state.inside = true;
    state.userUntil = Infinity;
    springsRef.current.f.t = 1;
  };

  const handlePointerLeave = () => {
    const state = stateRef.current;
    state.inside = false;
    state.userUntil = state.clock + 2.0; // Resume autoplay after 2s of idle
    springsRef.current.f.t = 0;
    setHot(-1);
  };

  const handleCardClick = (i, card) => {
    // Tap pop impulse (-260 velocity)
    const cardSpring = springsRef.current.cards[i];
    if (cardSpring) {
      cardSpring.lift.v = -260;
    }
    setHot(i);
    onSelect?.(card, i);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative select-none touch-none cursor-pointer',
        className
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      role="region"
      aria-label={isAr ? 'بطاقات أمل المروحية' : 'AMAL Fan Cards'}
    >
      {cards.slice(0, 3).map((card, i) => {
        const av = AVATAR_PRESETS[card.avatar] || AVATAR_PRESETS[5];
        const title = isAr ? card.title : card.titleEn || card.title;
        const subtitle = isAr ? card.subtitle : card.subtitleEn || card.subtitle;

        return (
          <div
            key={card.id || i}
            ref={(el) => (cardElsRef.current[i] = el)}
            className={cn(
              'absolute inset-0 p-2.5 rounded-[18px] cursor-pointer shadow-md transition-shadow duration-300',
              'border border-white/10 dark:border-white/5 backdrop-blur-xs',
              // Multi-layer surface background colors matching token mix
              i === 0 && 'bg-surface-card hover:shadow-purple-500/10',
              i === 1 && 'bg-surface-elevated hover:shadow-teal-500/10',
              i === 2 && 'bg-surface-card hover:shadow-rose-500/10'
            )}
            style={{
              transformOrigin: '50% 100%',
              willChange: 'transform',
              zIndex: getBaseZIndex(i),
            }}
            onPointerEnter={() => {
              if (stateRef.current.inside) setHot(i);
            }}
            onClick={() => handleCardClick(i, card)}
          >
            {/* Glowing Orb Art with lit sphere radial gradient */}
            <div
              className="w-full h-[98px] rounded-[12px] relative overflow-hidden flex items-end p-2"
              style={{
                background: `
                  radial-gradient(55% 55% at 30% 22%, rgba(255,255,255,.45) 0, rgba(255,255,255,0) 70%),
                  radial-gradient(110% 80% at 50% 118%, rgba(0,0,0,.22) 0, rgba(0,0,0,0) 60%),
                  radial-gradient(95% 95% at 82% 88%, ${av.b} 8%, transparent 78%),
                  ${av.a}
                `,
              }}
            >
              {card.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/35 text-white/90 backdrop-blur-xs">
                  {card.badge}
                </span>
              )}
            </div>

            {/* Card Index Number */}
            <div className="mt-2 font-mono text-[11px] font-semibold text-text-muted text-center">
              {card.num || `0${i + 1}`}
            </div>

            {/* Title - Centered so overlap on either edge never hides any characters */}
            <div className="mt-0.5 text-[13.5px] font-bold text-text-primary tracking-tight text-center px-1 truncate">
              {title}
            </div>

            {/* Subtitle / Meaningful Product Content */}
            <div className="text-[11px] text-text-muted text-center px-1 truncate max-w-full font-medium mt-0.5">
              {subtitle}
            </div>

            {/* Skeleton / Subtitle indicator bars */}
            <div className="mt-2 flex flex-col items-center gap-1.5 w-full">
              <div className="w-[60%] h-1 rounded-full bg-text-muted/15" />
              <div className="w-[35%] h-1 rounded-full bg-text-muted/10" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FanCards;
