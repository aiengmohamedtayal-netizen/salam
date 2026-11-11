import { RotateCcw } from 'lucide-react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

/**
 * MarkerText & Mark Components
 * Rebuilt from Kokonut UI & DesignBookmark Motion Studies (MIT)
 * https://kokonutui.com
 * https://designbookmark.com/motion
 *
 * Enhanced with:
 * - AMAL theme colors (Orchid, Violet, Coral, Teal)
 * - Automatic RTL (Arabic right-to-left) & LTR pen stroke direction detection
 * - Subpixel-accurate client rect measurement across font swaps and window resizes
 */

const DEFAULT_COLOR = {
  highlight: '#c084fc', // AMAL Soft Orchid
  underline: '#7c3aed', // AMAL Deep Violet
  circle: '#0d9488',    // AMAL Teal
  box: '#8b5cf6',       // AMAL Purple
  strike: '#f43f5e',    // AMAL Rose
};

// Pen velocity in px per ms
const PEN_SPEED = 0.9;
const HIGHLIGHT_SPEED = 1.15;
const MIN_MS = 260;
const MAX_MS = 820;
const LINE_GAP = 60;
const PEN_EASE = 'cubic-bezier(0.45, 0.05, 0.25, 1)';
const MASK_SPAN = 20000;

function random(seed) {
  let n = seed;
  return () => {
    n += 1;
    const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
}

function hash(text) {
  let h = 7;
  for (const char of text) {
    h = (h * 31 + (char.codePointAt(0) ?? 0)) % 1000003;
  }
  return h;
}

const r1 = (n) => Math.round(n * 10) / 10;

function polyline(points) {
  return points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${r1(x)} ${r1(y)}`)
    .join('');
}

function lengthOf(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(
      points[i][0] - points[i - 1][0],
      points[i][1] - points[i - 1][1]
    );
  }
  return total;
}

function outline(points, widths) {
  const left = [];
  const right = [];
  const last = points.length - 1;
  for (let i = 0; i <= last; i++) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(last, i + 1)];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const half = widths[i] / 2;
    const nx = (-dy / len) * half;
    const ny = (dx / len) * half;
    left.push([points[i][0] + nx, points[i][1] + ny]);
    right.push([points[i][0] - nx, points[i][1] - ny]);
  }
  const endCap = r1(widths[last] / 2);
  const startCap = r1(widths[0] / 2);
  const back = right.reverse();
  return `${polyline(left)}A${endCap} ${endCap} 0 0 0 ${r1(back[0][0])} ${r1(
    back[0][1]
  )}${polyline(back).replace('M', 'L')}A${startCap} ${startCap} 0 0 0 ${r1(
    left[0][0]
  )} ${r1(left[0][1])}Z`;
}

function pressure(t, base) {
  const land = Math.min(1, t / 0.1);
  const lift = Math.min(1, (1 - t) / 0.18);
  return (
    base * (0.45 + 0.55 * Math.sin((land * Math.PI) / 2)) * (0.55 + 0.45 * lift)
  );
}

function wobble(rand, amp) {
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const f1 = 1 + rand() * 1.5;
  const f2 = 3 + rand() * 3;
  return (t) =>
    amp *
    (0.7 * Math.sin(t * f1 * Math.PI + p1) +
      0.3 * Math.sin(t * f2 * Math.PI + p2));
}

function sample(count, at) {
  const points = [];
  for (let i = 0; i <= count; i++) {
    points.push(at(i / count));
  }
  return points;
}

function penStroke(points, width, key, color) {
  const widths = points.map((_, i) => pressure(i / (points.length - 1), width));
  return {
    key,
    shape: outline(points, widths),
    pen: polyline(points),
    penWidth: width * 4,
    length: lengthOf(points),
    color,
    under: false,
    alpha: 1,
  };
}

function strokesFor(entry, lines, seed, index) {
  const rand = random(seed);
  const color = entry.color ?? DEFAULT_COLOR[entry.type];
  const lineHeight = lines[0].bottom - lines[0].top;
  const width =
    entry.strokeWidth ?? Math.min(4.5, Math.max(1.6, lineHeight * 0.085));

  // Detect RTL reading direction
  const isRtl =
    entry.el.closest('[dir="rtl"]') ||
    document.documentElement.dir === 'rtl' ||
    document.body.dir === 'rtl';

  if (entry.type === 'highlight') {
    return lines.map((line, i) => {
      const h = line.bottom - line.top;
      const top = wobble(rand, 0.9);
      const bottom = wobble(rand, 0.9);
      const chisel = h * 0.2;
      const tilt = (rand() - 0.5) * Math.min(3, h * 0.08);
      const x0 = line.left - 4 - rand() * 2;
      const x1 = line.right + 4 + rand() * 3;
      const y0 = line.top + h * 0.08;
      const y1 = line.bottom - h * 0.02;
      const steps = Math.max(6, Math.round((x1 - x0) / 14));

      const edge = (y, wave, dx) =>
        sample(steps, (t) => [
          x0 + dx + (x1 - x0) * t,
          y + wave(t) + tilt * (t - 0.5),
        ]);

      const upper = edge(y0, top, chisel * 0.5);
      const lower = edge(y1, bottom, -chisel * 0.5).reverse();
      const mid = (y0 + y1) / 2;

      // In RTL, the pen moves right-to-left
      const pen = isRtl
        ? [
            [x1 + chisel, mid + tilt * 0.5],
            [x0 - chisel, mid],
          ]
        : [
            [x0 - chisel, mid],
            [x1 + chisel, mid + tilt * 0.5],
          ];

      return {
        key: `${index}-${i}`,
        shape: `${polyline(upper)}${polyline(lower).replace('M', 'L')}Z`,
        pen: polyline(pen),
        penWidth: h * 1.8,
        length: lengthOf(pen),
        color,
        under: true,
        alpha: 0.38,
      };
    });
  }

  if (entry.type === 'underline' || entry.type === 'strike') {
    return lines.map((line, i) => {
      const h = line.bottom - line.top;
      const bow = (rand() - 0.5) * 3;
      const slope = (rand() - 0.5) * (entry.type === 'strike' ? 4 : 2.4);
      const wave = wobble(rand, 0.5);
      const x0 = line.left - 2 - rand() * 3;
      const x1 = line.right + 2 + rand() * 4;
      const y =
        entry.type === 'strike'
          ? line.top + h * 0.56
          : line.bottom + Math.max(1, h * 0.04);
      const steps = Math.max(8, Math.round((x1 - x0) / 6));

      const points = sample(steps, (t) => {
        // Handle RTL stroke start/end
        const progress = isRtl ? 1 - t : t;
        return [
          x0 + (x1 - x0) * progress,
          y + Math.sin(t * Math.PI) * bow + slope * (progress - 0.5) + wave(progress),
        ];
      });

      return penStroke(points, width, `${index}-${i}`, color);
    });
  }

  return lines.map((line, i) =>
    entry.type === 'circle'
      ? circleStroke(line, rand, width, `${index}-${i}`, color, isRtl)
      : boxStroke(line, rand, width, `${index}-${i}`, color, isRtl)
  );
}

function circleStroke(box, rand, width, key, color, isRtl) {
  const cx = (box.left + box.right) / 2;
  const cy = (box.top + box.bottom) / 2;
  const rx = (box.right - box.left) / 2 + 8;
  const ry = (box.bottom - box.top) / 2 + 4;
  const tilt = ((rand() - 0.5) * 6 * Math.PI) / 180;
  const start = isRtl
    ? -Math.PI * (0.38 + rand() * 0.12)
    : -Math.PI * (0.62 + rand() * 0.12);
  const sweep = (isRtl ? -1 : 1) * (Math.PI * 2 + 0.45 + rand() * 0.2);
  const drift = 0.05 + rand() * 0.04;
  const wave = wobble(rand, 0.025);
  const steps = Math.max(48, Math.round((rx + ry) / 3));

  const points = sample(steps, (t) => {
    const a = start + sweep * t;
    const grow = 1 - drift / 2 + drift * t + wave(t);
    const x = Math.cos(a) * rx * grow;
    const y = Math.sin(a) * ry * grow;
    return [
      cx + x * Math.cos(tilt) - y * Math.sin(tilt),
      cy + x * Math.sin(tilt) + y * Math.cos(tilt),
    ];
  });
  return penStroke(points, width, key, color);
}

function boxStroke(box, rand, width, key, color, isRtl) {
  const padX = 6;
  const padY = 4;
  const corners = [
    [box.left - padX - rand() * 2, box.top - padY + (rand() - 0.5) * 2],
    [box.right + padX + rand() * 2, box.top - padY + (rand() - 0.5) * 2],
    [box.right + padX + (rand() - 0.5) * 2, box.bottom + padY + rand() * 2],
    [box.left - padX + (rand() - 0.5) * 2, box.bottom + padY + rand() * 2],
  ];

  if (isRtl) {
    corners.reverse();
  }

  const points = [];
  for (let side = 0; side < 4; side++) {
    const a = corners[side];
    const b = corners[(side + 1) % 4];
    const bow = (rand() - 0.5) * 3;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const steps = Math.max(6, Math.round(len / 8));
    for (let s = side === 0 ? 0 : 1; s <= steps; s++) {
      const t = s / steps;
      const lift = Math.sin(t * Math.PI) * bow;
      points.push([
        a[0] + (b[0] - a[0]) * t + nx * lift,
        a[1] + (b[1] - a[1]) * t + ny * lift,
      ]);
    }
  }
  const first = corners[0];
  const second = corners[1];
  const over = 14 / Math.hypot(second[0] - first[0], second[1] - first[1]);
  points.push([
    first[0] + (second[0] - first[0]) * over,
    first[1] + (second[1] - first[1]) * over + 1.5,
  ]);
  return penStroke(points, width, key, color);
}

const MarkerContext = createContext(null);

export function Mark({
  children,
  type = 'highlight',
  color,
  strokeWidth,
  className,
}) {
  const registry = useContext(MarkerContext);
  const ref = useRef(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!(registry && ref.current)) {
      return;
    }
    return registry.add(id, { el: ref.current, type, color, strokeWidth });
  }, [registry, id, type, color, strokeWidth]);

  const Tag = (() => {
    if (type === 'highlight') return 'mark';
    if (type === 'strike') return 's';
    return 'span';
  })();

  return (
    <Tag
      className={cn(
        'bg-transparent text-inherit no-underline inline-block',
        (type === 'circle' || type === 'box') && 'whitespace-nowrap',
        className
      )}
      data-mark={type}
      ref={ref}
    >
      {children}
    </Tag>
  );
}

export function MarkerText({
  children,
  show,
  gap = 140,
  onDrawn,
  as: Tag = 'div',
  className,
}) {
  const rootRef = useRef(null);
  const entries = useRef(new Map());
  const [strokes, setStrokes] = useState([]);
  const [seen, setSeen] = useState(false);
  const [armed, setArmed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const measureRef = useRef(() => undefined);
  const onDrawnRef = useRef(onDrawn);
  onDrawnRef.current = onDrawn;
  const maskId = useId().replace(/:/g, '');

  const visible = show ?? seen;

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const origin = root.getBoundingClientRect();
    const order = Array.from(root.querySelectorAll('[data-mark]'));
    const ordered = [...entries.current.values()].sort(
      (a, b) => order.indexOf(a.el) - order.indexOf(b.el)
    );
    const next = [];
    let clock = 0;

    ordered.forEach((entry, index) => {
      const lines = Array.from(entry.el.getClientRects())
        .filter((r) => r.width > 1)
        .map((r) => ({
          left: r.left - origin.left,
          top: r.top - origin.top,
          right: r.right - origin.left,
          bottom: r.bottom - origin.top,
        }));
      if (lines.length === 0) return;

      const seed = hash(`${entry.el.textContent ?? ''}${index}`);
      const speed = entry.type === 'highlight' ? HIGHLIGHT_SPEED : PEN_SPEED;
      const made = strokesFor(entry, lines, seed, index);

      made.forEach((stroke, i) => {
        const duration = Math.min(
          MAX_MS,
          Math.max(MIN_MS, stroke.length / speed)
        );
        next.push({ ...stroke, delay: clock, duration });
        clock += duration + (i < made.length - 1 ? LINE_GAP : 0);
      });
      clock += gap;
    });

    setStrokes(next);
  }, [gap]);
  measureRef.current = measure;

  const registry = useRef({
    add: (id, entry) => {
      entries.current.set(id, entry);
      measureRef.current();
      return () => {
        entries.current.delete(id);
        measureRef.current();
      };
    },
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const resize = new ResizeObserver(() => measureRef.current());
    resize.observe(root);
    document.fonts?.ready.then(() => measureRef.current());

    const view = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          view.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    view.observe(root);
    return () => {
      resize.disconnect();
      view.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      setArmed(false);
      return;
    }
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setArmed(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [visible]);

  const totalRef = useRef(0);
  totalRef.current = strokes.reduce(
    (end, s) => Math.max(end, s.delay + s.duration),
    0
  );
  const hasStrokes = strokes.length > 0;

  useEffect(() => {
    if (!(armed && hasStrokes)) return;
    const timer = window.setTimeout(
      () => onDrawnRef.current?.(),
      reduced ? 0 : totalRef.current
    );
    return () => window.clearTimeout(timer);
  }, [armed, hasStrokes, reduced]);

  const layer = (under) => (
    <svg
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-0 left-0 overflow-visible',
        under ? '-z-10' : 'z-10'
      )}
      height="1"
      width="1"
    >
      {strokes
        .filter((s) => s.under === under)
        .map((s) => {
          const id = `${maskId}-${s.key}`;
          return (
            <g key={s.key}>
              <mask
                height={MASK_SPAN}
                id={id}
                maskUnits="userSpaceOnUse"
                width={MASK_SPAN}
                x={-MASK_SPAN / 2}
                y={-MASK_SPAN / 2}
              >
                <path
                  d={s.pen}
                  fill="none"
                  stroke="white"
                  strokeDasharray={s.length + 1}
                  strokeDashoffset={armed ? 0 : s.length + 1}
                  strokeLinecap={under ? 'butt' : 'round'}
                  strokeLinejoin="round"
                  strokeWidth={s.penWidth}
                  style={{
                    transition:
                      armed && !reduced
                        ? `stroke-dashoffset ${s.duration}ms ${PEN_EASE} ${s.delay}ms`
                        : 'none',
                  }}
                />
              </mask>
              <path
                d={s.shape}
                fill={s.color}
                fillOpacity={s.alpha}
                mask={`url(#${id})`}
              />
            </g>
          );
        })}
    </svg>
  );

  return (
    <MarkerContext.Provider value={registry.current}>
      <Tag className={cn('relative isolate', className)} ref={rootRef}>
        {layer(true)}
        {children}
        {layer(false)}
      </Tag>
    </MarkerContext.Provider>
  );
}

