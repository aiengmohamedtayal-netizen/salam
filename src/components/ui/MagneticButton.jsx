import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * MagneticButton - Physics-driven Magnetic CTA Button
 * Rebuilt from DesignBookmark Motion Study (https://designbookmark.com/motion#db-magnetic-button)
 *
 * Springs:
 * - bx, by: stiffness 170, damping 13  (button displacement)
 * - lx, ly: stiffness 220, damping 15  (label parallax displacement)
 * - sc:     stiffness 400, damping 18  (scale: squash 0.94, release 1 with v=3 overshoot)
 * - co:     stiffness 200, damping 26  (ghost cursor dot opacity)
 */
export function MagneticButton({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'lg',
  radius = 130,
  showGhost = false,
  className,
  labelClassName,
  disabled = false,
  ...props
}) {
  const navigate = useNavigate();
  const fieldRef = useRef(null);
  const buttonRef = useRef(null);
  const labelRef = useRef(null);
  const ghostRef = useRef(null);

  // Springs state
  const springsRef = useRef({
    bx: { x: 0, v: 0, t: 0, k: 170, c: 13 },
    by: { x: 0, v: 0, t: 0, k: 170, c: 13 },
    lx: { x: 0, v: 0, t: 0, k: 220, c: 15 },
    ly: { x: 0, v: 0, t: 0, k: 220, c: 15 },
    sc: { x: 1, v: 0, t: 1, k: 400, c: 18 },
    co: { x: 0, v: 0, t: 0, k: 200, c: 26 },
  });

  const pointerPosRef = useRef({ px: null, py: null, lastTime: -1e9 });
  const clockRef = useRef(0);
  const ghostPosRef = useRef({ gx: 0, gy: 0 });

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    if (onClick) {
      onClick(e);
    }

    if (!e.defaultPrevented && to) {
      navigate(to);
    }
  };

  const handlePointerDown = () => {
    if (disabled) return;
    springsRef.current.sc.t = 0.94;
  };

  const handlePointerUp = () => {
    if (disabled) return;
    const s = springsRef.current.sc;
    s.t = 1;
    s.v = 3; // kick velocity for snappy overshoot
  };

  // Main animation and physics loop
  useEffect(() => {
    let animId;
    let lastTime = performance.now();
    const springs = springsRef.current;
    const pPos = pointerPosRef.current;

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

      const field = fieldRef.current;
      const btn = buttonRef.current;
      if (!field || !btn) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const rect = field.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      let gx = cx;
      let gy = cy;

      const isGhostActive =
        showGhost && (pPos.px === null || clock - pPos.lastTime > 2.5);

      if (isGhostActive) {
        // 7s loop: approach from left, orbit button, curve away to the right
        const t = clock % 7;
        if (t < 1.4) {
          gx = cx - 150 + (t / 1.4) * 110;
          gy = cy + 50 - (t / 1.4) * 40;
        } else if (t < 5) {
          const a = ((t - 1.4) / 3.6) * Math.PI * 2 + Math.PI;
          gx = cx + Math.cos(a) * 46;
          gy = cy + Math.sin(a) * 18 + 4;
        } else {
          const k = (t - 5) / 2;
          gx = cx - 46 + k * 230;
          gy = cy + 4 + k * 60;
        }
        springs.co.t = 0.65;
      } else {
        gx = pPos.px !== null ? pPos.px : cx;
        gy = pPos.py !== null ? pPos.py : cy;
        springs.co.t = 0;
      }

      ghostPosRef.current.gx = gx;
      ghostPosRef.current.gy = gy;

      const dx = gx - cx;
      const dy = gy - cy;
      const d = Math.hypot(dx, dy);

      // Magnetic pull calculation within radius R
      const pull = d < radius && (pPos.px !== null || isGhostActive)
        ? 1 - (d / radius) * 0.35
        : 0;

      springs.bx.t = dx * 0.32 * pull;
      springs.by.t = dy * 0.38 * pull;
      springs.lx.t = dx * 0.14 * pull;
      springs.ly.t = dy * 0.18 * pull;
      springs.sc.t = springs.sc.t < 1 ? springs.sc.t : 1 + 0.06 * pull;

      // 4 sub-steps per frame for ultra-smooth spring integration
      const sub = 4;
      for (let k = 0; k < sub; k++) {
        stepSpring(springs.bx, dt / sub);
        stepSpring(springs.by, dt / sub);
        stepSpring(springs.lx, dt / sub);
        stepSpring(springs.ly, dt / sub);
        stepSpring(springs.sc, dt / sub);
        stepSpring(springs.co, dt / sub);
      }

      // Render directly to style properties for peak 60/120fps performance
      if (btn) {
        btn.style.transform = `translate(${springs.bx.x.toFixed(2)}px, ${springs.by.x.toFixed(2)}px) scale(${springs.sc.x.toFixed(4)})`;
      }

      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${springs.lx.x.toFixed(2)}px, ${springs.ly.x.toFixed(2)}px)`;
      }

      if (ghostRef.current) {
        ghostRef.current.style.opacity = clamp(springs.co.x, 0, 1).toFixed(3);
        ghostRef.current.style.transform = `translate(${gx.toFixed(2)}px, ${gy.toFixed(2)}px)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [radius, showGhost]);

  // Pointer event listeners on outer field
  const handlePointerMove = (e) => {
    if (disabled || !fieldRef.current) return;
    const r = fieldRef.current.getBoundingClientRect();
    pointerPosRef.current.px = e.clientX - r.left;
    pointerPosRef.current.py = e.clientY - r.top;
    pointerPosRef.current.lastTime = clockRef.current;
  };

  const handlePointerLeave = () => {
    pointerPosRef.current.px = null;
    pointerPosRef.current.py = null;
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white shadow-lg shadow-primary-700/25 hover:shadow-xl hover:shadow-primary-700/35 border border-primary-500/30',
    secondary:
      'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200 shadow-sm dark:bg-primary-950/60 dark:text-primary-300 dark:border-primary-800',
    outline:
      'border-2 border-primary-600 text-primary-700 hover:bg-primary-50/50 dark:text-primary-300 dark:border-primary-500',
  };

  const sizeStyles = {
    sm: 'h-10 px-5 text-sm',
    md: 'h-12 px-7 text-base',
    lg: 'h-14 px-9 text-lg',
  };

  return (
    <div
      ref={fieldRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative inline-flex items-center justify-center p-3 select-none touch-none"
      style={{ overflow: 'visible' }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        disabled={disabled}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full font-cairo font-bold cursor-pointer',
          'transition-[box-shadow,background-color] duration-200 outline-none',
          'focus-visible:ring-4 focus-visible:ring-primary-400/40 focus-visible:outline-none',
          'will-change-transform',
          variantStyles[variant] || variantStyles.primary,
          sizeStyles[size] || sizeStyles.lg,
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {/* Parallax Label with deeper travel */}
        <span
          ref={labelRef}
          className={cn(
            'inline-flex items-center justify-center gap-2.5 whitespace-nowrap will-change-transform pointer-events-none',
            labelClassName
          )}
        >
          {children}
        </span>
      </button>

      {/* Ghost Demo Cursor Dot */}
      {showGhost && (
        <span
          ref={ghostRef}
          aria-hidden="true"
          className="absolute left-0 top-0 w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full bg-primary-500 shadow-[0_0_12px_rgba(161,105,207,0.85)] pointer-events-none opacity-0 will-change-transform z-10"
        />
      )}
    </div>
  );
}
