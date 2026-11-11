import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { RotateCcw, Trash2 } from 'lucide-react';

// The pen tip trails the pointer on a spring, which irons out the jitter of
// a hand on a trackpad and gives strokes the swing of real ink.
const STEP = 1 / 240;
const TIP_STIFFNESS = 2600;
const TIP_DAMPING = 78;
const MAX_WIDTH = 3.6;
const MIN_WIDTH = 1.1;
const SPEED_FOR_MIN = 1800;
const WIDTH_EASE = 0.08;
const MIN_GAP = 0.6;
const TAPER = 7;
const CLEAR_MS = 420;
const DEFAULT_INK = '#1e3a8a'; // Ballpoint blue

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Width at point i of a stroke, thinned at both ends. */
function taperedWidth(stroke, i, open) {
  const n = stroke.length;
  const start = Math.min(1, (i + 1) / TAPER);
  const end = open ? 1 : Math.min(1, (n - i) / TAPER);
  return stroke[i].w * (0.35 + 0.65 * Math.min(start, end));
}

/** Adds a quad to the path, wound the same way as `arc`, so one fill unions them. */
function quad(ctx, pts) {
  let area = 0;
  for (let k = 0; k < 8; k += 2) {
    const j = (k + 2) % 8;
    area += pts[k] * pts[j + 1] - pts[j] * pts[k + 1];
  }
  const order = area >= 0 ? [0, 2, 4, 6] : [6, 4, 2, 0];
  ctx.moveTo(pts[order[0]], pts[order[0] + 1]);
  for (let k = 1; k < 4; k++) {
    ctx.lineTo(pts[order[k]], pts[order[k] + 1]);
  }
  ctx.closePath();
}

/**
 * Draws points [from, to) of a stroke as rounded segments, filled as one
 * shape so the joins don't show seams.
 */
function paint(ctx, stroke, from, to, open) {
  ctx.beginPath();
  for (let i = Math.max(from, 0); i < to; i++) {
    const p = stroke[i];
    const w =
      stroke.length === 1 && !open ? p.w * 0.8 : taperedWidth(stroke, i, open);
    if (i > 0) {
      const q = stroke[i - 1];
      const qw = taperedWidth(stroke, i - 1, open);
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      quad(ctx, [
        q.x + (nx * qw) / 2,
        q.y + (ny * qw) / 2,
        p.x + (nx * w) / 2,
        p.y + (ny * w) / 2,
        p.x - (nx * w) / 2,
        p.y - (ny * w) / 2,
        q.x - (nx * qw) / 2,
        q.y - (ny * qw) / 2,
      ]);
    }
    ctx.moveTo(p.x + w / 2, p.y);
    ctx.arc(p.x, p.y, w / 2, 0, Math.PI * 2);
  }
  ctx.fill();
}

