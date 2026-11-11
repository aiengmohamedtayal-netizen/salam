import { forwardRef } from 'react';
import {
  Brain,
  MessageSquare,
  BarChart3,
  Sparkles,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Activity,
  ClipboardCheck,
  Bot,
  Users,
  GraduationCap,
  HeartHandshake,
  Sprout,
  BookOpen,
  Calendar,
  MapPin,
  Edit3,
  Wind,
  HeartPulse,
  LifeBuoy,
  Lock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ICONS_3D } from '@/components/ui/Icon3D';

/**
 * Premium AppIcon System
 * Inspired by Iconsax (Two-Tone, Linear, Bulk) and Apple Human Interface Guidelines (HIG).
 *
 * Guarantees:
 * - Pixel-perfect SVG vector rendering (zero raster blur, zero dirty white halos).
 * - Multi-tone depth with AMAL theme colors (Teal, Purple, Amber, Emerald, Rose).
 * - Full scalability across light and dark modes with currentColor support.
 */

// Vector glyph mappings
export const VECTOR_GLYPHS = {
  brain: Brain,
  chat: MessageSquare,
  analytics: BarChart3,
  lightbulb: Sparkles,
  idea: Lightbulb,
  shield: Shield,
  shieldCheck: ShieldCheck,
  shieldAlert: ShieldAlert,
  language: Globe,
  gauge: Activity,
  clipboard: ClipboardCheck,
  robot: Bot,
  community: Users,
  graduation: GraduationCap,
  care: HeartHandshake,
  growth: Sprout,
  books: BookOpen,
  calendar: Calendar,
  location: MapPin,
  notepad: Edit3,
  meditation: Wind,
  heartbeat: HeartPulse,
  lifebuoy: LifeBuoy,
  lock: Lock,
  check: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

// Color palettes for Two-Tone styles
export const ICON_THEMES = {
  teal: {
    primary: 'text-teal-600 dark:text-teal-400',
    secondary: 'text-teal-500/30 dark:text-teal-400/30',
    bg: 'bg-teal-500/10 border-teal-500/20 text-teal-700 dark:text-teal-300',
  },
  purple: {
    primary: 'text-purple-600 dark:text-purple-400',
    secondary: 'text-purple-500/30 dark:text-purple-400/30',
    bg: 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300',
  },
  rose: {
    primary: 'text-rose-600 dark:text-rose-400',
    secondary: 'text-rose-500/30 dark:text-rose-400/30',
    bg: 'bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300',
  },
  amber: {
    primary: 'text-amber-600 dark:text-amber-400',
    secondary: 'text-amber-500/30 dark:text-amber-400/30',
    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300',
  },
  emerald: {
    primary: 'text-emerald-600 dark:text-emerald-400',
    secondary: 'text-emerald-500/30 dark:text-emerald-400/30',
    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  },
  sky: {
    primary: 'text-sky-600 dark:text-sky-400',
    secondary: 'text-sky-500/30 dark:text-sky-400/30',
    bg: 'bg-sky-500/10 border-sky-500/20 text-sky-700 dark:text-sky-300',
  },
  neutral: {
    primary: 'text-text-primary',
    secondary: 'text-text-muted/40',
    bg: 'bg-surface-elevated border-surface-border text-text-primary',
  },
};

const DEFAULT_THEME_FOR_ICON = {
  shield: 'teal',
  shieldCheck: 'teal',
  shieldAlert: 'teal',
  brain: 'purple',
  care: 'purple',
  meditation: 'teal',
  chat: 'purple',
  analytics: 'sky',
  lightbulb: 'amber',
  growth: 'emerald',
  books: 'purple',
  calendar: 'sky',
  location: 'rose',
  notepad: 'amber',
  heartbeat: 'rose',
  lifebuoy: 'rose',
  robot: 'purple',
  community: 'teal',
  graduation: 'purple',
  language: 'teal',
  warning: 'amber',
  error: 'rose',
  success: 'emerald',
  info: 'sky',
};

const SIZES = {
  xs: 'w-4 h-4 min-w-4 min-h-4',
  sm: 'w-5 h-5 min-w-5 min-h-5',
  md: 'w-6 h-6 min-w-6 min-h-6',
  lg: 'w-8 h-8 min-w-8 min-h-8',
  xl: 'w-12 h-12 min-w-12 min-h-12',
  '2xl': 'w-16 h-16 min-w-16 min-h-16',
};

export const AppIcon = forwardRef(function AppIcon(
  {
    name,
    style = 'two-tone', // 'two-tone' | 'linear' | 'bold' | '3d'
    size = 'md',
    theme,
    tile = false, // wrap in an Iconsax squircle tile badge
    className,
    alt = '',
    ...props
  },
  ref
) {
  const normName = (name || 'brain').toLowerCase().replace(/[-_]/g, '');
  
  // Resolve alias
  let key = normName;
  for (const k in VECTOR_GLYPHS) {
    if (k.toLowerCase() === normName) {
      key = k;
      break;
    }
  }

  // 1. If 3D style is explicitly requested, render the defringed 3D asset
  if (style === '3d') {
    const src = ICONS_3D[key] || ICONS_3D.brain;
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn(
          'inline-block object-contain select-none shrink-0 drop-shadow-xs transition-transform duration-200',
          SIZES[size] || size,
          className
        )}
        {...props}
      />
    );
  }

  // 2. Vector rendering (Two-Tone or Linear)
  const Glyph = VECTOR_GLYPHS[key] || Brain;
  const themeName = theme || DEFAULT_THEME_FOR_ICON[key] || 'purple';
  const palette = ICON_THEMES[themeName] || ICON_THEMES.neutral;
  const sizeClass = SIZES[size] || size;

  const iconElement = (
    <div
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none',
        style === 'two-tone' && palette.primary,
        className
      )}
      {...props}
    >
      {/* Background duotone accent for Iconsax Two-Tone style */}
      {style === 'two-tone' && (
        <Glyph
          className={cn(
            'absolute inset-0 w-full h-full scale-110 blur-[1px] opacity-25',
            palette.primary
          )}
          strokeWidth={3.5}
          aria-hidden="true"
        />
      )}
      <Glyph
        className={cn('relative', sizeClass)}
        strokeWidth={style === 'bold' ? 2.5 : 1.85}
        aria-hidden="true"
      />
    </div>
  );

  // If tile wrapping requested (Apple HIG / Iconsax Squircle Badge)
  if (tile) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-xl border p-2 shadow-xs transition-colors shrink-0',
          palette.bg
        )}
      >
        {iconElement}
      </div>
    );
  }

  return iconElement;
});

export default AppIcon;
