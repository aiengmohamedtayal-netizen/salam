import { useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Spring helper function matching DesignBookmark Motion tokens.css
 * Focus spring: stiffness = 150, damping = 22
 * Weight spring: stiffness = 260, damping = 22
 */
function createSpring(x, k = 400, c = 30) {
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

/**
 * WeightWave Animated Component
 *
 * Rebuilt for AMAL using exact DesignBookmark motion physics:
 * - Springs: focus (150, 22), item weight (260, 22)
 * - Automatic idle cosine sweep (4.6s cycle) + interactive pointer tracking
 * - Gaussian bell curve swell (exp(-d*d))
 * - Script-aware: words for Arabic (preserves cursive typography), characters for Latin
 */
export function WeightWave({
  text = 'افهم ما وراء كلماتك، بوعي وهدوء',
  lines,
  splitBy = 'auto',
  lightWeight = 300,
  boldWeight = 850,
  spread = 0.24,
  as: Component = 'div',
  className = '',
  itemClassName = '',
  ariaLabel,
}) {
  const containerRef = useRef(null);
  const itemsRef = useRef([]);

  // Normalize lines input
  const textLines = useMemo(() => {
    if (lines && Array.isArray(lines)) {
      return lines.map((l) =>
        typeof l === 'string' ? { text: l, className: '' } : l
      );
    }
    if (typeof text === 'string') {
      const parts = text.includes('\n') ? text.split('\n') : [text];
      return parts.map((p) => ({ text: p, className: '' }));
    }
    return [{ text: String(text), className: '' }];
  }, [text, lines]);

  // Tokenize each line into animatable units
  const parsedLines = useMemo(() => {
    return textLines.map((lineObj) => {
      const lineStr = lineObj.text;
      const isArabic = /[\u0600-\u06FF]/.test(lineStr);
      const shouldSplitByWords =
        splitBy === 'words' || (splitBy === 'auto' && isArabic);

      if (shouldSplitByWords) {
        const tokens = lineStr.split(/(\s+)/);
        return tokens
          .filter((t) => t.length > 0)
          .map((tok) => ({
            text: tok,
            isSpace: /^\s+$/.test(tok),
          }));
      } else {
        return [...lineStr].map((ch) => ({
          text: ch,
          isSpace: ch === ' ',
        }));
      }
    });
  }, [textLines, splitBy]);

  // Flatten active animatable tokens
  const animatableTokens = useMemo(() => {
    const list = [];
    parsedLines.forEach((lineTokens, lineIdx) => {
      lineTokens.forEach((token, tokIdx) => {
        if (!token.isSpace) {
          list.push({ lineIdx, tokIdx, text: token.text });
        }
      });
    });
    return list;
  }, [parsedLines]);

  const springsRef = useRef({
    focus: createSpring(-0.2, 150, 22),
    items: animatableTokens.map(() => createSpring(lightWeight, 260, 22)),
    hover: false,
    t: 0,
  });

  // Re-sync springs when tokens change
  useEffect(() => {
    springsRef.current.items = animatableTokens.map(() =>
      createSpring(lightWeight, 260, 22)
    );
  }, [animatableTokens, lightWeight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width) return;
      springsRef.current.hover = true;
      springsRef.current.focus.t = (e.clientX - rect.left) / rect.width;
    };

    const handlePointerLeave = () => {
      springsRef.current.hover = false;
      springsRef.current.t = 0;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    let animId;
    let lastTime = performance.now();

    const frameLoop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      const { focus, items } = springsRef.current;

      // Automatic wave motion when not hovering (4.6s cosine cycle)
      if (!springsRef.current.hover) {
        springsRef.current.t += dt;
        focus.t =
          -0.08 +
          1.16 *
            (0.5 - 0.5 * Math.cos((springsRef.current.t * Math.PI * 2) / 4.6));
      }

      stepSpring(focus, dt);
      items.forEach((item) => stepSpring(item, dt));

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const validElements = itemsRef.current.filter(Boolean);

        if (containerRect.width > 0 && validElements.length === items.length) {
          // Precise relative center for each word/letter using getBoundingClientRect
          const centres = validElements.map((el) => {
            const r = el.getBoundingClientRect();
            return (r.left + r.width / 2 - containerRect.left) / containerRect.width;
          });

          items.forEach((item, k) => {
            const el = validElements[k];
            if (!el) return;

            const d = (centres[k] - focus.x) / spread;
            const g = Math.exp(-d * d); // Gaussian bell curve
            item.t = lightWeight + (boldWeight - lightWeight) * g;

            const currentW = clamp(item.x, 100, 1000);
            el.style.fontWeight = currentW.toFixed(1);

            // Subtle opacity swell matching weight
            const opacityNorm = clamp(
              (currentW - lightWeight) / (boldWeight - lightWeight),
              0,
              1
            );
            el.style.opacity = (0.6 + 0.4 * opacityNorm).toFixed(3);
          });
        }
      }

      animId = requestAnimationFrame(frameLoop);
    };

    animId = requestAnimationFrame(frameLoop);

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(animId);
    };
  }, [animatableTokens, lightWeight, boldWeight, spread]);

  itemsRef.current = [];

  const fullText = textLines.map((l) => l.text).join(' ');

  return (
    <Component
      ref={containerRef}
      aria-label={ariaLabel || fullText}
      className={cn(
        'wave relative select-none cursor-default font-cairo',
        'leading-[1.25] tracking-tight',
        className
      )}
    >
      {parsedLines.map((lineTokens, lineIdx) => {
        const lineMeta = textLines[lineIdx];
        return (
          <span
            key={lineIdx}
            className={cn('block whitespace-nowrap', lineMeta?.className)}
          >
            {lineTokens.map((tok, tokIdx) => {
              if (tok.isSpace) {
                return (
                  <span key={tokIdx} className="whitespace-pre">
                    {' '}
                  </span>
                );
              }

              return (
                <span
                  key={tokIdx}
                  ref={(el) => {
                    if (el) itemsRef.current.push(el);
                  }}
                  aria-hidden="true"
                  className={cn(
                    'inline-block will-change-transform font-cairo',
                    itemClassName
                  )}
                  style={{
                    fontWeight: lightWeight,
                    fontVariationSettings: `"wght" ${lightWeight}`,
                  }}
                >
                  {tok.text}
                </span>
              );
            })}
          </span>
        );
      })}
    </Component>
  );
}

export default WeightWave;
