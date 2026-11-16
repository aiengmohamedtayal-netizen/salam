import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  X,
  Minus,
  Maximize2,
  Copy,
  Check,
  RefreshCw,
  Wind,
  HeartHandshake,
  ShieldCheck,
  Sprout,
  Sun,
  Edit3,
  Layers,
  Heart,
  Quote,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { MINDFUL_TIPS } from '@/data/mindfulTips';
import { NotificationStack } from '@/components/ui/NotificationStack';
import { getGeneratedMindfulTips } from '@/services/amalApi';

const ROTATION_INTERVAL_MS = 10000; // 10 seconds per tip

const THEME_ICONS = {
  wind: Wind,
  heart: Heart,
  sparkles: Sparkles,
  shield: ShieldCheck,
  sprout: Sprout,
  sun: Sun,
  edit: Edit3,
  care: HeartHandshake,
};

const THEME_STYLES = {
  teal: {
    badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20',
    iconBg: 'bg-teal-600 text-white',
    pillBorder: 'border-teal-500/30',
    progress: 'bg-teal-500',
  },
  purple: {
    badge: 'bg-primary-500/10 text-primary-700 dark:text-primary-300 border-primary-500/20',
    iconBg: 'bg-primary-600 text-white',
    pillBorder: 'border-primary-500/30',
    progress: 'bg-primary-500',
  },
  rose: {
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
    iconBg: 'bg-rose-600 text-white',
    pillBorder: 'border-rose-500/30',
    progress: 'bg-rose-500',
  },
  amber: {
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
    iconBg: 'bg-amber-500 text-white',
    pillBorder: 'border-amber-500/30',
    progress: 'bg-amber-500',
  },
  emerald: {
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    iconBg: 'bg-emerald-600 text-white',
    pillBorder: 'border-emerald-500/30',
    progress: 'bg-emerald-500',
  },
};

