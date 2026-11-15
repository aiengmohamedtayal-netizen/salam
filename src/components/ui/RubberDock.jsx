import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

/**
 * DesignBookmark Motion - Rubber Dock component.
 * Features exact spring physics and dual-layer inverted clipping from tokens.css:
 * - dock-lead: stiffness 640, damping 38
 * - dock-trail: stiffness 150, damping 16
 * - dock-drag-lead: 1100 56
 * - dock-drag-trail: 320 26
 * - dock-open-w: 340 21
 * - dock-open-h: 230 21
 * - dock-close: 420 30
 * - dock-pop: 520 16
 * - dock-expanded-w: 340px
 *
 * Fully compliant with high-contrast rules:
 * - Solid, non-transparent fonts in light mode (no opacity wash, no blur)
 * - Deep high-contrast ink colors (#170d24, #47345b)
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

const ICONS = [
  {
    id: 'overview',
    labelAr: 'نظرة عامة',
    labelEn: 'Overview',
    svg: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
  },
  {
    id: 'explore',
    labelAr: 'استكشاف',
    labelEn: 'Explore',
    svg: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
  },
  {
    id: 'reminders',
    labelAr: 'المتابعة',
    labelEn: 'Activity',
    svg: '<path d="M4 13.5 6.2 5.6A1 1 0 0 1 7.2 5h9.6a1 1 0 0 1 1 .6L20 13.5V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 13.5h4.5l1.2 2h4.6l1.2-2H20"/>',
  },
  {
    id: 'profile',
    labelAr: 'الحساب',
    labelEn: 'Profile',
    svg: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c1.2-3.2 3.8-5 7-5s5.8 1.8 7 5"/>',
  },
];

export function RubberDock({ className }) {
  const { language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRtl = language === 'ar';

  const dockRef = useRef(null);
  const groundRef = useRef(null);
  const tabsRef = useRef(null);
  const indRef = useRef(null);
  const baseIconsRef = useRef(null);
  const topIconsRef = useRef(null);
  const panelsRef = useRef(null);
  const typedRef = useRef(null);

  const [activeTab, setActiveTab] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [slowMotion, setSlowMotion] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [sounds, setSounds] = useState(true);

  const apiRef = useRef(null);

  const stateRef = useRef({
    active: 0,
    expanded: false,
    slow: false,
    timeScale: 1,
    drag: null,
    suppressClick: false,
  });

  const getLocalizedPath = useCallback(
    (basePath) => {
      const prefix = language === 'en' ? '/en' : '/ar';
      if (basePath === '/') return prefix;
      return `${prefix}${basePath}`;
    },
    [language]
  );

  useEffect(() => {
    stateRef.current.active = activeTab;
  }, [activeTab]);

  useEffect(() => {
    stateRef.current.expanded = isExpanded;
  }, [isExpanded]);

  useEffect(() => {
    stateRef.current.timeScale = slowMotion ? 0.25 : 1;
    stateRef.current.slow = slowMotion;
  }, [slowMotion]);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Geometry constants tuned for Navbar fit
    const TAB = 46;
    const GAP = 4;
    const N = 4;
    const TW = N * TAB + (N - 1) * GAP; // 4 * 46 + 12 = 196
    const cx = (i) => TAB / 2 + i * (TAB + GAP);
    const COL = { W: TW + 12, H: TAB + 8 }; // 208 x 54
    const PANEL_H = 280;

    const T = {
      lead: [640, 38],
      trail: [150, 16],
      dragLead: [1100, 56],
      dragTrail: [320, 26],
      openW: [340, 21],
      openH: [230, 21],
      close: [420, 30],
      pop: [520, 16],
      expW: 340,
    };

    const L = createSpring(cx(0) - TAB / 2);
    const R = createSpring(cx(0) + TAB / 2);
    const W = createSpring(COL.W, 260, 20);
    const H = createSpring(COL.H, 400, 34);
    const nudge = createSpring(0, 300, 18);
    const pops = [0, 1, 2, 3].map(() => createSpring(1, ...T.pop));
    const allSprings = [L, R, W, H, nudge, ...pops];

    const expW = () => Math.min(T.expW, window.innerWidth - 24);

    const panels = panelsRef.current ? [...panelsRef.current.querySelectorAll('.dock-panel')] : [];

    function showPanel(idx) {
      panels.forEach((p, i) => {
        if (!p) return;
        if (i === idx) {
          p.classList.add('on');
          p.style.display = 'block';
        } else {
          p.classList.remove('on');
          p.style.display = 'none';
        }
      });
      if (idx === 1) typeIn();
    }

    function swapPanel(from, to) {
      showPanel(to);
      tuneSpring(H, 260, 20, reduce);
      const targetPanelH = panels[to] ? Math.min(PANEL_H, panels[to].offsetHeight || 260) : 260;
      H.t = COL.H + targetPanelH;
    }

    let typeRun = 0;
    function typeIn() {
      const el = typedRef.current;
      if (!el) return;
      const word = isRtl ? 'تمارين الاسترخاء والتفريغ...' : 'mindful breathing...';
      el.textContent = '';
      const run = ++typeRun;
      const tick = (n) => {
        setTimeout(() => {
          if (run !== typeRun || !el) return;
          el.textContent = word.slice(0, n);
          if (n < word.length) tick(n + 1);
        }, 50);
      };
      setTimeout(() => tick(1), 160);
    }

    function moveTo(center, dir, drag = false) {
      const lead = drag ? T.dragLead : T.lead;
      const trail = drag ? T.dragTrail : T.trail;
      if (dir === 0) {
        tuneSpring(L, 600, 44, reduce);
        tuneSpring(R, 600, 44, reduce);
      } else {
        const [l, r] = dir > 0 ? [trail, lead] : [lead, trail];
        tuneSpring(L, l[0], l[1], reduce);
        tuneSpring(R, r[0], r[1], reduce);
      }
      L.t = center - TAB / 2;
      R.t = center + TAB / 2;
    }

    function setActiveInternal(i, dirHint) {
      i = clamp(i, 0, N - 1);
      const currentCenter = (L.x + R.x) / 2;
      const dir = dirHint ?? Math.sign(cx(i) - currentCenter);
      moveTo(cx(i), dir);
      const prev = stateRef.current.active;
      stateRef.current.active = i;
      setActiveTab(i);
      if (pops[i]) pops[i].v -= 3.2;

      if (stateRef.current.expanded && prev !== i) {
        swapPanel(prev, i);
      }
    }

    function setExpandedInternal(v) {
      stateRef.current.expanded = v;
      setIsExpanded(v);

      if (v) {
        showPanel(stateRef.current.active);
        const targetPanelH = panels[stateRef.current.active]
          ? Math.min(PANEL_H, panels[stateRef.current.active].offsetHeight || 260)
          : 260;
        W.t = expW();
        H.t = COL.H + targetPanelH;
        tuneSpring(W, ...T.openW, reduce);
        tuneSpring(H, ...T.openH, reduce);
      } else {
        W.t = COL.W;
        H.t = COL.H;
        tuneSpring(W, T.close[0] * 0.72, T.close[1] * 0.66, reduce);
        tuneSpring(H, ...T.close, reduce);
        panels.forEach((p) => {
          if (p) {
            p.classList.remove('on');
            p.style.display = 'none';
          }
        });
      }
      if (pops[stateRef.current.active]) pops[stateRef.current.active].v -= 2.4;
    }

    // Connect imperative API for buttons
    apiRef.current = {
      setActive: setActiveInternal,
      setExpanded: setExpandedInternal,
      toggleExpanded: () => setExpandedInternal(!stateRef.current.expanded),
    };

    // Drag pointer events with rubber-band resistance
    const rubber = (x, min, max, d = 38) =>
      x < min
        ? min - (1 - 1 / (((min - x) * 0.55) / d + 1)) * d
        : x > max
        ? max + (1 - 1 / (((x - max) * 0.55) / d + 1)) * d
        : x;

    const localX = (e) => {
      if (!dockRef.current) return 0;
      const r = dockRef.current.getBoundingClientRect();
      return e.clientX - (r.left + r.width / 2 - nudge.x) + TW / 2;
    };

    const tabsEl = tabsRef.current;
    const handlePointerDown = (e) => {
      stateRef.current.drag = {
        id: e.pointerId,
        x0: e.clientX,
        last: localX(e),
        live: false,
        dir: 0,
      };
    };

    const handlePointerMove = (e) => {
      const d = stateRef.current.drag;
      if (!d || e.pointerId !== d.id) return;
      if (!d.live && Math.abs(e.clientX - d.x0) > 4) {
        d.live = true;
        tabsEl?.setPointerCapture(e.pointerId);
        tabsEl?.classList.add('dragging');
      }
      if (!d.live) return;
      const raw = localX(e);
      const diff = raw - d.last;
      d.last = raw;
      if (Math.abs(diff) > 0.5) d.dir = Math.sign(diff);
      const c = rubber(raw, cx(0), cx(N - 1));
      moveTo(c, d.dir, true);
      nudge.t = (c - clamp(c, cx(0), cx(N - 1))) * 0.35;
    };

    const handlePointerUp = (e) => {
      const d = stateRef.current.drag;
      if (!d || e.pointerId !== d.id) return;
      if (d.live) {
        const c = (L.t + R.t) / 2;
        nudge.t = 0;
        const targetIdx = Math.round((c - cx(0)) / (TAB + GAP) + d.dir * 0.18);
        setActiveInternal(targetIdx, d.dir || 0);
        stateRef.current.suppressClick = true;
        setTimeout(() => {
          stateRef.current.suppressClick = false;
        }, 80);
        tabsEl?.classList.remove('dragging');
      }
      stateRef.current.drag = null;
    };

    tabsEl?.addEventListener('pointerdown', handlePointerDown);
    tabsEl?.addEventListener('pointermove', handlePointerMove);
    tabsEl?.addEventListener('pointerup', handlePointerUp);
    tabsEl?.addEventListener('pointercancel', handlePointerUp);

    // Outside click collapses dock
    const handleDocumentClick = (e) => {
      if (stateRef.current.expanded && dockRef.current && !dockRef.current.contains(e.target)) {
        setExpandedInternal(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);

    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        setActiveInternal(stateRef.current.active + (isRtl ? -1 : 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveInternal(stateRef.current.active + (isRtl ? 1 : -1));
      } else if (e.key === 'Escape') {
        setExpandedInternal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Animation Loop with 4 sub-steps per frame
    let animId;
    let last = performance.now();
    let isRunning = false;

    function wake() {
      if (!isRunning) {
        isRunning = true;
        last = performance.now();
        animId = requestAnimationFrame(loop);
      }
    }

    function loop(now) {
      let dt = Math.min((now - last) / 1000, 1 / 30) * stateRef.current.timeScale;
      last = now;

      const sub = 4;
      const subDt = dt / sub;
      for (let k = 0; k < sub; k++) {
        allSprings.forEach((s) => stepSpring(s, subDt));
      }

      // Render styles
      const w = W.x;
      const h = Math.max(H.x, 40);
      const open = clamp((h - COL.H) / PANEL_H, 0, 1);
      const give = clamp(-H.v / 9000, -0.04, 0.04);

      if (dockRef.current) {
        dockRef.current.style.width = `${(w * (1 + give)).toFixed(2)}px`;
        dockRef.current.style.height = `${h.toFixed(2)}px`;
        dockRef.current.style.borderRadius = `${Math.min(h / 2, 26 - 6 * open).toFixed(2)}px`;
        dockRef.current.style.transform = `translateX(calc(-50% + ${nudge.x.toFixed(2)}px))`;
      }

      if (groundRef.current) {
        groundRef.current.style.width = `${(w * 0.86).toFixed(2)}px`;
        groundRef.current.style.transform = `translateX(calc(-50% + ${(nudge.x * 0.6).toFixed(2)}px)) scaleY(${1 + open * 0.5})`;
      }

      let l = L.x,
        r = R.x;
      if (r < l) [l, r] = [r, l];
      const iw = Math.max(r - l, 22);
      const ih = TAB * clamp(1 / Math.sqrt(iw / TAB), 0.68, 1.08); // area preserving
      const top = (TAB - ih) / 2;

      if (indRef.current) {
        indRef.current.style.width = `${iw.toFixed(2)}px`;
        indRef.current.style.height = `${ih.toFixed(2)}px`;
        indRef.current.style.borderRadius = `${(ih / 2).toFixed(2)}px`;
        indRef.current.style.transform = `translate3d(${l.toFixed(2)}px, ${top.toFixed(2)}px, 0)`;
      }

      // Inverted icon layer clipped exactly to the rubber pill
      if (topIconsRef.current) {
        topIconsRef.current.style.clipPath = `inset(${top.toFixed(2)}px ${(TW - l - iw).toFixed(2)}px ${(TAB - top - ih).toFixed(2)}px ${l.toFixed(2)}px round ${(ih / 2).toFixed(2)}px)`;
      }

      const baseButtons = baseIconsRef.current ? [...baseIconsRef.current.children] : [];
      pops.forEach((p, idx) => {
        const sc = `scale(${p.x.toFixed(3)})`;
        if (baseButtons[idx]?.firstChild) baseButtons[idx].firstChild.style.transform = sc;
        const topChildren = topIconsRef.current ? [...topIconsRef.current.children] : [];
        if (topChildren[idx]?.firstChild) topChildren[idx].firstChild.style.transform = sc;
      });

      // Performance Optimization (fixing-motion-performance): Rest condition when springs settle
      const allRest = allSprings.every(
        (s) => Math.abs(s.v) < 0.005 && Math.abs(s.x - s.t) < 0.005
      );
      if (allRest && !stateRef.current.isDragging) {
        allSprings.forEach((s) => {
          s.x = s.t;
          s.v = 0;
        });
        isRunning = false;
        return;
      }

      animId = requestAnimationFrame(loop);
    }

    setActiveInternal(0, 0);
    wake();

    return () => {
      cancelAnimationFrame(animId);
      tabsEl?.removeEventListener('pointerdown', handlePointerDown);
      tabsEl?.removeEventListener('pointermove', handlePointerMove);
      tabsEl?.removeEventListener('pointerup', handlePointerUp);
      tabsEl?.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRtl]);

  const handleTabButtonClick = (idx) => {
    if (stateRef.current.suppressClick) return;
    if (activeTab === idx) {
      apiRef.current?.toggleExpanded();
    } else {
      apiRef.current?.setActive(idx);
    }
  };

  return (
    <div className={cn('relative flex items-center justify-center font-cairo select-none', className)}>
      <style>{`
        .rubber-ground {
          position: absolute;
          left: 50%;
          top: 30px;
          height: 18px;
          border-radius: 50%;
          background: radial-gradient(closest-side, rgba(112, 64, 154, 0.35), transparent);
          transform: translateX(-50%);
          filter: blur(8px);
          pointer-events: none;
        }
        .rubber-dock {
          position: absolute;
          left: 50%;
          top: 6px;
          width: 208px;
          height: 52px;
          border-radius: 26px;
          background: #ffffff;
          border: 1.5px solid #b895db;
          box-shadow: 0 16px 45px -8px rgba(112, 64, 154, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
          backdrop-filter: blur(20px);
          overflow: hidden;
          transform: translateX(-50%);
          will-change: width, height, transform;
          z-index: 60;
          color: #170d24 !important;
        }
        .rubber-dock,
        .rubber-dock * {
          opacity: 1 !important;
        }
        .dark .rubber-dock {
          background: #20152d;
          border: 1.5px solid rgba(161, 105, 207, 0.3);
          box-shadow: 0 18px 50px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(161, 105, 207, 0.2) inset;
          color: #f4effa !important;
        }
        .rubber-tabs {
          position: absolute;
          left: 50%;
          top: 3px;
          width: 196px;
          height: 46px;
          transform: translateX(-50%);
          touch-action: none;
          cursor: grab;
          direction: ltr !important;
          z-index: 10;
        }
        .rubber-tabs.dragging {
          cursor: grabbing;
        }
        .dock-icons {
          position: absolute;
          inset: 0;
          display: flex;
          gap: 4px;
        }
        .dock-icons > * {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          flex: none;
        }
        .dock-icons.base button {
          background: none;
          border: 0;
          color: #3b284c;
          cursor: pointer;
          border-radius: 23px;
          outline: none;
          transition: color 0.15s ease;
        }
        .dark .dock-icons.base button {
          color: #cbbddc;
        }
        .dock-icons.base button:hover {
          color: #70409a;
        }
        .dark .dock-icons.base button:hover {
          color: #ffffff;
        }
        .dock-icons.top {
          pointer-events: none;
          color: #ffffff;
        }
        .dock-icons svg {
          width: 20px;
          height: 20px;
          display: block;
        }
        .rubber-indicator {
          position: absolute;
          left: 0;
          top: 0;
          width: 46px;
          height: 46px;
          border-radius: 23px;
          background: linear-gradient(135deg, #a169cf 0%, #70409a 100%);
          box-shadow: 0 4px 14px rgba(112, 64, 154, 0.5);
          pointer-events: none;
        }
        .dock-panels {
          position: absolute;
          left: 50%;
          top: 50px;
          width: 340px;
          height: 280px;
          transform: translateX(-50%);
          overflow-y: auto;
        }
        .dock-panel {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          padding: 14px 18px 12px;
          display: none;
          color: #170d24 !important;
        }
        .dock-panel.on {
          display: block;
        }
        /* Anti-transparency rule: All content inside panel is 100% visible and solid */
        .dock-it {
          opacity: 1 !important;
          filter: none !important;
          transform: none !important;
        }
        .rubber-dock .dock-panel span,
        .rubber-dock .dock-panel b,
        .rubber-dock .dock-panel h3,
        .rubber-dock .dock-panel time,
        .rubber-dock .dock-panel div {
          opacity: 1 !important;
        }
        /* Solid high-contrast text in Light Mode */
        html:not(.dark) .rubber-dock .dock-panel span:not(.dock-sw):not(.rounded-full):not([class*="text-emerald"]):not([class*="text-amber"]),
        html:not(.dark) .rubber-dock .dock-panel b:not([class*="text-emerald"]):not([class*="text-amber"]):not([class*="text-white"]),
        html:not(.dark) .rubber-dock .dock-panel h3 {
          color: #170d24 !important;
        }
        html:not(.dark) .rubber-dock .dock-panel .dock-typed {
          color: #170d24 !important;
          font-weight: 800 !important;
        }
        .dock-typed::after {
          content: "";
          display: inline-block;
          width: 1.5px;
          height: 14px;
          background: #70409a;
          margin-inline-start: 2px;
          vertical-align: -2px;
          animation: dockBlink 1s steps(1) infinite;
        }
        .dark .dock-typed::after {
          background: #a169cf;
        }
        @keyframes dockBlink {
          50% { opacity: 0; }
        }
        .dock-sw {
          width: 38px;
          height: 22px;
          border-radius: 999px;
          background: #d8c3ed;
          position: relative;
          border: 0;
          cursor: pointer;
          transition: background 0.25s;
        }
        .dark .dock-sw {
          background: rgba(161, 105, 207, 0.25);
        }
        .dock-sw::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.2s;
        }
        .dock-sw[aria-checked="true"] {
          background: #70409a;
        }
        .dark .dock-sw[aria-checked="true"] {
          background: #a169cf;
        }
        .dock-sw[aria-checked="true"]::after {
          transform: translateX(16px);
        }
      `}</style>

      {/* Ground shadow beneath dock */}
      <div ref={groundRef} className="rubber-ground" aria-hidden="true" />

      {/* Main morphing dock card */}
      <div ref={dockRef} className="rubber-dock">
        {/* Tabs Bar */}
        <div ref={tabsRef} className="rubber-tabs" role="tablist" aria-label="أقسام أمل السريعة">
          {/* Base Muted Icons Layer */}
          <div ref={baseIconsRef} className="dock-icons base">
            {ICONS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-label={isRtl ? item.labelAr : item.labelEn}
                title={isRtl ? `${item.labelAr} (انقر للتوسيع أو التبديل)` : `${item.labelEn} (Click to expand or switch)`}
                aria-selected={activeTab === idx}
                tabIndex={activeTab === idx ? 0 : -1}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTabButtonClick(idx);
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dangerouslySetInnerHTML={{ __html: item.svg }}
                />
              </button>
            ))}
          </div>

          {/* Stretchy Rubber Indicator Pill */}
          <div ref={indRef} className="rubber-indicator" aria-hidden="true" />

          {/* Top Inverted White Icons Layer (Clipped to Pill) */}
          <div ref={topIconsRef} className="dock-icons top" aria-hidden="true">
            {ICONS.map((item) => (
              <div key={`top-${item.id}`}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dangerouslySetInnerHTML={{ __html: item.svg }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Morphing Card Panels */}
        <div ref={panelsRef} className="dock-panels" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
          {/* Panel 0: Overview */}
          <section className="dock-panel" data-i="0">
            <div className="flex items-center justify-between mb-3 dock-it">
              <h3 className="text-sm font-black text-[#170d24] dark:text-[#f4effa]">
                {isRtl ? 'مؤشرات التوازن' : 'Wellness Balance'}
              </h3>
              <span className="text-[11px] font-bold text-[#341d4a] dark:text-primary-300">
                {isRtl ? 'هذا الأسبوع' : 'This Week'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-[#f7f1fc] dark:bg-primary-950/40 p-2.5 rounded-xl border border-[#c9aee6] dark:border-primary-500/20 dock-it">
                <span className="block text-[10.5px] font-bold text-[#341d4a] dark:text-primary-300 mb-1">{isRtl ? 'جلسات الهدوء' : 'Calm'}</span>
                <b className="text-[15px] font-black text-[#170d24] dark:text-white">14</b>
                <em className="not-italic text-[11px] font-black text-emerald-800 dark:text-emerald-400 ms-1">+18%</em>
              </div>
              <div className="bg-[#f7f1fc] dark:bg-primary-950/40 p-2.5 rounded-xl border border-[#c9aee6] dark:border-primary-500/20 dock-it">
                <span className="block text-[10.5px] font-bold text-[#341d4a] dark:text-primary-300 mb-1">{isRtl ? 'معدل الراحة' : 'Score'}</span>
                <b className="text-[15px] font-black text-[#170d24] dark:text-white">86%</b>
                <em className="not-italic text-[11px] font-black text-emerald-800 dark:text-emerald-400 ms-1">+9%</em>
              </div>
              <div className="bg-[#f7f1fc] dark:bg-primary-950/40 p-2.5 rounded-xl border border-[#c9aee6] dark:border-primary-500/20 dock-it">
                <span className="block text-[10.5px] font-bold text-[#341d4a] dark:text-primary-300 mb-1">{isRtl ? 'التقييم' : 'State'}</span>
                <b className="text-[14px] font-black text-emerald-900 dark:text-emerald-400">{isRtl ? 'مطمئن' : 'Stable'}</b>
              </div>
            </div>

            <div className="h-24 bg-[#f7f1fc] dark:bg-primary-950/30 rounded-xl p-2.5 flex items-end gap-1.5 dock-it border border-[#c9aee6] dark:border-primary-500/15">
              {[45, 55, 40, 72, 60, 85, 68, 92, 75, 100, 88, 80].map((val, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex-1 rounded-sm transition-all duration-500',
                    idx === 9 ? 'bg-[#70409a] dark:bg-primary-400' : 'bg-[#a982d6] dark:bg-primary-800/40'
                  )}
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </section>

          {/* Panel 1: Explore */}
          <section className="dock-panel" data-i="1">
            <div className="flex items-center gap-2 h-9 rounded-xl bg-[#f7f1fc] dark:bg-primary-950/40 px-3 mb-2.5 border border-[#b895db] dark:border-primary-500/20 dock-it">
              <svg className="w-4 h-4 text-[#70409a] dark:text-primary-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <span ref={typedRef} className="dock-typed truncate text-xs font-black text-[#170d24] dark:text-white" />
            </div>

            <div className="flex gap-1.5 flex-wrap mb-3 dock-it">
              <button
                type="button"
                onClick={() => navigate(getLocalizedPath('/assessment'))}
                className="text-[11px] font-black px-3 py-1 rounded-full bg-[#ebdcf8] text-[#240e3b] border border-[#b895db] dark:bg-primary-900/60 dark:text-primary-100 hover:bg-[#dfc4f4] transition-colors cursor-pointer"
              >
                {isRtl ? 'التقييم الذاتي' : 'Self Assessment'}
              </button>
              <button
                type="button"
                onClick={() => navigate(getLocalizedPath('/analysis'))}
                className="text-[11px] font-black px-3 py-1 rounded-full bg-[#ebdcf8] text-[#240e3b] border border-[#b895db] dark:bg-primary-900/60 dark:text-primary-100 hover:bg-[#dfc4f4] transition-colors cursor-pointer"
              >
                {isRtl ? 'تحليل المشاعر' : 'Text Analysis'}
              </button>
              <button
                type="button"
                onClick={() => navigate(getLocalizedPath('/support'))}
                className="text-[11px] font-black px-3 py-1 rounded-full bg-[#ebdcf8] text-[#240e3b] border border-[#b895db] dark:bg-primary-900/60 dark:text-primary-100 hover:bg-[#dfc4f4] transition-colors cursor-pointer"
              >
                {isRtl ? 'تمارين الاسترخاء' : 'Breathing'}
              </button>
            </div>

            <div
              onClick={() => navigate(getLocalizedPath('/multimodal'))}
              className="flex items-center gap-2.5 py-2 cursor-pointer group rounded-lg hover:bg-primary-100/70 dark:hover:bg-primary-900/30 px-1.5 transition-colors dock-it"
            >
              <div className="w-8 h-8 rounded-lg bg-[#ebdcf8] dark:bg-primary-900/60 flex items-center justify-center text-primary-800 dark:text-primary-300 shrink-0 group-hover:scale-105 transition-transform text-base border border-[#d8c3ed]">
                🧠
              </div>
              <div className="min-w-0 flex-1">
                <b className="block text-[13px] font-black text-[#170d24] dark:text-[#f4effa] group-hover:text-primary-800 transition-colors">
                  {isRtl ? 'التحليل متعدد الوسائط' : 'Multimodal Analysis'}
                </b>
                <span className="block text-[11px] font-bold text-[#341d4a] dark:text-primary-200/90 truncate">
                  {isRtl ? 'دمج دقيق للغة ونبرة الصوت' : 'Combine text & voice cues'}
                </span>
              </div>
            </div>

            <div
              onClick={() => navigate(getLocalizedPath('/radar'))}
              className="flex items-center gap-2.5 py-2 cursor-pointer group rounded-lg hover:bg-primary-100/70 dark:hover:bg-primary-900/30 px-1.5 transition-colors dock-it"
            >
              <div className="w-8 h-8 rounded-lg bg-[#ebdcf8] dark:bg-primary-900/60 flex items-center justify-center text-primary-800 dark:text-primary-300 shrink-0 group-hover:scale-105 transition-transform text-base border border-[#d8c3ed]">
                📡
              </div>
              <div className="min-w-0 flex-1">
                <b className="block text-[13px] font-black text-[#170d24] dark:text-[#f4effa] group-hover:text-primary-800 transition-colors">
                  {isRtl ? 'رادار الشائعات والتوعية' : 'Rumor Radar'}
                </b>
                <span className="block text-[11px] font-bold text-[#341d4a] dark:text-primary-200/90 truncate">
                  {isRtl ? 'تصحيح المفاهيم النفسية الخاطئة' : 'Verify mental health facts'}
                </span>
              </div>
            </div>
          </section>

          {/* Panel 2: Reminders */}
          <section className="dock-panel" data-i="2">
            <div className="flex items-center justify-between mb-2.5 dock-it">
              <h3 className="text-sm font-black text-[#170d24] dark:text-[#f4effa]">
                {isRtl ? 'المتابعة اليومية' : 'Daily Routine'}
              </h3>
              <span className="text-[11px] text-emerald-900 dark:text-emerald-400 font-black">
                {isRtl ? '3 تنبيهات نشطة' : '3 active'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 py-2 border-b border-[#d8c3ed] dark:border-primary-500/15 dock-it">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <b className="block text-[12.5px] font-black text-[#170d24] dark:text-[#f4effa]">
                  {isRtl ? 'تمرين التنفس الهادئ (4-7-8)' : 'Gentle 4-7-8 Breathing'}
                </b>
                <span className="block text-[11px] font-bold text-[#341d4a] dark:text-primary-200/90 truncate">
                  {isRtl ? 'جلسة سريعة لتخفيف التوتر واستعادة الهدوء' : '5 mins to restore calm'}
                </span>
              </div>
              <time className="text-[11px] font-black text-[#341d4a] dark:text-primary-300">{isRtl ? 'الآن' : 'now'}</time>
            </div>

            <div className="flex items-center gap-2.5 py-2 border-b border-[#d8c3ed] dark:border-primary-500/15 dock-it">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <b className="block text-[12.5px] font-black text-[#170d24] dark:text-[#f4effa]">
                  {isRtl ? 'تسجيل المؤشر اليومي' : 'Daily Check-in'}
                </b>
                <span className="block text-[11px] font-bold text-[#341d4a] dark:text-primary-200/90 truncate">
                  {isRtl ? 'تدوين مشاعرك يدعم مرونتك النفسية' : 'Track your feelings'}
                </span>
              </div>
              <time className="text-[11px] font-black text-[#341d4a] dark:text-primary-300">{isRtl ? '1 س' : '1h'}</time>
            </div>

            <div className="flex items-center gap-2.5 py-2 dock-it">
              <div className="w-2.5 h-2.5 rounded-full bg-primary-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <b className="block text-[12.5px] font-black text-[#170d24] dark:text-[#f4effa]">
                  {isRtl ? 'فكرة اليوم من أمل' : 'Mindful Reflection'}
                </b>
                <span className="block text-[11px] font-bold text-[#341d4a] dark:text-primary-200/90 truncate">
                  {isRtl ? 'الأفكار مجرد مقترحات وليست حقائق' : 'Thoughts are not facts'}
                </span>
              </div>
              <time className="text-[11px] font-black text-[#341d4a] dark:text-primary-300">{isRtl ? 'اليوم' : 'today'}</time>
            </div>
          </section>

          {/* Panel 3: Profile & Settings */}
          <section className="dock-panel" data-i="3">
            <div className="flex items-center gap-3 mb-3 pb-2.5 border-b border-[#d8c3ed] dark:border-primary-500/15 dock-it">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-700 to-primary-900 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'أمل'}
              </div>
              <div className="min-w-0 flex-1">
                <b className="block text-[13.5px] font-black text-[#170d24] dark:text-[#f4effa] truncate">
                  {user?.name || (isRtl ? 'زائر منصة أمل' : 'Amal Guest')}
                </b>
                <span className="block text-[11px] font-bold text-[#341d4a] dark:text-primary-200/90 truncate">
                  {user?.email || (isRtl ? 'جلسة محمية ومجهولة الهوية' : 'Private Anonymous Session')}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center h-9 text-xs font-black text-[#170d24] dark:text-primary-100 dock-it">
              <span>{isRtl ? 'الحركة البطيئة (Slow Motion)' : 'Slow motion motion'}</span>
              <button
                type="button"
                className="dock-sw"
                role="switch"
                aria-checked={slowMotion}
                aria-label="Slow motion"
                onClick={() => setSlowMotion(!slowMotion)}
              />
            </div>

            <div className="flex justify-between items-center h-9 text-xs font-bold text-[#170d24] dark:text-primary-100 dock-it">
              <span>{isRtl ? 'الاهتزاز والتفاعل اللمسي' : 'Haptics'}</span>
              <button
                type="button"
                className="dock-sw"
                role="switch"
                aria-checked={haptics}
                aria-label="Haptics"
                onClick={() => setHaptics(!haptics)}
              />
            </div>

            <div className="flex justify-between items-center h-9 text-xs font-bold text-[#170d24] dark:text-primary-100 dock-it">
              <span>{isRtl ? 'المؤثرات الصوتية' : 'Sounds'}</span>
              <button
                type="button"
                className="dock-sw"
                role="switch"
                aria-checked={sounds}
                aria-label="Sounds"
                onClick={() => setSounds(!sounds)}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
