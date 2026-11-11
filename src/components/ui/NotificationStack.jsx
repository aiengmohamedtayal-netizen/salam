import {
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  Mail,
  Mic,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Notification Stack Component
 * Rebuilt from Kokonut UI / DesignBookmark (https://designbookmark.com/motion#notification-stack)
 *
 * Physics & Springs (DesignBookmark Tokens):
 * - Snap-back spring: stiffness = 520, damping = 2 * sqrt(520) (critically damped)
 * - Dismiss flight: min_speed = 1400px/s, accel = 4200px/s^2, distance = 1.1 * width
 * - Axis lock: 6px
 * - Velocity window: 80ms, threshold: 0.11px/ms or 100px drag distance
 * - Collapsed peek: 10px behind, visible = 2 cards behind
 */

const PEEK = 10;
const VISIBLE_BEHIND = 2;
const GAP = 8;
const FALLBACK_HEIGHT = 76;

const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 0.11;
const AXIS_LOCK = 6;
const SPRING_STIFFNESS = 520;
const SPRING_DAMPING = 2 * Math.sqrt(SPRING_STIFFNESS);
const FLIGHT_MIN_SPEED = 1400;
const FLIGHT_ACCEL = 4200;
const VELOCITY_WINDOW_MS = 80;
const EXIT_MS = 200;
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

export const DEFAULT_AMAL_NOTIFICATIONS = [
  {
    id: 'n-amal-1',
    app: 'التحليل اللغوي',
    appEn: 'NLP Analyzer',
    title: 'اكتمال فحص النصوص الأخير',
    titleEn: 'Text Analysis Complete',
    body: 'تم تحليل النص المدخل بنجاح؛ مؤشرات المشاعر مستقرة وتُظهر توازناً إيجابياً بنسبة 92%.',
    bodyEn: 'Text scan complete. Emotional stability metrics indicate 92% balanced sentiment.',
    time: 'الآن',
    timeEn: 'now',
    icon: (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
        <Sparkles className="size-4" />
      </span>
    ),
  },
  {
    id: 'n-amal-2',
    app: 'البصمة الصوتية',
    appEn: 'Voice Biomarkers',
    title: 'تنبيه مستوى الإجهاد الصوتي',
    titleEn: 'Vocal Fatigue Update',
    body: 'تم رصد مؤشر إجهاد صوتي معتدل أثناء نبرة الحديث، ننصح بجلسة استرخاء وتنفس قصيرة.',
    bodyEn: 'Moderate vocal stress detected. A brief 5-minute breathing exercise is recommended.',
    time: 'منذ 10 د',
    timeEn: '10m ago',
    icon: (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
        <Mic className="size-4" />
      </span>
    ),
  },
  {
    id: 'n-amal-3',
    app: 'راصد الشائعات',
    appEn: 'Rumor Radar',
    title: 'تفنيد حقيقة نفسية شائعة',
    titleEn: 'Fact-Check Alert',
    body: 'تحديث موثوق: مقولة "مضادات الاكتئاب تسبب الإدمان الدائم" تم تفنيدها بالدراسات السريرية.',
    bodyEn: 'Fact check: "Antidepressants cause permanent dependency" refuted with clinical evidence.',
    time: 'منذ 45 د',
    timeEn: '45m ago',
    icon: (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
        <ShieldCheck className="size-4" />
      </span>
    ),
  },
  {
    id: 'n-amal-4',
    app: 'مساعد أمل الذكي',
    appEn: 'AMAL Guide',
    title: 'تذكير بموعد المتابعة الذاتية',
    titleEn: 'Weekly Self-Checkin',
    body: 'مر أسبوع منذ تقييمك الشامل الأخير. هل ترغب في فحص سريع لحالتك المزاجية اليوم؟',
    bodyEn: 'A week has passed since your last full check. Would you like a quick mood check today?',
    time: 'أمس',
    timeEn: 'yesterday',
    icon: (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
        <HeartPulse className="size-4" />
      </span>
    ),
  },
];

const opacityFor = (x) => Math.max(1 - Math.abs(x) / 240, 0.3);

/** Release velocity in px/ms from the most recent pointer samples. */
function releaseVelocity(samples) {
  const last = samples[samples.length - 1];
  if (!last) return 0;
  let first = last;
  for (let i = samples.length - 1; i >= 0; i--) {
    const sample = samples[i];
    if (last.t - sample.t > VELOCITY_WINDOW_MS) break;
    first = sample;
  }
  const dt = last.t - first.t;
  return dt > 0 ? (last.x - first.x) / dt : 0;
}

/**
 * Which way a released card leaves, or 0 to spring back.
 */
function dismissDirection(dx, velocity) {
  const flick =
    Math.abs(velocity) > DISMISS_VELOCITY &&
    Math.sign(velocity) === Math.sign(dx);
  if (Math.abs(dx) < DISMISS_DISTANCE && !flick) {
    return 0;
  }
  return (dx === 0 ? velocity : dx) > 0 ? 1 : -1;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function NotificationStack({
  notifications,
  items: itemsProp,
  onDismiss,
  onCardClick,
  title,
  showAllText,
  showLessText,
  emptyText,
  className,
}) {
  const { language } = useTranslation();
  const isAr = language !== 'en';

  const initialList = itemsProp || notifications || DEFAULT_AMAL_NOTIFICATIONS;
  const [items, setItems] = useState(initialList);
  const [heights, setHeights] = useState({});
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [leaving, setLeaving] = useState(() => new Set());

  const listRef = useRef(null);
  const swipeRefs = useRef(new Map());
  const drag = useRef(null);
  const suppressClick = useRef(false);
  const timers = useRef([]);
  const lastY = useRef(new Map());
  const swipeX = useRef(new Map());
  const frames = useRef(new Map());
  const dismissed = useRef(new Set());
  const stopListening = useRef(null);

  // Sync if external notifications or items prop changes
  useEffect(() => {
    const list = itemsProp || notifications || DEFAULT_AMAL_NOTIFICATIONS;
    setItems(list);
    dismissed.current.clear();
    setLeaving(new Set());
  }, [notifications, itemsProp]);

  useEffect(() => {
    const pending = timers.current;
    const running = frames.current;
    return () => {
      for (const id of pending) window.clearTimeout(id);
      for (const frame of running.values()) cancelAnimationFrame(frame);
      stopListening.current?.();
    };
  }, []);

  // Measure card heights dynamically
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = (entries) => {
      setHeights((prev) => {
        let next = prev;
        for (const { id, height } of entries) {
          if (id && height && prev[id] !== height) {
            next = next === prev ? { ...prev } : next;
            next[id] = height;
          }
        }
        return next;
      });
    };

    const cards = Array.from(list.children);
    measure(
      cards.map((card) => ({ id: card.dataset.id, height: card.offsetHeight }))
    );

    const observer = new ResizeObserver((entries) => {
      measure(
        entries.map((entry) => ({
          id: entry.target.dataset.id,
          height: Math.round(entry.borderBoxSize?.[0]?.blockSize ?? entry.target.offsetHeight),
        }))
      );
    });

    for (const card of cards) observer.observe(card);
    return () => observer.disconnect();
  }, [items]);

  const expanded = (hovered || focused || pinned) && items.length > 1;
  const heightOf = (id) => heights[id] ?? FALLBACK_HEIGHT;

  const laidOut = items.filter((item) => !leaving.has(item.id));
  const frontHeight = laidOut[0] ? heightOf(laidOut[0].id) : 0;
  const stackHeight = expanded
    ? laidOut.reduce((sum, item) => sum + heightOf(item.id), 0) +
      Math.max(laidOut.length - 1, 0) * GAP
    : frontHeight + Math.min(laidOut.length - 1, VISIBLE_BEHIND) * PEEK;

  const offsets = [];
  let running = 0;
  for (const item of laidOut) {
    offsets.push(running);
    running += heightOf(item.id) + GAP;
  }

  const stopFrame = (id) => {
    const frame = frames.current.get(id);
    if (frame !== undefined) {
      cancelAnimationFrame(frame);
      frames.current.delete(id);
    }
  };

  const paint = (id, x) => {
    swipeX.current.set(id, x);
    const node = swipeRefs.current.get(id);
    if (node) {
      node.style.transition = 'none';
      node.style.transform = x === 0 ? '' : `translateX(${x}px)`;
      node.style.opacity = x === 0 ? '' : `${opacityFor(x)}`;
    }
  };

  const run = (id, step, onDone) => {
    stopFrame(id);
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (step(dt)) {
        frames.current.delete(id);
        onDone?.();
        return;
      }
      frames.current.set(id, requestAnimationFrame(tick));
    };
    frames.current.set(id, requestAnimationFrame(tick));
  };

  const snapBack = (id, velocity) => {
    let x = swipeX.current.get(id) ?? 0;
    let v = velocity * 1000;
    if (prefersReducedMotion()) {
      paint(id, 0);
      return;
    }
    run(id, (dt) => {
      const force = -SPRING_STIFFNESS * x - SPRING_DAMPING * v;
      v += force * dt;
      x += v * dt;
      if (Math.abs(x) < 0.5 && Math.abs(v) < 10) {
        paint(id, 0);
        return true;
      }
      paint(id, x);
      return false;
    });
  };

  const finishDismiss = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    lastY.current.delete(id);
    swipeX.current.delete(id);
    setLeaving((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    onDismiss?.(id);
  };

  const dismiss = (id, direction, velocity = 0) => {
    if (dismissed.current.has(id)) return;
    dismissed.current.add(id);
    setLeaving((prev) => new Set(prev).add(id));
    const node = swipeRefs.current.get(id);

    if (node?.contains(document.activeElement)) {
      const at = laidOut.findIndex((item) => item.id === id);
      const next = laidOut[at + 1] ?? laidOut[at - 1];
      const target = next
        ? swipeRefs.current.get(next.id)?.querySelector('article')
        : listRef.current;
      target?.focus();
    }

    if (!node || prefersReducedMotion()) {
      stopFrame(id);
      if (node) {
        node.style.transition = `opacity ${EXIT_MS}ms ${EASE_OUT}`;
        node.style.opacity = '0';
      }
      const timer = window.setTimeout(() => finishDismiss(id), EXIT_MS);
      timers.current.push(timer);
      return;
    }

    const distance = node.offsetWidth * 1.1;
    let x = swipeX.current.get(id) ?? 0;
    let speed = Math.max(Math.abs(velocity) * 1000, FLIGHT_MIN_SPEED);
    run(
      id,
      (dt) => {
        speed += FLIGHT_ACCEL * dt;
        x += direction * speed * dt;
        const done = Math.abs(x) >= distance;
        paint(id, done ? direction * distance : x);
        node.style.opacity = `${Math.max(1 - Math.abs(x) / distance, 0)}`;
        return done;
      },
      () => finishDismiss(id)
    );
  };

  const handlePointerDown = (event, index, id) => {
    if (drag.current || leaving.has(id) || (!expanded && index > 0)) return;
    suppressClick.current = false;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (event.target.closest('button')) return;

    stopFrame(id);
    const { pointerId } = event;
    const release = (up) => {
      if (up.pointerId !== pointerId) return;
      stopListening.current?.();
      if (drag.current?.pointerId === pointerId) {
        drag.current = null;
        if (swipeX.current.get(id)) snapBack(id, 0);
      }
    };
    stopListening.current?.();
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    stopListening.current = () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      stopListening.current = null;
    };
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: swipeX.current.get(id) ?? 0,
      dx: 0,
      axis: null,
      samples: [],
    };
  };

  const handlePointerMove = (event, id) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;

    if (current.axis === null) {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
      current.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (current.axis === 'x') {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (current.axis !== 'x') return;

    current.dx = current.originX + dx;
    current.samples.push({ t: event.timeStamp, x: current.dx });
    if (current.samples.length > 12) current.samples.shift();
    paint(id, current.dx);
  };

  const handlePointerUp = (event, id) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    if (current.axis !== 'x') {
      if (swipeX.current.get(id)) snapBack(id, 0);
      return;
    }
    suppressClick.current = true;

    const velocity = releaseVelocity(current.samples);
    const direction = dismissDirection(current.dx, velocity);
    if (direction === 0) {
      snapBack(id, velocity);
      return;
    }
    dismiss(id, direction, Math.sign(velocity) === direction ? velocity : 0);
  };

  const handleCardKeyDown = (event, id) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      if (event.repeat) return;
      dismiss(id, isAr ? -1 : 1);
    }
  };

  const resolvedTitle = title || (isAr ? 'الإشعارات' : 'Notifications');
  const resolvedShowAll = showAllText || (isAr ? 'عرض الكل' : 'Show all');
  const resolvedShowLess = showLessText || (isAr ? 'طي الإشعارات' : 'Show less');
  const resolvedEmpty = emptyText || (isAr ? 'أنت على اطلاع تام بكافة التنبيهات ✨' : "You're all caught up ✨");

  return (
    <div
      className={cn('w-full max-w-sm select-none', className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
      onFocus={() => setFocused(true)}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovered(false);
      }}
    >
      {/* Header bar */}
      <div className="mb-3 flex h-7 items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm text-text-primary">
            {resolvedTitle}
          </p>
          <span className="flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold rounded-full bg-primary-100 dark:bg-primary-950/70 text-primary-700 dark:text-primary-300 tabular-nums">
            {laidOut.length}
          </span>
        </div>
        {laidOut.length > 1 && (
          <button
            aria-expanded={expanded}
            className="rounded-lg px-2.5 py-1 text-xs font-semibold text-text-secondary transition-colors duration-150 hover:bg-surface-muted hover:text-text-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-400 cursor-pointer"
            onClick={() => setPinned((prev) => !prev)}
            type="button"
          >
            {expanded ? resolvedShowLess : resolvedShowAll}
          </button>
        )}
      </div>

      {/* Animated Stack */}
      <ol
        aria-label={resolvedTitle}
        className="relative outline-hidden transition-[height] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        ref={listRef}
        style={{ height: stackHeight }}
        tabIndex={-1}
      >
        {items.map((item) => {
          const index = laidOut.findIndex((card) => card.id === item.id);
          const isLeaving = index === -1;
          const depth = Math.max(index, 0);
          const hiddenBehind = !(expanded || depth <= VISIBLE_BEHIND);
          const scale = expanded || isLeaving ? 1 : 1 - depth * 0.05;
          const restingY = expanded
            ? offsets[depth]
            : frontHeight + depth * PEEK - heightOf(item.id) * scale;
          const y = isLeaving ? (lastY.current.get(item.id) ?? 0) : restingY;
          if (!isLeaving) lastY.current.set(item.id, restingY);

          const itemTitle = isAr ? item.title : item.titleEn || item.title;
          const itemBody = isAr ? item.body : item.bodyEn || item.body;
          const itemApp = isAr ? item.app : item.appEn || item.app;
          const itemTime = isAr ? item.time : item.timeEn || item.time;

          return (
            <li
              className="absolute inset-x-0 top-0 origin-top transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity"
              data-id={item.id}
              key={item.id}
              style={{
                transform: `translateY(${y}px) scale(${scale})`,
                opacity: hiddenBehind ? 0 : 1,
                zIndex: items.length - depth,
                pointerEvents: hiddenBehind ? 'none' : undefined,
              }}
            >
              <div
                className="touch-pan-y"
                onLostPointerCapture={(event) => {
                  if (event.target === event.currentTarget) {
                    handlePointerUp(event, item.id);
                  }
                }}
                onPointerCancel={(event) => handlePointerUp(event, item.id)}
                onPointerDown={(event) => handlePointerDown(event, depth, item.id)}
                onPointerMove={(event) => handlePointerMove(event, item.id)}
                onPointerUp={(event) => handlePointerUp(event, item.id)}
                ref={(node) => {
                  if (node) swipeRefs.current.set(item.id, node);
                  else swipeRefs.current.delete(item.id);
                }}
              >
                <article
                  aria-label={`${itemApp}: ${itemTitle}. ${itemBody}`}
                  className={cn(
                    'group/card relative flex select-none gap-3 rounded-2xl border border-surface-border bg-surface-card p-3.5 shadow-sm outline-hidden transition-all duration-200',
                    'hover:border-primary-400/40 hover:shadow-md dark:shadow-none',
                    'focus-visible:ring-2 focus-visible:ring-primary-500',
                    !expanded && depth === 0 && laidOut.length > 1 && 'cursor-pointer'
                  )}
                  onClick={() => {
                    if (suppressClick.current) {
                      suppressClick.current = false;
                      return;
                    }
                    if (!expanded) {
                      setPinned(true);
                    } else if (onCardClick) {
                      onCardClick(item);
                    }
                  }}
                  onKeyDown={(event) => handleCardKeyDown(event, item.id)}
                  tabIndex={hiddenBehind ? -1 : 0}
                >
                  <NotificationContent
                    item={item}
                    itemApp={itemApp}
                    itemTitle={itemTitle}
                    itemBody={itemBody}
                    itemTime={itemTime}
                    muted={!expanded && depth > 0}
                    onDismiss={() => dismiss(item.id, isAr ? -1 : 1)}
                    tabbable={!hiddenBehind}
                    isAr={isAr}
                  />
                </article>
              </div>
            </li>
          );
        })}
      </ol>

      {laidOut.length === 0 && (
        <div className="py-8 text-center text-xs text-text-muted flex flex-col items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p>{resolvedEmpty}</p>
        </div>
      )}
    </div>
  );
}

