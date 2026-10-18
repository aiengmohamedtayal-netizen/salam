import { useState } from 'react';
import { Sparkles, Activity, CheckCircle2, RotateCcw } from 'lucide-react';
import { SalamNeuralNetwork } from './SalamNeuralNetwork';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * Reusable ThreeScene showcase component.
 * Combines the 3D linguistic network with optional interactive state controls
 * and informative metadata badge matching SALAM's design system.
 *
 * @param {object} props
 * @param {'idle'|'processing'|'result'|'error'} [props.initialState='idle']
 * @param {boolean} [props.showControls=true]
 * @param {boolean} [props.compact=false]
 * @param {string} [props.className]
 */
export function ThreeScene({
  initialState = 'idle',
  showControls = true,
  compact = false,
  className,
}) {
  const [visualState, setVisualState] = useState(initialState);
  const { t } = useTranslation();

  const states = [
    {
      key: 'idle',
      label: t('home.threeVisual.stateIdle'),
      icon: Sparkles,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      key: 'processing',
      label: t('home.threeVisual.stateProcessing'),
      icon: Activity,
      color: 'text-cyan-800 bg-cyan-50 border-cyan-200',
    },
    {
      key: 'result',
      label: t('home.threeVisual.stateResult'),
      icon: CheckCircle2,
      color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div
      className={cn(
        'relative rounded-[var(--radius-2xl)] border border-surface-border/80 bg-surface-card/70 backdrop-blur-md shadow-[var(--shadow-lg)] overflow-hidden flex flex-col justify-between transition-all duration-300',
        compact ? 'p-3 min-h-[240px]' : 'p-4 sm:p-5 min-h-[340px] lg:min-h-[380px]',
        className
      )}
    >
      {/* Top Header & Visual Badge */}
      <div className="relative z-10 flex items-center justify-between gap-2 pb-2 border-b border-surface-border/50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" aria-hidden="true" />
          <span className="text-xs font-bold text-text-primary tracking-tight">
            {t('home.threeVisual.title')}
          </span>
        </div>
        <span className="text-[10px] font-semibold text-text-muted bg-surface-muted px-2 py-0.5 rounded-md">
          {t('home.threeVisual.badge')}
        </span>
      </div>

      {/* 3D Canvas Layer */}
      <div className="relative flex-1 w-full my-1 flex items-center justify-center">
        <SalamNeuralNetwork state={visualState} className="w-full h-full absolute inset-0" />
      </div>

      {/* Bottom Interactive State Controller */}
      {showControls && (
        <div className="relative z-10 pt-2 border-t border-surface-border/50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-text-secondary">
              {t('home.threeVisual.caption')}
            </span>

            {/* Reset to idle if altered */}
            {visualState !== 'idle' && (
              <button
                type="button"
                onClick={() => setVisualState('idle')}
                className="text-[10px] font-bold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1 cursor-pointer transition-colors"
                title={t('common.retry')}
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>{t('home.threeVisual.stateIdle')}</span>
              </button>
            )}
          </div>

          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label={t('home.threeVisual.title')}
          >
            {states.map(({ key, label, icon: Icon }) => {
              const isActive = visualState === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setVisualState(key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border select-none',
                    isActive
                      ? 'bg-teal-700 text-white border-teal-800 shadow-xs scale-[1.02]'
                      : 'bg-surface-card hover:bg-surface-muted text-text-secondary border-surface-border'
                  )}
                  aria-pressed={isActive}
                >
                  <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
