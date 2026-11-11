import { useEffect, useRef, useState, useId, useCallback } from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Spring helper function matching DesignBookmark Motion tokens.css
 * Follow:  stiffness = 900, damping = 50 (thumb following pointer)
 * Bubble:  stiffness = 420, damping = 22 (value bubble rising out of thumb)
 * Release: stiffness = 300, damping = 14 (snap back after over-drag)
 * Glide:   stiffness = 420, damping = 34 (keyboard value glide)
 * Drop Lag (DX): stiffness = 260, damping = 18 (horizontal lag causing tilt)
 * Press (PS):    stiffness = 520, damping = 16 (thumb hover / press scale)
 */
function createSpring(x, k = 400, c = 30) {
  return { x, v: 0, t: x, k, c };
}

function tuneSpring(s, k, c) {
  s.k = k;
  s.c = c;
}

function stepSpring(s, dt) {
  const a = -s.k * (s.x - s.t) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function JellySlider({
  value: controlledValue,
  defaultValue = 40,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  subtitle,
  unit = '',
  className = '',
  ariaLabel,
}) {
  const { direction, t } = useTranslation();
  const isRTL = direction === 'rtl';
  const filterId = useId().replace(/:/g, '_') + '_goo';

  const [currentVal, setCurrentVal] = useState(
    controlledValue !== undefined ? controlledValue : defaultValue
  );

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setCurrentVal(controlledValue);
    }
  }, [controlledValue]);

  // DOM refs
  const railRef = useRef(null);
  const fillRef = useRef(null);
  const thumbRef = useRef(null);
  const dropRef = useRef(null);
  const dropLabelRef = useRef(null);
  const hitRef = useRef(null);
  const marksContainerRef = useRef(null);
  const numsContainerRef = useRef(null);

  // Dimensions & Physics constants
  const R = 12; // thumb radius
  const TR = 14; // drawn thumb half-size (goo filter eats ~2px)
  const D = 18; // drop radius
  const OX = 40; // goo offset X
  const OY = 80; // goo offset Y
  const CY = 16; // track center Y inside rail
  const RISE = -38; // drop elevation when lifted
  const REST_DROP = 0.5; // drop scale at rest

  const stateRef = useRef({
    Wd: 320,
    ratio: (defaultValue - min) / (max - min),
    value: defaultValue,
    dragging: false,
    hover: false,
    lifted: false,
    litValue: -1,
  });

  const span = () => Math.max(stateRef.current.Wd - 2 * R, 1);

  // Map value to coordinate
  const toX = useCallback(
    (v) => {
      const p = clamp((v - min) / (max - min), 0, 1);
      return isRTL
        ? stateRef.current.Wd - R - p * span()
        : R + p * span();
    },
    [isRTL, min, max]
  );

  // Map coordinate to value
  const toV = useCallback(
    (x) => {
      const clampedX = clamp(x, R, stateRef.current.Wd - R);
      const p = isRTL
        ? (stateRef.current.Wd - R - clampedX) / span()
        : (clampedX - R) / span();
      const raw = min + clamp(p, 0, 1) * (max - min);
      return Math.round(raw / step) * step;
    },
    [isRTL, min, max, step]
  );

  // Initialize springs
  const springsRef = useRef({
    X: createSpring(toX(defaultValue), 900, 50),
    DX: createSpring(toX(defaultValue), 260, 18),
    DY: createSpring(CY, 420, 22),
    DS: createSpring(REST_DROP, 420, 22),
    PS: createSpring(1, 520, 16),
  });

  // Rubber resistance past edges
  const rubber = (x, minX, maxX, d = 18) => {
    if (x < minX) {
      return minX - (1 - 1 / (((minX - x) * 0.55) / d + 1)) * d;
    }
    if (x > maxX) {
      return maxX + (1 - 1 / (((x - maxX) * 0.55) / d + 1)) * d;
    }
    return x;
  };

  const getLocalX = (e) => {
    if (!railRef.current) return 0;
    const rect = railRef.current.getBoundingClientRect();
    return e.clientX - rect.left;
  };

  const syncTargets = () => {
    const { dragging, lifted } = stateRef.current;
    const up = dragging || lifted;
    const { DY, DS, PS } = springsRef.current;
    DY.t = up ? CY + RISE : CY;
    DS.t = up ? 1 : REST_DROP;
    PS.t = dragging ? 1.16 : stateRef.current.hover ? 1.08 : 1;
  };

  const lightScale = (val) => {
    if (val === stateRef.current.litValue) return;
    stateRef.current.litValue = val;

    if (marksContainerRef.current) {
      const marks = marksContainerRef.current.children;
      for (let i = 0; i < marks.length; i++) {
        const markVal = min + (i * (max - min)) / 20; // 20 intervals = every 5%
        marks[i].classList.toggle('on', markVal <= val && val > min);
      }
    }

    if (numsContainerRef.current) {
      const nums = numsContainerRef.current.children;
      const checkpoints = [min, min + 0.25 * (max - min), min + 0.5 * (max - min), min + 0.75 * (max - min), max];
      for (let i = 0; i < nums.length; i++) {
        nums[i].classList.toggle('on', checkpoints[i] <= val && val > min);
      }
    }
  };

  // ResizeObserver to track rail width
  useEffect(() => {
    if (!railRef.current) return;
    const observer = new ResizeObserver(() => {
      if (!railRef.current) return;
      const w = railRef.current.clientWidth;
      if (!w || w === stateRef.current.Wd) return;
      stateRef.current.Wd = w;
      const newX = toX(stateRef.current.value);
      springsRef.current.X.x = springsRef.current.X.t = newX;
      springsRef.current.DX.x = springsRef.current.DX.t = newX;
      springsRef.current.X.v = springsRef.current.DX.v = 0;
    });
    observer.observe(railRef.current);
    return () => observer.disconnect();
  }, [toX]);

  // Main physics animation frame loop
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const frameLoop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      const sub = 4;
      const subDt = dt / sub;
      const { X, DX, DY, DS, PS } = springsRef.current;

      DX.t = X.x;

      for (let k = 0; k < sub; k++) {
        stepSpring(X, subDt);
        stepSpring(DX, subDt);
        stepSpring(DY, subDt);
        stepSpring(DS, subDt);
        stepSpring(PS, subDt);
      }

      // Render styles
      const x = X.x;
      const computedValue = toV(x);
      stateRef.current.value = computedValue;

      // Area-preserving velocity stretch
      const st = 1 + Math.min(Math.abs(X.v) / 2400, 0.4);
      if (thumbRef.current) {
        thumbRef.current.style.transform = `translate(${x - TR + OX}px,${CY - TR + OY}px) scale(${st * PS.x},${PS.x / st})`;
      }

      // Drop elevation, tilt and scale
      const tilt = clamp((DX.x - X.x) * (isRTL ? -0.9 : 0.9), -28, 28);
      const dTr = `translate(${DX.x - D}px,${DY.x - D}px) rotate(${tilt}deg) scale(${DS.x})`;

      if (dropRef.current) {
        dropRef.current.style.transform = `translate(${OX}px,${OY}px) ${dTr}`;
      }

      if (dropLabelRef.current) {
        dropLabelRef.current.style.transform = dTr;
        dropLabelRef.current.style.opacity = clamp((DS.x - 0.7) / 0.25, 0, 1);
        dropLabelRef.current.textContent = `${computedValue}${unit}`;
      }

      // Track Fill
      if (fillRef.current) {
        const Wd = stateRef.current.Wd;
        if (isRTL) {
          const fillWidth = clamp(Wd - x, 0, Math.max(Wd, 0)) * clamp((Wd - x - R) / R, 0, 1);
          fillRef.current.style.width = `${fillWidth.toFixed(2)}px`;
        } else {
          const fillWidth = clamp(x, 0, Math.max(Wd, 0)) * clamp((x - R) / R, 0, 1);
          fillRef.current.style.width = `${fillWidth.toFixed(2)}px`;
        }
      }

      if (hitRef.current) {
        hitRef.current.style.left = `${x - R}px`;
        hitRef.current.setAttribute('aria-valuenow', computedValue);
      }

      lightScale(computedValue);

      animId = requestAnimationFrame(frameLoop);
    };

    animId = requestAnimationFrame(frameLoop);
    return () => cancelAnimationFrame(animId);
  }, [toV, isRTL, unit]);

  // Pointer event handlers
  const handlePointerDown = (e) => {
    stateRef.current.dragging = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    tuneSpring(springsRef.current.X, 900, 50);
    const lx = getLocalX(e);
    springsRef.current.X.t = rubber(lx, R, stateRef.current.Wd - R);
    syncTargets();
    if (hitRef.current) hitRef.current.focus({ preventScroll: true });
  };

  const handlePointerMove = (e) => {
    if (!stateRef.current.dragging) return;
    const lx = getLocalX(e);
    springsRef.current.X.t = rubber(lx, R, stateRef.current.Wd - R);
    const v = toV(springsRef.current.X.t);
    if (onChange && v !== currentVal) {
      onChange(v);
    }
  };

  const handlePointerUp = () => {
    if (!stateRef.current.dragging) return;
    stateRef.current.dragging = false;

    tuneSpring(springsRef.current.X, 300, 14);
    springsRef.current.X.t = clamp(springsRef.current.X.t, R, stateRef.current.Wd - R);
    const v = toV(springsRef.current.X.t);
    setCurrentVal(v);
    if (onChange) onChange(v);
    syncTargets();
  };

  const handleKeyDown = (e) => {
    const isArrow = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key);
    if (!isArrow) return;
    e.preventDefault();

    let delta = 0;
    if (e.key === 'ArrowRight') delta = isRTL ? -step : step;
    else if (e.key === 'ArrowLeft') delta = isRTL ? step : -step;
    else if (e.key === 'ArrowUp') delta = step;
    else if (e.key === 'ArrowDown') delta = -step;
    else if (e.key === 'PageUp') delta = step * 10;
    else if (e.key === 'PageDown') delta = -step * 10;

    let next = clamp(currentVal + delta, min, max);
    if (e.key === 'Home') next = min;
    if (e.key === 'End') next = max;

    tuneSpring(springsRef.current.X, 420, 34); // glide spring
    springsRef.current.X.t = toX(next);
    setCurrentVal(next);
    if (onChange) onChange(next);

    stateRef.current.lifted = true;
    syncTargets();
  };

  // Generate tick marks (every 5%)
  const markElements = [];
  for (let i = 0; i <= 20; i++) {
    const isMajor = i % 5 === 0;
    const p = i / 20;
    markElements.push(
      <i
        key={i}
        className={cn(
          'absolute top-0 w-[1.5px] rounded-[1px] transition-all duration-200 pointer-events-none',
          isMajor
            ? 'h-[8px] bg-slate-400 dark:bg-slate-500 [&.on]:bg-primary-700 dark:[&.on]:bg-primary-300'
            : 'h-[4px] bg-surface-border [&.on]:bg-primary-400 dark:[&.on]:bg-primary-500'
        )}
        style={{
          left: isRTL
            ? `calc(12px + (100% - 24px) * ${1 - p})`
            : `calc(12px + (100% - 24px) * ${p})`,
          marginLeft: '-0.75px',
        }}
      />
    );
  }

  const checkpoints = [
    { p: 0, label: `${min}${unit}` },
    { p: 0.25, label: `${Math.round(min + 0.25 * (max - min))}${unit}` },
    { p: 0.5, label: `${Math.round(min + 0.5 * (max - min))}${unit}` },
    { p: 0.75, label: `${Math.round(min + 0.75 * (max - min))}${unit}` },
    { p: 1, label: `${max}${unit}` },
  ];

  return (
    <div className={cn('select-none font-cairo w-full max-w-[340px]', className)}>
      {/* Optional Label / Header */}
      {(label || subtitle) && (
        <div className="flex items-center justify-between mb-3 px-1">
          {label && (
            <span className="text-sm font-bold text-text-primary">{label}</span>
          )}
          {subtitle && (
            <span className="text-xs text-text-muted">{subtitle}</span>
          )}
        </div>
      )}

      {/* SVG Goo Filter */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
            <feColorMatrix
              in="b"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              result="g"
            />
            <feComposite in="SourceGraphic" in2="g" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Main Slider Rail */}
      <div
        ref={railRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') {
            stateRef.current.hover = true;
            syncTargets();
          }
        }}
        onPointerLeave={() => {
          stateRef.current.hover = false;
          syncTargets();
        }}
        className="relative h-[32px] touch-none cursor-pointer"
      >
        {/* Track & Fill */}
        <div className="track absolute inset-x-0 top-[13px] h-[6px] rounded-full bg-surface-muted dark:bg-slate-800 border border-surface-border overflow-hidden">
          <div
            ref={fillRef}
            className={cn(
              'fill absolute top-0 bottom-0 rounded-full bg-primary-600 dark:bg-primary-500 shadow-xs',
              isRTL ? 'right-0' : 'left-0'
            )}
          />
        </div>

        {/* Goo Layer (Liquid Thumb & Drop) */}
        <div
          className="goo absolute -left-10 -right-10 -top-20 h-[140px] pointer-events-none"
          style={{ filter: `url(#${filterId})` }}
        >
          <div
            ref={dropRef}
            className="blob drop absolute left-0 top-0 w-[36px] h-[36px] rounded-full bg-primary-600 dark:bg-primary-500 will-change-transform"
          />
          <div
            ref={thumbRef}
            className="blob thumb absolute left-0 top-0 w-[28px] h-[28px] rounded-full bg-primary-600 dark:bg-primary-500 will-change-transform"
          />
        </div>

        {/* Drop Value Label */}
        <div
          ref={dropLabelRef}
          aria-hidden="true"
          className="drop-label absolute left-0 top-0 w-[36px] h-[36px] grid place-items-center text-[12px] font-bold font-mono text-white pointer-events-none will-change-transform select-none"
        >
          {currentVal}
          {unit}
        </div>

        {/* Accessible Keyboard & Screen Reader Thumb */}
        <div
          ref={hitRef}
          role="slider"
          tabIndex={0}
          aria-label={ariaLabel || label || t('common.step')}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={currentVal}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            if (e.target.matches(':focus-visible')) {
              stateRef.current.lifted = true;
              syncTargets();
            }
          }}
          onBlur={() => {
            stateRef.current.lifted = false;
            syncTargets();
          }}
          className="hit absolute top-[4px] w-[24px] h-[24px] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
        />
      </div>

      {/* Scale: Marks & Numbers */}
      <div className="ticks mt-2 select-none" aria-hidden="true">
        <div ref={marksContainerRef} className="marks relative h-[8px]">
          {markElements}
        </div>

        <div
          ref={numsContainerRef}
          className="nums relative h-[14px] mt-1.5 text-[11px] font-medium text-text-muted font-mono leading-[14px]"
        >
          {checkpoints.map((cp, idx) => (
            <span
              key={idx}
              className="absolute top-0 -translate-x-1/2 transition-colors duration-200 [&.on]:text-primary-700 dark:[&.on]:text-primary-300 [&.on]:font-bold"
              style={{
                left: isRTL
                  ? `calc(12px + (100% - 24px) * ${1 - cp.p})`
                  : `calc(12px + (100% - 24px) * ${cp.p})`,
              }}
            >
              {cp.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default JellySlider;
