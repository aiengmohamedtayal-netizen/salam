import { useEffect, useRef, useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Brain,
  FileText,
  Sparkles,
  Mic,
  Radar,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { BrandMark } from '@/components/ui/BrandMark';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Spring helper function matching DesignBookmark Motion tokens.css
 * Width W:        stiffness = 260, damping = 24  (Open: 212px, Collapsed: 64px)
 * Toggle R:       stiffness = 300, damping = 22  (Open: 0,     Collapsed: 1)
 * Highlight Y:    stiffness = 380, damping = 28  (Target: item.offsetTop)
 * Labels s:       stiffness = 300, damping = 26  (Open: 1 [staggered], Collapsed: 0)
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
 * Default product items for أمل (Amal)
 */
export const defaultSidebarItems = [
  { id: 'home', path: '/', labelKey: 'nav.home', icon: Home },
  { id: 'assessment', path: '/assessment', labelKey: 'nav.assessment', icon: Brain },
  { id: 'analysis', path: '/analysis', labelKey: 'nav.textAnalysis', icon: FileText },
  { id: 'multimodal', path: '/multimodal', labelKey: 'nav.multimodal', icon: Sparkles },
  { id: 'voice', path: '/voice', labelKey: 'nav.voice', icon: Mic },
  { id: 'radar', path: '/radar', labelKey: 'nav.radar', icon: Radar },
  { id: 'awareness', path: '/awareness', labelKey: 'nav.awareness', icon: BookOpen },
  { id: 'settings', path: '/settings', labelKey: 'nav.settings', icon: Settings },
];

/**
 * Animated Sidebar Collapse Component
 *
 * Faithfully replicates DesignBookmark's Sidebar Collapse physics and motion:
 * - Physics: Exact spring stiffness and damping (W: 260/24, R: 300/22, Y: 380/28, Labels: 300/26)
 * - Cascading label entrance on expand
 * - Toggle button smoothly morphs and glides to replace the brand logo when collapsed
 * - Interactive highlight following selected item on its own spring
 * - Styled with Amal's Cairo font, Orchid primary palette, surface tokens, and RTL-first support
 */
export function SidebarCollapse({
  items = defaultSidebarItems,
  defaultOpen = true,
  isOpen: controlledOpen,
  onToggle: controlledOnToggle,
  autoPlay = false,
  className = '',
}) {
  const { t, language, direction } = useTranslation();
  const isRTL = direction === 'rtl';
  const location = useLocation();
  const navigate = useNavigate();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

  // Resolve localized URL path
  const getLocalizedPath = (basePath) => {
    const prefix = language === 'en' ? '/en' : '/ar';
    if (basePath === '/') return prefix;
    return `${prefix}${basePath}`;
  };

  // Determine current active index from URL
  const activeIndex = useMemo(() => {
    const currentPath = location.pathname.replace(/^\/(ar|en)/, '') || '/';
    const index = items.findIndex((item) => {
      if (item.path === '/') return currentPath === '/' || currentPath === '';
      return currentPath.startsWith(item.path);
    });
    return index >= 0 ? index : 0;
  }, [location.pathname, items]);

  // DOM Refs
  const sideRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const toggleIconRef = useRef(null);
  const logoRef = useRef(null);
  const highlightRef = useRef(null);
  const itemsContainerRef = useRef(null);
  const itemButtonRefs = useRef([]);
  const labelRefs = useRef([]);

  // Spring physics references (retained across renders)
  const springsRef = useRef({
    // Width spring: 212px open, 64px closed. stiffness: 260, damping: 24
    W: createSpring(defaultOpen ? 212 : 64, 260, 24),
    // Rotation & position spring: 0 open, 1 closed. stiffness: 300, damping: 22
    R: createSpring(defaultOpen ? 0 : 1, 300, 22),
    // Highlight Y spring: tracks active item offsetTop. stiffness: 380, damping: 28
    Y: createSpring(0, 380, 28),
    // Label springs: each label has stiffness: 300, damping: 26
    labels: items.map(() => createSpring(defaultOpen ? 1 : 0, 300, 26)),
  });

  const timersRef = useRef([]);
  const clockRef = useRef(0);
  const userUntilRef = useRef(0);
  const openStateRef = useRef(isOpen);
  openStateRef.current = isOpen;

  // Add scheduled callback in simulation time
  const scheduleAfter = (sec, fn) => {
    timersRef.current.push({ t: sec, fn });
  };

  // Handle open/close state transitions
  const applyOpenState = (nextOpen) => {
    const { W, R, labels } = springsRef.current;
    W.t = nextOpen ? 212 : 64;
    R.t = nextOpen ? 0 : 1;

    // Clear pending label timers
    timersRef.current = [];

    labels.forEach((labelSpring, index) => {
      if (nextOpen) {
        // Cascade stagger entrance when opening: 0.06s + index * 0.04s
        scheduleAfter(0.06 + index * 0.04, () => {
          if (openStateRef.current) {
            labelSpring.t = 1;
          }
        });
      } else {
        // Close together immediately
        labelSpring.t = 0;
      }
    });
  };

  // Sync with controlled / uncontrolled open prop
  useEffect(() => {
    applyOpenState(isOpen);
  }, [isOpen]);

  // Sync highlight Y target with activeIndex
  useEffect(() => {
    const el = itemButtonRefs.current[activeIndex];
    if (el) {
      springsRef.current.Y.t = el.offsetTop;
    }
  }, [activeIndex]);

  // Main animation frame loop with 4 sub-steps for stability
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const frameLoop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      clockRef.current += dt;

      // Update simulation timers
      for (let i = timersRef.current.length - 1; i >= 0; i--) {
        timersRef.current[i].t -= dt;
        if (timersRef.current[i].t <= 0) {
          const item = timersRef.current.splice(i, 1)[0];
          if (item?.fn) item.fn();
        }
      }

      // Step physics springs (4 sub-steps for smooth numerical integration)
      const sub = 4;
      const subDt = dt / sub;
      const { W, R, Y, labels } = springsRef.current;

      for (let s = 0; s < sub; s++) {
        stepSpring(W, subDt);
        stepSpring(R, subDt);
        stepSpring(Y, subDt);
        labels.forEach((l) => stepSpring(l, subDt));
      }

      // Render to DOM styles directly for peak 60/120fps performance
      if (sideRef.current) {
        sideRef.current.style.width = `${W.x.toFixed(2)}px`;
      }

      const rClamped = clamp(R.x, 0, 1);

      if (toggleBtnRef.current) {
        // Smoothly position toggle button
        if (isRTL) {
          // In RTL, toggle is on the left (or start), transitions towards the logo position
          toggleBtnRef.current.style.left = `${(rClamped * 4).toFixed(2)}px`;
        } else {
          toggleBtnRef.current.style.right = `${(rClamped * 4).toFixed(2)}px`;
        }
      }

      if (toggleIconRef.current) {
        // Toggle chevron flips 180 degrees
        const angle = isRTL ? -180 * R.x : 180 * R.x;
        toggleIconRef.current.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      }

      if (logoRef.current) {
        // As it collapses, toggle smoothly takes the logo's place
        logoRef.current.style.opacity = clamp(1 - R.x * 2, 0, 1).toFixed(3);
      }

      // Staggered label slide and opacity
      labels.forEach((labelSpring, index) => {
        const el = labelRefs.current[index];
        if (el) {
          const o = clamp(labelSpring.x, 0, 1);
          el.style.opacity = o.toFixed(3);
          const offset = (1 - o) * (isRTL ? 10 : -10);
          el.style.transform = `translateX(${offset.toFixed(2)}px)`;
        }
      });

      if (highlightRef.current) {
        highlightRef.current.style.transform = `translateY(${Y.x.toFixed(2)}px)`;
      }

      animId = requestAnimationFrame(frameLoop);
    };

    animId = requestAnimationFrame(frameLoop);
    return () => cancelAnimationFrame(animId);
  }, [isRTL]);

  // Initial highlight position setup
  useEffect(() => {
    const el = itemButtonRefs.current[activeIndex];
    if (el) {
      springsRef.current.Y.x = el.offsetTop;
      springsRef.current.Y.t = el.offsetTop;
    }
  }, []);

  // Handle user interaction
  const handleToggle = () => {
    userUntilRef.current = clockRef.current + 8;
    const next = !isOpen;
    if (controlledOnToggle) {
      controlledOnToggle(next);
    } else {
      setUncontrolledOpen(next);
    }
  };

  const handleItemClick = (index, path) => {
    userUntilRef.current = clockRef.current + 8;
    const targetEl = itemButtonRefs.current[index];
    if (targetEl) {
      springsRef.current.Y.t = targetEl.offsetTop;
    }
    navigate(getLocalizedPath(path));
  };

  return (
    <aside
      ref={sideRef}
      id="amal-sidebar"
      aria-label={t('nav.openMenu')}
      className={cn(
        'relative h-fit max-h-[calc(100vh-2rem)] select-none overflow-hidden',
        'p-[10px] rounded-[24px]',
        'bg-surface-card border border-surface-border shadow-md',
        'text-text-primary font-cairo transition-colors duration-200',
        className
      )}
      style={{ width: `${defaultOpen ? 212 : 64}px` }}
    >
      {/* Top Header Bar */}
      <div className="relative flex items-center h-[44px] px-[6px] mb-[6px]">
        {/* Brand Logo & Mark */}
        <div
          ref={logoRef}
          className="w-[28px] h-[28px] rounded-[9px] flex items-center justify-center shrink-0 bg-primary-100 dark:bg-primary-900/50 border border-primary-200/50 dark:border-primary-700/50 shadow-sm"
        >
          <BrandMark className="w-[20px] h-[20px]" />
        </div>

        {/* Brand Text */}
        <span
          ref={(el) => (labelRefs.current[items.length] = el)}
          className="lb ms-[10px] text-[15px] font-bold text-text-primary whitespace-nowrap overflow-hidden inline-block"
        >
          {t('common.brandName')}
        </span>

        {/* Collapse / Expand Toggle Button */}
        <button
          ref={toggleBtnRef}
          type="button"
          onClick={handleToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          className={cn(
            'col absolute top-[4px] w-[36px] h-[36px] rounded-[12px]',
            isRTL ? 'left-0' : 'right-0',
            'grid place-items-center cursor-pointer',
            'bg-surface-muted hover:bg-primary-100 dark:hover:bg-primary-900/60',
            'text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary-500'
          )}
        >
          <span ref={toggleIconRef} className="grid place-items-center will-change-transform">
            {isRTL ? (
              <ChevronRight className="w-[18px] h-[18px] stroke-[2.2]" />
            ) : (
              <ChevronLeft className="w-[18px] h-[18px] stroke-[2.2]" />
            )}
          </span>
        </button>
      </div>

      {/* Navigation Items List */}
      <nav
        ref={itemsContainerRef}
        aria-label="Sidebar navigation"
        className="relative flex flex-col gap-[2px]"
      >
        {/* Dynamic Highlight Pill */}
        <span
          ref={highlightRef}
          aria-hidden="true"
          className="hl absolute inset-x-0 top-0 h-[44px] rounded-[14px] bg-primary-100/90 dark:bg-primary-900/40 pointer-events-none will-change-transform transition-[background-color]"
        />

        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;

          return (
            <button
              key={item.id}
              ref={(el) => (itemButtonRefs.current[index] = el)}
              type="button"
              onClick={() => handleItemClick(index, item.path)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'it relative z-10 flex items-center h-[44px] px-[11px] rounded-[14px] border-0 bg-transparent cursor-pointer',
                'text-[14px] font-medium whitespace-nowrap text-start w-full',
                'transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                isActive
                  ? 'text-primary-700 dark:text-primary-300 font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <Icon className="w-[22px] h-[22px] shrink-0 stroke-[1.9]" aria-hidden="true" />
              <span
                ref={(el) => (labelRefs.current[index] = el)}
                className="lb ms-[12px] inline-block whitespace-nowrap will-change-transform"
              >
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default SidebarCollapse;
