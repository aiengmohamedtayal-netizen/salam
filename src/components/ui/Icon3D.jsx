import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * 3D Claymorphic Icon System
 * High-definition, smooth 3D rendered icons with consistent lighting and playful tech aesthetics.
 */
export const ICONS_3D = {
  brain: '/icons/3d/brain.png',
  chat: '/icons/3d/chat.png',
  analytics: '/icons/3d/analytics.png',
  lightbulb: '/icons/3d/lightbulb.png',
  shield: '/icons/3d/shield.png',
  language: '/icons/3d/language.png',
  gauge: '/icons/3d/gauge.png',
  clipboard: '/icons/3d/clipboard.png',
  robot: '/icons/3d/robot.png',
  community: '/icons/3d/community.png',
  graduation: '/icons/3d/graduation.png',
  care: '/icons/3d/care.png',
  growth: '/icons/3d/growth.png',
  books: '/icons/3d/books.png',
  calendar: '/icons/3d/calendar.png',
  location: '/icons/3d/location.png',
  notepad: '/icons/3d/notepad.png',
  meditation: '/icons/3d/meditation.png',
  heartbeat: '/icons/3d/heartbeat.png',
  lifebuoy: '/icons/3d/lifebuoy.png',
};

// Aliases for Lucide / semantic names
export const ICON_ALIAS_MAP = {
  // Brand & Thought
  Brain: 'brain',
  brain: 'brain',
  Mind: 'brain',
  Psychology: 'brain',

  // Language & Translation
  Languages: 'language',
  language: 'language',
  Translate: 'language',
  Globe: 'language',

  // Security & Privacy
  Shield: 'shield',
  shield: 'shield',
  ShieldCheck: 'shield',
  ShieldAlert: 'shield',
  Lock: 'shield',
  Privacy: 'shield',
  Security: 'shield',

  // Chat & Communication
  MessageSquare: 'chat',
  MessageSquareQuote: 'chat',
  MessageCircle: 'chat',
  chat: 'chat',
  Messages: 'chat',

  // Robot & AI Radar
  Bot: 'robot',
  robot: 'robot',
  Radar: 'robot',
  Ai: 'robot',
  Sparkles: 'lightbulb',
  lightbulb: 'lightbulb',
  Idea: 'lightbulb',

  // Analytics & Reports
  analytics: 'analytics',
  BarChart: 'analytics',
  PieChart: 'analytics',
  Search: 'analytics',
  AssessmentResult: 'analytics',

  // Gauge & Sentiment/Mood
  gauge: 'gauge',
  Activity: 'gauge',
  Speedometer: 'gauge',
  Mood: 'gauge',

  // Clipboard & Assessment
  clipboard: 'clipboard',
  FileText: 'clipboard',
  CheckSquare: 'clipboard',
  Checklist: 'clipboard',

  // Community & Family
  community: 'community',
  Users: 'community',
  UserCheck: 'community',
  Group: 'community',

  // Education & Academic
  graduation: 'graduation',
  GraduationCap: 'graduation',
  Award: 'graduation',
  Education: 'graduation',

  // Care & Empathy
  care: 'care',
  HeartHandshake: 'care',
  Support: 'care',
  Empathy: 'care',

  // Growth & Awareness
  growth: 'growth',
  Plant: 'growth',
  Sprout: 'growth',

  // Books & Library
  books: 'books',
  BookOpen: 'books',
  Library: 'books',
  Articles: 'books',

  // Calendar & Scheduling
  calendar: 'calendar',
  Calendar: 'calendar',
  Clock: 'calendar',
  Appointment: 'calendar',

  // Location & Clinics
  location: 'location',
  MapPin: 'location',
  Compass: 'location',
  Map: 'location',

  // Notepad & Journaling
  notepad: 'notepad',
  Edit3: 'notepad',
  PenTool: 'notepad',
  Write: 'notepad',

  // Meditation & Breathing / Grounding
  meditation: 'meditation',
  Wind: 'meditation',
  Relax: 'meditation',
  Zen: 'meditation',

  // Heartbeat & Vitals
  heartbeat: 'heartbeat',
  Heart: 'heartbeat',
  Pulse: 'heartbeat',
  Health: 'heartbeat',

  // Lifebuoy & Emergency Helpline
  lifebuoy: 'lifebuoy',
  LifeBuoy: 'lifebuoy',
  PhoneCall: 'lifebuoy',
  HelpCircle: 'lifebuoy',
  Emergency: 'lifebuoy',
  Sos: 'lifebuoy',
};

const SIZE_VARIANTS = {
  xs: 'w-4 h-4 min-w-4 min-h-4',
  sm: 'w-5 h-5 min-w-5 min-h-5',
  md: 'w-7 h-7 min-w-7 min-h-7',
  lg: 'w-9 h-9 min-w-9 min-h-9',
  xl: 'w-12 h-12 min-w-12 min-h-12',
  '2xl': 'w-16 h-16 min-w-16 min-h-16',
  '3xl': 'w-20 h-20 min-w-20 min-h-20',
};

export const Icon3D = forwardRef(function Icon3D(
  {
    name,
    size = 'md',
    className,
    alt = '',
    glow = true,
    animated = false,
    ...props
  },
  ref
) {
  const iconKey = ICON_ALIAS_MAP[name] || name;
  const iconSrc = ICONS_3D[iconKey] || ICONS_3D.brain;
  const sizeClasses = SIZE_VARIANTS[size] || size;

  return (
    <img
      ref={ref}
      src={iconSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      aria-hidden={!alt}
      className={cn(
        'inline-block object-contain select-none shrink-0 pointer-events-none transition-transform duration-200',
        glow && 'filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.06)]',
        animated && 'hover:scale-110 active:scale-95 cursor-pointer pointer-events-auto',
        sizeClasses,
        className
      )}
      {...props}
    />
  );
});

// Named exports for convenient direct usage
export const Icon3DBrain = (props) => <Icon3D name="brain" {...props} />;
export const Icon3DChat = (props) => <Icon3D name="chat" {...props} />;
export const Icon3DAnalytics = (props) => <Icon3D name="analytics" {...props} />;
export const Icon3DLightbulb = (props) => <Icon3D name="lightbulb" {...props} />;
export const Icon3DShield = (props) => <Icon3D name="shield" {...props} />;
export const Icon3DLanguage = (props) => <Icon3D name="language" {...props} />;
export const Icon3DGauge = (props) => <Icon3D name="gauge" {...props} />;
export const Icon3DClipboard = (props) => <Icon3D name="clipboard" {...props} />;
export const Icon3DRobot = (props) => <Icon3D name="robot" {...props} />;
export const Icon3DCommunity = (props) => <Icon3D name="community" {...props} />;
export const Icon3DGraduation = (props) => <Icon3D name="graduation" {...props} />;
export const Icon3DCare = (props) => <Icon3D name="care" {...props} />;
export const Icon3DGrowth = (props) => <Icon3D name="growth" {...props} />;
export const Icon3DBooks = (props) => <Icon3D name="books" {...props} />;
export const Icon3DCalendar = (props) => <Icon3D name="calendar" {...props} />;
export const Icon3DLocation = (props) => <Icon3D name="location" {...props} />;
export const Icon3DNotepad = (props) => <Icon3D name="notepad" {...props} />;
export const Icon3DMeditation = (props) => <Icon3D name="meditation" {...props} />;
export const Icon3DHeartbeat = (props) => <Icon3D name="heartbeat" {...props} />;
export const Icon3DLifebuoy = (props) => <Icon3D name="lifebuoy" {...props} />;