function NotificationContent({
  item,
  itemTitle,
  itemBody,
  itemTime,
  muted,
  tabbable,
  onDismiss,
  isAr,
}) {
  return (
    <>
      <div
        className={cn(
          'flex min-w-0 flex-1 gap-3 transition-opacity duration-200 text-start',
          muted && 'opacity-0'
        )}
      >
        <div className="shrink-0 pt-0.5">{item.icon}</div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-bold text-xs sm:text-sm text-text-primary">
              {itemTitle}
            </p>
            <span className="shrink-0 text-[11px] text-text-muted tabular-nums">
              {itemTime}
            </span>
          </div>
          <p className="line-clamp-2 text-xs text-text-secondary leading-relaxed">
            {itemBody}
          </p>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        aria-label={isAr ? `إغلاق ${itemTitle}` : `Dismiss ${itemTitle}`}
        className={cn(
          'absolute -top-2 -end-2 flex size-6 items-center justify-center rounded-full border border-surface-border bg-surface-card text-text-muted opacity-0 shadow-sm transition-all duration-150',
          'hover:text-text-primary hover:bg-surface-muted hover:scale-110 focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 group-hover/card:opacity-100 cursor-pointer',
          muted && 'hidden'
        )}
        onClick={(event) => {
          event.stopPropagation();
          onDismiss();
        }}
        tabIndex={tabbable ? 0 : -1}
        type="button"
      >
        <X className="size-3" />
      </button>
    </>
  );
}

export default NotificationStack;