/** The signature as standalone SVG, one filled outline per stroke. */
function toSvg(strokes, width, height, ink = DEFAULT_INK) {
  const paths = strokes
    .map((stroke) => {
      if (stroke.length === 1) {
        const [p] = stroke;
        return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(p.w * 0.4).toFixed(2)}"/>`;
      }
      const left = [];
      const right = [];
      for (let i = 0; i < stroke.length; i++) {
        const p = stroke[i];
        const q = stroke[Math.max(i - 1, 0)];
        const r = stroke[Math.min(i + 1, stroke.length - 1)];
        const dx = r.x - q.x;
        const dy = r.y - q.y;
        const len = Math.hypot(dx, dy) || 1;
        const w = taperedWidth(stroke, i, false) / 2;
        left.push(
          `${(p.x - (dy / len) * w).toFixed(1)} ${(p.y + (dx / len) * w).toFixed(1)}`
        );
        right.push(
          `${(p.x + (dy / len) * w).toFixed(1)} ${(p.y - (dx / len) * w).toFixed(1)}`
        );
      }
      return `<path d="M${left.join('L')}L${right.reverse().join('L')}Z"/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(width)} ${Math.round(height)}" fill="${ink}">${paths}</svg>`;
}

export function SignaturePad({
  onChange,
  label,
  placeholderText,
  strokeColor = DEFAULT_INK,
  height = 200,
  className,
}) {
  const { language } = useTranslation();
  const isAr = language !== 'en';

  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [count, setCount] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const sim = useRef({
    strokes: [],
    painted: 0,
    held: false,
    pressure: 0.5,
    usesPressure: false,
    targetX: 0,
    targetY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    width: MAX_WIDTH,
    raf: 0,
    last: 0,
    carry: 0,
    reduceMotion: false,
    clearing: false,
    size: { width: 0, height: 0 },
  });

  const latest = useRef({ onChange });
  latest.current = { onChange };

  const context = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = strokeColor;
    }
    return ctx ?? null;
  }, [strokeColor]);

  /** Repaints every stroke, or only the first fraction of all the ink. */
  const redraw = useCallback(
    (fraction = 1) => {
      const ctx = context();
      const s = sim.current;
      if (!ctx) return;
      ctx.clearRect(0, 0, s.size.width, s.size.height);
      const total = s.strokes.reduce((sum, st) => sum + st.length, 0);
      let budget = Math.round(total * fraction);
      for (let k = 0; k < s.strokes.length && budget > 0; k++) {
        const stroke = s.strokes[k];
        const open = s.held && k === s.strokes.length - 1;
        paint(ctx, stroke, 0, Math.min(stroke.length, budget), open);
        budget -= stroke.length;
      }
    },
    [context]
  );

  const emit = useCallback(() => {
    const s = sim.current;
    setCount(s.strokes.length);
    latest.current.onChange?.(
      s.strokes.length
        ? toSvg(s.strokes, s.size.width, s.size.height, strokeColor)
        : null
    );
  }, [strokeColor]);

  // Size canvas to pixel density
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!(wrap && canvas)) return;

    const s = sim.current;
    const fitCanvas = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      s.size = { width: rect.width, height: rect.height };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      redraw();
    };

    fitCanvas();
    const observer = new ResizeObserver(fitCanvas);
    observer.observe(wrap);

    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    s.reduceMotion = query.matches;
    const onMotion = () => {
      s.reduceMotion = query.matches;
    };
    query.addEventListener('change', onMotion);

    return () => {
      observer.disconnect();
      query.removeEventListener('change', onMotion);
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    };
  }, [redraw]);

  // Spring simulation step
  const stepPen = useCallback(() => {
    const s = sim.current;
    const ax = (s.targetX - s.x) * TIP_STIFFNESS - s.vx * TIP_DAMPING;
    const ay = (s.targetY - s.y) * TIP_STIFFNESS - s.vy * TIP_DAMPING;
    s.vx += ax * STEP;
    s.vy += ay * STEP;
    s.x += s.vx * STEP;
    s.y += s.vy * STEP;
    const speed = Math.hypot(s.vx, s.vy);
    const pressure = s.usesPressure ? 0.45 + s.pressure * 0.9 : 1;
    const goal =
      (MAX_WIDTH -
        (MAX_WIDTH - MIN_WIDTH) * clamp(speed / SPEED_FOR_MIN, 0, 1)) *
      pressure;
    s.width += (goal - s.width) * WIDTH_EASE;
    const stroke = s.strokes.at(-1);
    const prev = stroke?.at(-1);
    if (stroke && prev && Math.hypot(s.x - prev.x, s.y - prev.y) >= MIN_GAP) {
      stroke.push({ x: s.x, y: s.y, w: s.width });
    }
    return speed;
  }, []);

  const stopSettling = useCallback(() => {
    const s = sim.current;
    if (!s.raf) return false;
    cancelAnimationFrame(s.raf);
    s.raf = 0;
    s.last = 0;
    s.carry = 0;
    return true;
  }, []);

  const tick = useCallback(
    (now) => {
      const s = sim.current;
      s.raf = 0;
      const elapsed = s.last ? Math.min((now - s.last) / 1000, 0.05) : STEP;
      s.last = now;
      s.carry += elapsed;
      let speed = 0;
      while (s.carry >= STEP) {
        speed = stepPen();
        s.carry -= STEP;
      }
      const ctx = context();
      const stroke = s.strokes.at(-1);
      if (ctx && stroke) {
        paint(ctx, stroke, s.painted - 1, stroke.length, true);
        s.painted = stroke.length;
      }
      const caughtUp =
        Math.hypot(s.targetX - s.x, s.targetY - s.y) < 0.3 && speed < 5;
      if (s.held || !caughtUp) {
        s.raf = requestAnimationFrame(tick);
        return;
      }
      s.last = 0;
      redraw();
      emit();
    },
    [context, emit, redraw, stepPen]
  );

  const localPoint = (event) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    return rect
      ? { x: event.clientX - rect.left, y: event.clientY - rect.top }
      : { x: 0, y: 0 };
  };

  const handlePointerDown = (event) => {
    const s = sim.current;
    if (clearing || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    if (stopSettling()) {
      emit();
    }

    const p = localPoint(event);
    s.held = true;
    s.usesPressure = event.pointerType === 'pen';
    s.pressure = event.pressure || 0.5;
    s.x = p.x;
    s.y = p.y;
    s.targetX = p.x;
    s.targetY = p.y;
    s.vx = 0;
    s.vy = 0;
    s.width = MAX_WIDTH;
    s.strokes.push([{ x: p.x, y: p.y, w: MAX_WIDTH }]);
    s.painted = 0;
    redraw();
    setDrawing(true);
    s.raf = requestAnimationFrame(tick);
  };

  const handlePointerMove = (event) => {
    const s = sim.current;
    if (!s.held) return;
    const p = localPoint(event);
    s.targetX = p.x;
    s.targetY = p.y;
    if (s.usesPressure) {
      s.pressure = event.pressure;
    }
    if (s.reduceMotion) {
      s.x = p.x;
      s.y = p.y;
      s.vx = 0;
      s.vy = 0;
    }
  };

  const handlePointerUp = () => {
    const s = sim.current;
    if (!s.held) return;
    s.held = false;
    setDrawing(false);
    if (!s.raf) {
      s.raf = requestAnimationFrame(tick);
    }
  };

  const undo = useCallback(() => {
    const s = sim.current;
    if (s.held || s.clearing || !s.strokes.length) return;
    stopSettling();
    s.strokes.pop();
    redraw();
    emit();
  }, [emit, redraw, stopSettling]);

  // Reverse cubic ease-in-out clearing animation
  const clear = useCallback(() => {
    const s = sim.current;
    if (s.held || s.clearing || !s.strokes.length) return;
    stopSettling();

    const done = () => {
      s.strokes = [];
      s.clearing = false;
      redraw();
      setClearing(false);
      emit();
    };

    if (s.reduceMotion) {
      done();
      return;
    }

    s.clearing = true;
    setClearing(true);
    const start = performance.now();
    const frame = (now) => {
      const t = clamp((now - start) / CLEAR_MS, 0, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      redraw(1 - eased);
      if (t < 1) {
        s.raf = requestAnimationFrame(frame);
      } else {
        s.raf = 0;
        done();
      }
    };
    s.raf = requestAnimationFrame(frame);
  }, [emit, redraw, stopSettling]);

  const handleKeyDown = (event) => {
    if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      undo();
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      clear();
    }
  };

  const empty = count === 0 && !drawing;

  return (
    <div
      className={cn(
        'w-full max-w-[440px] select-none overflow-hidden rounded-2xl border border-surface-border bg-surface-card text-text-primary shadow-sm',
        'focus-within:border-primary-400 focus-within:shadow-[0_0_0_3px_rgba(161,105,207,0.16)]',
        'dark:border-slate-800 dark:bg-slate-900',
        className
      )}
      onKeyDown={handleKeyDown}
    >
      <div className="relative" style={{ height: `${height}px` }} ref={wrapRef}>
        {/* Baseline signing watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 bottom-10 flex items-end gap-2 border-b border-surface-border pb-1.5 dark:border-slate-800"
        >
          <span className="text-xl text-text-muted leading-none font-sans select-none">
            ×
          </span>
          <span
            className={cn(
              'text-xs sm:text-sm font-medium text-text-muted transition-[opacity,filter] duration-200 ease-out select-none',
              empty ? 'opacity-100 blur-0' : 'opacity-0 blur-[2px]'
            )}
          >
            {placeholderText || (isAr ? 'وقّع هنا بخط يدك...' : 'Sign here with mouse or touch')}
          </span>
        </div>

        {/* Canvas */}
        <canvas
          aria-label={label || (isAr ? `لوحة التوقيع، ${count ? `${count} خطوة` : 'فارغة'}` : `Signature pad, ${count ? `${count} strokes` : 'empty'}`)}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none outline-none dark:hue-rotate-180 dark:invert"
          onLostPointerCapture={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          ref={canvasRef}
          role="img"
          tabIndex={0}
        />
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-surface-border px-4 py-2.5 bg-surface-muted/50 dark:border-slate-800 dark:bg-slate-900/60">
        <p aria-live="polite" className="truncate text-xs font-medium text-text-secondary">
          {count
            ? (isAr ? 'تم التوقيع ✓' : 'Signed ✓')
            : (isAr ? 'ارسم توقيعك في المساحة المخصصة' : 'Draw your signature above')}
        </p>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={undo}
            disabled={!count || clearing}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-text-secondary hover:bg-surface-card hover:text-text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title={isAr ? 'تراجع (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
          >
            <RotateCcw className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{isAr ? 'تراجع' : 'Undo'}</span>
          </button>

          <button
            type="button"
            onClick={clear}
            disabled={!count || clearing}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title={isAr ? 'مسح التوقيع (Delete)' : 'Clear (Delete)'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'مسح' : 'Clear'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignaturePad;
