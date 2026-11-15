import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DesignBookmark Motion - Pull Cord component.
 * Features exact spring physics and rope simulation from tokens.css:
 * - TH:  stiffness 46,  damping 3  (lamp swing angle)
 * - TUG: stiffness 300, damping 13 (vertical stretch of lamp wire)
 * - R:   stiffness 120, damping 21 (light flood radius, 170/27 on close)
 * - BP:  stiffness 420, damping 13 (bulb pop scale)
 * - K:   stiffness 300, damping 17 (cord stretch relaxation)
 * - HX/HY: stiffness 210, damping 22 (idle hand gentle pull)
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

// Crisp mechanical click sound synthesizing switch toggle
function playClickSound(toOn) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(toOn ? 1150 : 850, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.038);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.038);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // Audio may be blocked before first user gesture
  }
}

export function PullCord({ className = '' }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { language } = useTranslation();
  const isAr = language !== 'en';

  const containerRef = useRef(null);
  const lampRef = useRef(null);
  const wireRef = useRef(null);
  const headRef = useRef(null);
  const bulbRef = useRef(null);
  const cordPathRef = useRef(null);
  const beadRef = useRef(null);
  const grabRef = useRef(null);
  const lightFloodRef = useRef(null);

  const [hintVisible, setHintVisible] = useState(false);

  // Synchronize internal on state with project theme
  // When theme is 'light', the lamp is ON; when 'dark', lamp is OFF
  const isLit = !isDark;
  const isLitRef = useRef(isLit);
  const toggleThemeRef = useRef(toggleTheme);
  const wakeRef = useRef(null);

  useEffect(() => {
    isLitRef.current = isLit;
    wakeRef.current?.();
  }, [isLit]);

  useEffect(() => {
    toggleThemeRef.current = toggleTheme;
  }, [toggleTheme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Component Dimensions
    const WIRE = 104;
    const SHADE = 62;
    const AX = 32;
    const AY = SHADE - 4;
    const N = 12;
    const SEG = 8.5;
    const L = N * SEG; // 102px
    const CLICK = 20;
    const MAXS = 48;

    // Physics Springs
    const TH = createSpring(0, 46, 3);
    const TUG = createSpring(0, 300, 13);
    const R = createSpring(isLitRef.current ? 1 : 0, 120, 21);
    const BP = createSpring(1, 420, 13);
    const HX = createSpring(0, 210, 22);
    const HY = createSpring(0, 210, 22);
    const K = createSpring(1, 300, 17);

    tuneSpring(TH, 46, 3, reduce);
    tuneSpring(TUG, 300, 13, reduce);
    tuneSpring(R, 120, 21, reduce);
    tuneSpring(BP, 420, 13, reduce);
    tuneSpring(HX, 210, 22, reduce);
    tuneSpring(HY, 210, 22, reduce);
    tuneSpring(K, 300, 17, reduce);

    let on = isLitRef.current;
    let armed = true;
    let held = null;
    let ghost = false;
    let clock = 0;
    let userUntil = clock + 5; // wait a bit before auto hints
    let side = 1;
    let W = container.clientWidth || 150;
    let H = container.clientHeight || 280;

    const pts = [];

    const anchor = () => {
      const c = Math.cos(TH.x);
      const s = Math.sin(TH.x);
      const y = WIRE + TUG.x + AY;
      return [W / 2 + AX * c - y * s, AX * s + y * c];
    };

    const bulbAt = () => {
      const c = Math.cos(TH.x);
      const s = Math.sin(TH.x);
      const y = WIRE + TUG.x + 58;
      return [W / 2 - y * s, y * c];
    };

    function initPoints() {
      pts.length = 0;
      const [ax, ay] = anchor();
      for (let i = 0; i <= N; i++) {
        pts.push({ x: ax, y: ay + i * SEG, vx: 0, vy: 0 });
      }
    }

    initPoints();

    let rafId = 0;
    let lastTime = performance.now();
    let isRunning = false;

    function wake() {
      if (!isRunning) {
        isRunning = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    }
    wakeRef.current = wake;

    function flip(to = !on) {
      if (to === on) return;
      on = to;
      isLitRef.current = on;
      BP.x = on ? 1.35 : 0.82;
      TUG.v += 140;

      playClickSound(on);

      // Trigger AMAL theme toggle
      if (typeof toggleThemeRef.current === 'function') {
        toggleThemeRef.current();
      }
      wake();
    }

    const pin = () => (held ? [held.x, held.y] : ghost ? [HX.x, HY.y] : null);

    function pull() {
      if (ghost || held) return;
      const b = pts[N];
      if (!b) return;
      ghost = true;
      armed = true;
      side = -side;
      HX.x = b.x;
      HY.x = b.y;
      HX.v = b.vx;
      HY.v = b.vy;
      const [ax, ay] = anchor();
      HX.t = ax + side * 22;
      HY.t = ay + L + 56;
      wake();

      setTimeout(() => {
        ghost = false;
        wake();
      }, 950);
    }

    const grab = grabRef.current;
    if (!grab) return;

    const getLocalPos = (e) => {
      const r = container.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };

    const onPointerDown = (e) => {
      const [x, y] = getLocalPos(e);
      const b = pts[N] || { x: W / 2 + AX, y: WIRE + AY + L };
      held = {
        id: e.pointerId,
        x: b.x,
        y: b.y,
        ox: b.x - x,
        oy: b.y - y,
        moved: 0,
        sx: x,
        sy: y,
        flipped: false,
      };
      ghost = false;
      armed = true;
      userUntil = clock + 8;
      try {
        grab.setPointerCapture(e.pointerId);
      } catch {}
      grab.classList.add('is-held');
      wake();
    };

    const onPointerMove = (e) => {
      if (!held || e.pointerId !== held.id) return;
      const [x, y] = getLocalPos(e);
      held.x = x + held.ox;
      held.y = y + held.oy;
      held.moved = Math.max(held.moved, Math.hypot(x - held.sx, y - held.sy));
      userUntil = clock + 8;
      wake();
    };

    const onPointerUp = (e) => {
      if (!held || e.pointerId !== held.id) return;
      const tap = held.moved < 6 && !held.flipped && e.type === 'pointerup';
      held = null;
      grab.classList.remove('is-held');
      if (tap) {
        pull();
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        userUntil = clock + 8;
        pull();
      }
    };

    const onClick = () => {
      userUntil = clock + 8;
      pull();
    };

    grab.addEventListener('pointerdown', onPointerDown);
    grab.addEventListener('click', onClick);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    grab.addEventListener('keydown', onKeyDown);

    function loop(now) {
      const dt = Math.max(0.001, Math.min((now - lastTime) / 1000, 1 / 30));
      lastTime = now;
      clock += dt;

      // Sync if theme changed externally (e.g. from navbar or system)
      if (on !== isLitRef.current) {
        on = isLitRef.current;
        BP.x = on ? 1.25 : 0.85;
      }

      // Dimensions W & H are kept updated by ResizeObserver outside the loop

      // DesignBookmark sub-stepping (4 sub-steps per frame for physics stability)
      const sub = 4;
      const sdt = dt / sub;

      for (let sIdx = 0; sIdx < sub; sIdx++) {
        // Physics step
        [TH, TUG, R, BP, HX, HY, K].forEach((s) => stepSpring(s, sdt));

        const [ax, ay] = anchor();
        const p = pin();
        const b = pts[N];

        let stretch = 0;
        let lean = 0;

        if (p && b) {
          const dx = p[0] - ax;
          const dy = p[1] - ay;
          const d = Math.hypot(dx, dy) || 1;
          const over = Math.max(0, d - L);
          const give = MAXS * (1 - Math.exp(-over / 65));
          const r = Math.min(d, L) + give;
          const px = ax + (dx / d) * r;
          const py = ay + (dy / d) * r;

          stretch = give;
          lean = over > 0 ? dx / d : 0;

          if (over > 0) {
            K.x = K.t = r / L;
            K.v = 0;
          }

          if (armed && give > CLICK) {
            armed = false;
            flip();
            if (held) {
              held.flipped = true;
            } else {
              setTimeout(() => {
                ghost = false;
              }, 120);
            }
          }

          b.x = px;
          b.y = py;
        }

        // Re-arm when cord relaxes back so subsequent pulls always register
        if (stretch < 5 && !held && !ghost) {
          armed = true;
        }

        if (!p || !stretch) {
          K.t = 1;
        }

        const seg = SEG * Math.max(1, K.x);
        TUG.t = stretch * 0.22;
        TH.t = clamp((-lean * stretch) / MAXS * 0.45, -0.28, 0.28);

        // Rope physics
        const prev = pts.map((q) => [q.x, q.y]);
        for (let i = 1; i <= N; i++) {
          const q = pts[i];
          if (!q) continue;
          const k = Math.exp(-(i === N ? 1.1 : 2.4) * sdt);
          q.vy += 2600 * sdt;
          q.vx *= k;
          q.vy *= k;
          const sp = Math.hypot(q.vx, q.vy);
          if (sp > 2600) {
            q.vx *= 2600 / sp;
            q.vy *= 2600 / sp;
          }
          q.x += q.vx * sdt;
          q.y += q.vy * sdt;
        }

        for (let it = 0; it < 8; it++) {
          if (!pts[0]) break;
          pts[0].x = ax;
          pts[0].y = ay;
          for (let i = 0; i < N; i++) {
            const a = pts[i];
            const c = pts[i + 1];
            if (!a || !c) continue;
            const dx = c.x - a.x;
            const dy = c.y - a.y;
            const d = Math.hypot(dx, dy) || 1e-6;
            const f = ((d - seg) / d) * 0.5;
            const wa = i === 0 ? 0 : 1;
            const wc = i + 1 === N ? (p ? 0 : 0.3) : 1;
            const sum = wa + wc || 1;
            a.x += (dx * f * wa) / sum * 2;
            a.y += (dy * f * wa) / sum * 2;
            c.x -= (dx * f * wc) / sum * 2;
            c.y -= (dy * f * wc) / sum * 2;
          }
        }

        pts[0].x = ax;
        pts[0].y = ay;

        for (let i = 1; i <= N; i++) {
          if (!pts[i] || !prev[i]) continue;
          pts[i].vx = (pts[i].x - prev[i][0]) / sdt;
          pts[i].vy = (pts[i].y - prev[i][1]) / sdt;
        }
      }

      // Auto-recover from any unexpected NaN values
      if (isNaN(pts[N]?.x) || isNaN(pts[N]?.y)) {
        initPoints();
      }

      R.t = on ? 1 : 0;
      tuneSpring(R, on ? 120 : 170, on ? 21 : 27, reduce);

      // Render transforms
      const [ax, ay] = anchor();
      const th = TH.x;
      const tug = TUG.x;
      const lastPt = pts[N] || { x: ax, y: ay + L };
      const secondLast = pts[N - 1] || { x: ax, y: ay + L - SEG };

      let dStr = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < N; i++) {
        dStr += ` Q${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${((pts[i].x + pts[i + 1].x) / 2).toFixed(1)} ${((pts[i].y + pts[i + 1].y) / 2).toFixed(1)}`;
      }
      dStr += ` L${lastPt.x.toFixed(1)} ${lastPt.y.toFixed(1)}`;

      const ang = Math.atan2(secondLast.x - lastPt.x, lastPt.y - secondLast.y);
      const wl = WIRE + tug - 4;
      const wd = `M${(W / 2).toFixed(1)} -4 L${(W / 2 - Math.sin(th) * wl).toFixed(2)} ${(Math.cos(th) * wl).toFixed(2)}`;

      if (lampRef.current) {
        lampRef.current.style.transform = `rotate(${th.toFixed(4)}rad)`;
      }
      if (wireRef.current) {
        wireRef.current.setAttribute('d', wd);
      }
      if (headRef.current) {
        headRef.current.style.transform = `translateY(${(WIRE + tug).toFixed(2)}px)`;
      }
      if (bulbRef.current) {
        bulbRef.current.style.transform = `scale(${BP.x.toFixed(4)})`;
      }
      if (cordPathRef.current) {
        cordPathRef.current.setAttribute('d', dStr);
      }
      if (beadRef.current) {
        beadRef.current.style.transform = `translate(${lastPt.x.toFixed(2)}px, ${lastPt.y.toFixed(2)}px) rotate(${ang.toFixed(4)}rad)`;
      }
      if (grabRef.current) {
        grabRef.current.style.transform = `translate(${lastPt.x.toFixed(2)}px, ${lastPt.y.toFixed(2)}px)`;
      }

      if (lightFloodRef.current) {
        const [bx, by] = bulbAt();
        const glowOpacity = clamp(R.x, 0, 1);
        lightFloodRef.current.style.opacity = glowOpacity.toFixed(3);
        lightFloodRef.current.style.transform = `translate(${bx}px, ${by}px)`;
      }

      // Performance Optimization (fixing-motion-performance): Stop rAF when physics settle
      const springsAtRest = [TH, TUG, R, BP, HX, HY, K].every(
        (s) => Math.abs(s.v) < 0.003 && Math.abs(s.x - s.t) < 0.003
      );
      const ropeAtRest = pts.every((q) => Math.hypot(q.vx, q.vy) < 0.25);

      if (!held && !ghost && springsAtRest && ropeAtRest) {
        isRunning = false;
        return;
      }

      rafId = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        if (cr.width && cr.height) {
          W = cr.width;
          H = cr.height;
          wake();
        }
      }
    });
    ro.observe(container);

    wake();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
      grab.removeEventListener('pointerdown', onPointerDown);
      grab.removeEventListener('click', onClick);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      grab.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-36 h-[270px] select-none pointer-events-none overflow-visible',
        className
      )}
      onMouseEnter={() => setHintVisible(true)}
      onMouseLeave={() => setHintVisible(false)}
    >
      {/* Light Flood / Radial ambient glow when lit */}
      <div
        ref={lightFloodRef}
        className="absolute pointer-events-none rounded-full w-96 h-96 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 blur-2xl bg-radial from-amber-400/25 via-amber-300/10 to-transparent dark:from-primary-400/20 dark:via-primary-500/5"
        style={{ opacity: isLit ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* Ceiling anchor wire */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
        <path
          ref={wireRef}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-stone-400 dark:text-stone-500/70"
        />
      </svg>

      {/* Lamp Head & Bulb */}
      <div
        ref={lampRef}
        className="absolute left-1/2 top-0 w-0 h-0 origin-top will-change-transform z-20 pointer-events-none"
      >
        <div ref={headRef} className="absolute left-0 top-0 will-change-transform">
          {/* Bulb */}
          <div
            ref={bulbRef}
            className={cn(
              'absolute -left-[18px] top-[40px] w-9 h-9 rounded-full will-change-transform transition-all duration-300 shadow-md',
              isLit
                ? 'bg-amber-300 dark:bg-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.85)] ring-4 ring-amber-400/30'
                : 'bg-stone-300/60 dark:bg-stone-700/60 border border-white/10'
            )}
          />

          {/* Lampshade: Styled with AMAL signature colors */}
          <div
            className="absolute -left-[56px] top-0 w-[112px] h-[58px] shadow-lg border transition-colors duration-300"
            style={{
              borderRadius: '56px 56px 12px 12px / 52px 52px 12px 12px',
              backgroundColor: isLit ? '#fdfaff' : '#261b33',
              borderColor: isLit ? '#e8ddf1' : '#4d3766',
            }}
          >
            {/* Subtle inner ambient shading on shade */}
            <div
              className="absolute inset-0 rounded-[inherit] opacity-20 pointer-events-none bg-gradient-to-b from-white/20 via-transparent to-black/30"
              aria-hidden="true"
            />
          </div>

          {/* Top Brass Cap */}
          <div className="absolute -left-[8px] -top-[9px] w-4 h-3 rounded-t-[5px] bg-stone-400 dark:bg-stone-600 border-t border-white/20" />
        </div>
      </div>

      {/* The Hanging Pull Cord (Rope Path) */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
        <path
          ref={cordPathRef}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-stone-400 dark:text-stone-500"
        />
      </svg>

      {/* Cord Bead (Pill at the end) */}
      <div
        ref={beadRef}
        className={cn(
          'absolute -left-[7px] -top-[3px] w-3.5 h-6 rounded-full will-change-transform pointer-events-none z-20 shadow-md border transition-colors',
          isLit
            ? 'bg-primary-600 border-primary-500 text-white shadow-primary-700/20'
            : 'bg-primary-400 border-primary-300 text-stone-900 shadow-black/40'
        )}
      >
        {/* Subtle center ring on bead */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/30" />
      </div>

      {/* Real Interactive Control (Grab Touch Target) */}
      <button
        ref={grabRef}
        type="button"
        role="switch"
        aria-checked={isLit}
        aria-label={
          isAr
            ? 'مفتاح الإضاءة: اسحب الحبل للتبديل بين الوضع الداكن والفاتح'
            : 'Light switch: pull cord to toggle between dark and light mode'
        }
        title={
          isAr
            ? 'اسحب لتغيير المظهر (فاتح / داكن)'
            : 'Pull cord to toggle theme'
        }
        className="absolute -left-[20px] -top-[14px] w-10 h-12 rounded-xl bg-transparent cursor-grab active:cursor-grabbing pointer-events-auto z-30 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2 touch-none"
        onFocus={() => setHintVisible(true)}
        onBlur={() => setHintVisible(false)}
      />

      {/* Elegant Real Product Floating Hint */}
      <div
        className={cn(
          'absolute start-1/2 -translate-x-1/2 bottom-1 whitespace-nowrap text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-xs pointer-events-none transition-all duration-300 flex items-center gap-1',
          hintVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-1',
          isLit
            ? 'bg-surface-card/90 text-text-secondary border-surface-border'
            : 'bg-primary-950/90 text-primary-200 border-primary-800/60'
        )}
        aria-hidden="true"
      >
        <Sparkles className="w-3 h-3 text-amber-500 dark:text-primary-300 shrink-0" />
        <span>{isAr ? 'اسحب الخيط' : 'Pull cord'}</span>
      </div>
    </div>
  );
}

export default PullCord;