export function MindfulNotificationIsland() {
  const { isAr } = useTranslation();
  const [tips, setTips] = useState(MINDFUL_TIPS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);

  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      return localStorage.getItem('amal_tips_minimized') === 'true';
    } catch {
      return false;
    }
  });
  const [viewMode, setViewMode] = useState('island'); // 'island' | 'stack'
  const [selectedTipForModal, setSelectedTipForModal] = useState(null);
  const [copied, setCopied] = useState(false);

  // Safe index resolution
  const safeIndex = tips.length > 0 ? Math.min(currentIndex, tips.length - 1) : 0;
  const currentTip = tips[safeIndex] || MINDFUL_TIPS[0];
  const theme = THEME_STYLES[currentTip.theme] || THEME_STYLES.purple;
  const IconComponent = THEME_ICONS[currentTip.iconName] || Sparkles;

  /**
   * Automatically generate more tips using SovereignEG when stock is low or ended.
   */
  const fetchMoreTips = useCallback(async (silent = false) => {
    if (isGeneratingRef.current) return null;
    isGeneratingRef.current = true;
    setIsGenerating(true);

    try {
      const newTips = await getGeneratedMindfulTips(2);
      if (Array.isArray(newTips) && newTips.length > 0) {
        setTips((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const uniqueNewTips = newTips.filter((t) => !existingIds.has(t.id));
          return uniqueNewTips.length > 0 ? [...prev, ...uniqueNewTips] : prev;
        });
        return newTips;
      }
    } catch (err) {
      if (!silent) {
        console.warn('SovereignEG tips generation error:', err);
      }
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
    return null;
  }, []);

  // Pre-fetch next tips when approaching the end of current stock
  useEffect(() => {
    if (currentIndex >= tips.length - 2 && !isGeneratingRef.current) {
      fetchMoreTips(true);
    }
  }, [currentIndex, tips.length, fetchMoreTips]);

  // Auto-rotation timer
  useEffect(() => {
    if (isPaused || isHovered || isMinimized || selectedTipForModal || viewMode === 'stack') {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        // If at the last tip, check if new tips are ready
        if (prev >= tips.length - 1) {
          if (!isGeneratingRef.current) {
            fetchMoreTips(true).then((newBatch) => {
              if (newBatch && newBatch.length > 0) {
                setCurrentIndex(prev + 1);
              }
            });
          }
          // Wrap around safely if still generating
          return (prev + 1) % tips.length;
        }
        return prev + 1;
      });
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isPaused, isHovered, isMinimized, selectedTipForModal, viewMode, tips.length, fetchMoreTips]);

  const handleNext = async (e) => {
    e?.stopPropagation();

    // Reached or approaching the end of current stock
    if (currentIndex >= tips.length - 1) {
      if (!isGeneratingRef.current) {
        const newBatch = await fetchMoreTips(false);
        if (newBatch && newBatch.length > 0) {
          setCurrentIndex(tips.length);
          return;
        }
      }
      // If generation is pending or failed, loop back
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const toggleMinimize = (e) => {
    e?.stopPropagation();
    setIsMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('amal_tips_minimized', String(next));
      } catch {}
      return next;
    });
  };

  const handleCopyQuote = (e) => {
    e?.stopPropagation();
    const textToCopy = `«${isAr ? currentTip.quote : currentTip.quoteEn}» — منصة أمل للوعي النفسي`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert current tips into Kokonut UI Stack format when expanded
  const stackItems = tips.slice(0, 15).map((tip) => {
    const TipIcon = THEME_ICONS[tip.iconName] || Sparkles;
    const itemTheme = THEME_STYLES[tip.theme] || THEME_STYLES.purple;
    return {
      id: tip.id,
      app: isAr ? tip.category : tip.categoryEn,
      appEn: tip.categoryEn,
      title: isAr ? tip.title : tip.titleEn,
      titleEn: tip.titleEn,
      body: isAr ? tip.quote : tip.quoteEn,
      bodyEn: tip.quoteEn,
      time: tip.isAiGenerated
        ? (isAr ? '✨ SovereignEG' : '✨ SovereignEG')
        : (isAr ? 'ومضة يومية' : 'Daily Insight'),
      timeEn: tip.isAiGenerated ? '✨ SovereignEG' : 'Daily Insight',
      icon: (
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg shadow-xs', itemTheme.iconBg)}>
          <TipIcon className="size-4" />
        </span>
      ),
      rawTip: tip,
    };
  });

  return (
    <>
      {/* Floating Island Container Pinned at Top Center */}
      <aside
        aria-label={isAr ? 'نظام إشعارات الوعي النفسي' : 'Mindful Notifications'}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[94vw] sm:w-[560px] pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          {/* 1. Minimized Pill Mode */}
          {isMinimized ? (
            <motion.div
              key="minimized"
              initial={{ opacity: 0, y: -16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className="flex justify-center"
            >
              <button
                type="button"
                onClick={toggleMinimize}
                className={cn(
                  'group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full',
                  'bg-surface-elevated/95 dark:bg-surface-card/95 backdrop-blur-md',
                  'border border-primary-500/30 shadow-lg hover:shadow-xl',
                  'text-xs font-bold text-text-primary transition-all duration-200',
                  'hover:border-primary-500 hover:scale-105 cursor-pointer'
                )}
                title={isAr ? 'توسيع شريط نصائح أمل المعلق' : 'Expand Mindful Wisdom Island'}
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-primary-600 text-white shadow-xs">
                  <Sparkles className="size-3 animate-spin-slow" />
                </span>
                <span>{isAr ? 'ومضة وعي نفسي' : 'Mindful Insight'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-mono">
                  {safeIndex + 1}/{tips.length}
                </span>
                {isGenerating && (
                  <Loader2 className="size-3 animate-spin text-primary-500" />
                )}
              </button>
            </motion.div>
          ) : viewMode === 'stack' ? (
            /* 2. Expanded Kokonut UI Notification Stack Popup */
            <motion.div
              key="stack-mode"
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 480, damping: 35 }}
              className="rounded-3xl bg-surface-elevated/95 dark:bg-surface-card/95 backdrop-blur-xl border border-surface-border shadow-2xl p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-primary-600 text-white shadow-xs">
                    <Layers className="size-3.5" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-text-primary">
                    {isAr ? 'حزمة نصائح أمل للوعي النفسي' : 'AMAL Wisdom Stack'}
                  </span>
                  <span className="text-[11px] text-text-muted font-mono">
                    ({tips.length} {isAr ? 'نصيحة' : 'insights'})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('island')}
                    className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                    title={isAr ? 'العودة للشريط المعلق' : 'Return to compact island'}
                  >
                    <Minus className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleMinimize}
                    className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                    title={isAr ? 'تصغير' : 'Minimize'}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Embedded NotificationStack with Real Swipe Dismiss & Springs */}
              <div className="pt-1">
                <NotificationStack
                  items={stackItems}
                  onCardClick={(item) => {
                    if (item.rawTip) {
                      setSelectedTipForModal(item.rawTip);
                    }
                  }}
                  onDismiss={(id) => {
                    setTips((prev) => prev.filter((t) => t.id !== id));
                  }}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-text-muted border-t border-surface-border/60">
                <button
                  type="button"
                  onClick={() => fetchMoreTips(false)}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 font-bold text-primary-700 hover:text-primary-800 dark:text-primary-400 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5 text-primary-500" />
                  )}
                  <span>
                    {isGenerating
                      ? (isAr ? 'جارٍ التوليد بواسطة SovereignEG...' : 'Generating via SovereignEG...')
                      : (isAr ? 'توليد نصائح SovereignEG' : 'Generate AI Tips')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTips(MINDFUL_TIPS);
                    setCurrentIndex(0);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  <RefreshCw className="size-3" />
                  <span>{isAr ? 'استعادة الافتراضية' : 'Reset default'}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* 3. Suspended Sleek Island Bar (Default Pinned State) */
            <motion.div
              key="island-mode"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              onClick={() => setSelectedTipForModal(currentTip)}
              className={cn(
                'group relative rounded-2xl sm:rounded-full px-3 py-2 sm:py-2.5',
                'bg-surface-elevated/95 dark:bg-surface-card/95 backdrop-blur-xl',
                'border border-primary-500/25 dark:border-primary-400/20',
                'shadow-lg hover:shadow-2xl transition-all duration-300',
                'cursor-pointer select-none overflow-hidden'
              )}
            >
              <div className="flex items-center justify-between gap-2.5">
                {/* Left: Thematic Glowing Icon + Category Badge + AI Indicator */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={cn(
                      'flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full shadow-xs transition-transform duration-200 group-hover:scale-110',
                      theme.iconBg
                    )}
                  >
                    <IconComponent className="size-3.5 sm:size-4" />
                  </div>
                  <span className={cn('hidden xs:inline-block text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border', theme.badge)}>
                    {isAr ? currentTip.category : currentTip.categoryEn}
                  </span>
                  {currentTip.isAiGenerated && (
                    <span
                      className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500/15 to-teal-500/15 border border-purple-500/30 text-primary-700 dark:text-primary-300 shadow-2xs"
                      title={isAr ? 'تم استلهام هذه النصيحة بواسطة موديل SovereignEG' : 'Generated by SovereignEG'}
                    >
                      <Sparkles className="size-2.5 text-primary-500 animate-spin-slow" />
                      <span>SovereignEG</span>
                    </span>
                  )}
                </div>

                {/* Center: Dynamic Animated Rotating Quote or Loading State */}
                <div className="flex-1 min-w-0 px-1">
                  {isGenerating && currentIndex >= tips.length - 1 ? (
                    <div className="flex items-center gap-1.5 text-xs sm:text-[13px] text-primary-700 dark:text-primary-300 font-semibold animate-pulse truncate">
                      <Loader2 className="size-3.5 animate-spin text-primary-500 shrink-0" />
                      <span className="truncate">
                        {isAr
                          ? '✨ يستلهم موديل SovereignEG نصائح جديدة الآن...'
                          : '✨ SovereignEG is inspiring fresh tips...'}
                      </span>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentTip.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-1.5 text-xs sm:text-[13px] text-text-primary tracking-tight font-medium truncate"
                      >
                        <span className="font-bold text-primary-700 dark:text-primary-300 shrink-0">
                          {isAr ? currentTip.title : currentTip.titleEn}:
                        </span>
                        <span className="text-text-secondary truncate">
                          «{isAr ? currentTip.quote : currentTip.quoteEn}»
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>

                {/* Right: Interactive Controls Pill */}
                <div
                  className="flex items-center gap-0.5 sm:gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                    title={isAr ? 'السابقة' : 'Previous'}
                  >
                    <ChevronRight className="size-3.5 rtl:rotate-0 rotate-180" />
                  </button>

                  {/* Play / Pause Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsPaused((p) => !p)}
                    className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                    title={isPaused ? (isAr ? 'تشغيل' : 'Play') : (isAr ? 'إيقاف مؤقت' : 'Pause')}
                  >
                    {isPaused ? <Play className="size-3" /> : <Pause className="size-3" />}
                  </button>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isGenerating && currentIndex >= tips.length - 1}
                    className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer disabled:opacity-40"
                    title={isAr ? 'التالية' : 'Next'}
                  >
                    <ChevronLeft className="size-3.5 rtl:rotate-0 rotate-180" />
                  </button>

                  {/* Manual SovereignEG Generate Trigger */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchMoreTips(false);
                    }}
                    disabled={isGenerating}
                    className={cn(
                      'p-1 rounded-full transition-colors cursor-pointer',
                      isGenerating
                        ? 'text-primary-400 animate-spin'
                        : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/60'
                    )}
                    title={
                      isGenerating
                        ? (isAr ? 'جارٍ التوليد بواسطة SovereignEG...' : 'Generating via SovereignEG...')
                        : (isAr ? 'توليد نصائح جديدة بواسطة SovereignEG' : 'Generate new tips via SovereignEG')
                    }
                  >
                    {isGenerating ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                  </button>

                  {/* Expand to Stack */}
                  <button
                    type="button"
                    onClick={() => setViewMode('stack')}
                    className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                    title={isAr ? 'عرض الحزمة التراكمية' : 'Open stack'}
                  >
                    <Layers className="size-3.5" />
                  </button>

                  {/* Open Modal Detail */}
                  <button
                    type="button"
                    onClick={() => setSelectedTipForModal(currentTip)}
                    className="p-1 rounded-full text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/60 transition-colors cursor-pointer"
                    title={isAr ? 'فتح التفاصيل والتمرين (Popup)' : 'Open detail modal'}
                  >
                    <Maximize2 className="size-3.5" />
                  </button>

                  {/* Minimize */}
                  <button
                    type="button"
                    onClick={toggleMinimize}
                    className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                    title={isAr ? 'تصغير' : 'Minimize'}
                  >
                    <Minus className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Ultra-subtle Progress Bar along the bottom of the pill */}
              {!isPaused && !isHovered && !isGenerating && (
                <motion.div
                  key={currentTip.id}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: ROTATION_INTERVAL_MS / 1000, ease: 'linear' }}
                  className={cn('absolute bottom-0 start-0 h-[2px] opacity-80', theme.progress)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* 4. Detailed Wisdom Popup Dialog / Modal */}
      <AnimatePresence>
        {selectedTipForModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTipForModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl bg-surface-card border border-surface-border shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="wisdom-title"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex size-11 items-center justify-center rounded-2xl shadow-md',
                      THEME_STYLES[selectedTipForModal.theme]?.iconBg || 'bg-primary-600 text-white'
                    )}
                  >
                    {(() => {
                      const ModalIcon = THEME_ICONS[selectedTipForModal.iconName] || Sparkles;
                      return <ModalIcon className="size-6" />;
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-bold px-2.5 py-0.5 rounded-full border',
                          THEME_STYLES[selectedTipForModal.theme]?.badge
                        )}
                      >
                        {isAr ? selectedTipForModal.category : selectedTipForModal.categoryEn}
                      </span>
                      {selectedTipForModal.isAiGenerated && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/15 to-teal-500/15 border border-purple-500/30 text-primary-700 dark:text-primary-300">
                          <Sparkles className="size-2.5 text-primary-500 animate-spin-slow" />
                          <span>SovereignEG</span>
                        </span>
                      )}
                    </div>
                    <h3 id="wisdom-title" className="text-lg sm:text-xl font-black text-text-primary tracking-tight mt-1">
                      {isAr ? selectedTipForModal.title : selectedTipForModal.titleEn}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTipForModal(null)}
                  className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                  aria-label={isAr ? 'إغلاق' : 'Close'}
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* AI Generation Notification Banner if applicable */}
              {selectedTipForModal.isAiGenerated && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-purple-500/10 via-primary-500/10 to-teal-500/10 border border-primary-500/25 text-primary-800 dark:text-primary-200 text-xs font-medium">
                  <Sparkles className="size-4 text-primary-500 shrink-0" />
                  <span>
                    {isAr
                      ? 'تم استلهام وتوليد هذه النصيحة تلقائياً بواسطة الذكاء الاصطناعي السيادي SovereignEG'
                      : 'Dynamically generated by the SovereignEG AI model for continuous mindful insights.'}
                  </span>
                </div>
              )}

              {/* Quote Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-muted/70 border border-surface-border relative">
                <Quote className="absolute top-3 end-3 size-6 text-primary-500/20" />
                <p className="text-sm sm:text-base font-bold text-text-primary leading-relaxed">
                  «{isAr ? selectedTipForModal.quote : selectedTipForModal.quoteEn}»
                </p>
              </div>

              {/* Psychological Insight Body */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  {isAr ? 'الفهم النفسي والتحليلي' : 'Psychological Insight'}
                </h4>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {isAr ? selectedTipForModal.body : selectedTipForModal.bodyEn}
                </p>
              </div>

              {/* Practical Exercise Box */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-xs sm:text-sm">
                  <Sparkles className="size-4 shrink-0" />
                  <span>{isAr ? 'تطبيق عملي فوري' : 'Actionable Mindful Step'}</span>
                </div>
                <p className="text-xs text-teal-900 dark:text-teal-100 leading-relaxed ps-6">
                  {isAr ? selectedTipForModal.exercise : selectedTipForModal.exerciseEn}
                </p>
              </div>

              {/* Footer Controls */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-surface-border">
                <button
                  type="button"
                  onClick={async () => {
                    if (currentIndex >= tips.length - 2 && !isGeneratingRef.current) {
                      fetchMoreTips(true);
                    }
                    if (currentIndex >= tips.length - 1) {
                      const newBatch = await fetchMoreTips(false);
                      if (newBatch && newBatch.length > 0) {
                        const nextIdx = tips.length;
                        setCurrentIndex(nextIdx);
                        setSelectedTipForModal(newBatch[0]);
                      } else {
                        setCurrentIndex(0);
                        setSelectedTipForModal(tips[0]);
                      }
                    } else {
                      const nextIdx = currentIndex + 1;
                      setCurrentIndex(nextIdx);
                      setSelectedTipForModal(tips[nextIdx]);
                    }
                  }}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-800 dark:text-primary-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 className="size-3.5 animate-spin text-primary-500" />
                  ) : (
                    <RefreshCw className="size-3.5" />
                  )}
                  <span>
                    {isGenerating
                      ? (isAr ? 'جارٍ التوليد بواسطة SovereignEG...' : 'Generating with SovereignEG...')
                      : (isAr ? 'نصيحة أخرى (توليد ذكي)' : 'Next insight (AI Gen)')}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyQuote}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border bg-surface-elevated text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-500" />
                        <span className="text-emerald-500">{isAr ? 'تم النسخ' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-text-muted" />
                        <span>{isAr ? 'نسخ النصيحة' : 'Copy'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTipForModal(null)}
                    className="px-4 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    {isAr ? 'حسناً، فهمت' : 'Got it'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MindfulNotificationIsland;