export default function MarkerTextDemo({ className }) {
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);

  const replay = () => {
    setDone(false);
    setRound((r) => r + 1);
  };

  return (
    <div className={cn('w-full max-w-xl px-2 py-6', className)}>
      <MarkerText
        className="text-zinc-900 dark:text-zinc-100"
        key={round}
        onDrawn={() => setDone(true)}
        show={round === 0 ? undefined : true}
      >
        <h2 className="text-balance font-semibold text-3xl leading-[1.15] tracking-tight sm:text-[2.6rem]">
          افهم ما وراء كلماتك،{' '}
          <Mark type="highlight" color="#a169cf">
            بوعي وهدوء
          </Mark>
          .
        </h2>
        <p className="mt-6 text-[17px] text-zinc-600 leading-8 dark:text-zinc-400">
          استكشف المشاعر{' '}
          <Mark type="underline" color="#7c3aed">
            بدقة استرشادية
          </Mark>
          ، وتحليل النبرة في{' '}
          <Mark type="circle" color="#0d9488">
            أقل من ثانية
          </Mark>
          ، مع حفظ خصوصيتك في{' '}
          <Mark type="box" color="#8b5cf6">
            مساحة آمنة
          </Mark>{' '}
          بالكامل دون أي{' '}
          <Mark type="strike" color="#f43f5e">
            حكم مسبق
          </Mark>
          .
        </p>
      </MarkerText>
      <button
        className={cn(
          'mt-8 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-xs text-text-muted transition-all duration-200 hover:text-text-primary hover:bg-surface-elevated border border-surface-border cursor-pointer',
          done ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        disabled={!done}
        onClick={replay}
        type="button"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>إعادة الرسم (Replay)</span>
      </button>
    </div>
  );
}
