import { ArrowDown, ArrowLeft, ArrowRight, Brain, Cpu, Database, FileText, GitMerge, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * AnalysisPipelineVisual Component
 * Responsive diagram of the multimodal AI pipeline:
 * Input -> Preprocessing -> Representations -> Fusion -> Signal Discovery
 *
 * @param {object} props
 * @param {string} [props.className]
 */
export function AnalysisPipelineVisual({ className }) {
  const { t, direction } = useTranslation();
  const isRtl = direction === 'rtl';

  const stages = [
    {
      num: '01',
      title: t('multimodal.pipeline.step1Title'),
      desc: t('multimodal.pipeline.step1Desc'),
      icon: Database,
      badge: 'Client Input',
      accent: 'border-teal-500/30 bg-teal-500/5 text-teal-700',
    },
    {
      num: '02',
      title: t('multimodal.pipeline.step2Title'),
      desc: t('multimodal.pipeline.step2Desc'),
      icon: FileText,
      badge: 'Tokenize & Patches',
      accent: 'border-sky-500/30 bg-sky-500/5 text-sky-700',
    },
    {
      num: '03',
      title: t('multimodal.pipeline.step3Title'),
      desc: t('multimodal.pipeline.step3Desc'),
      icon: Brain,
      badge: 'MARBERTv2 + ViT',
      accent: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-700',
    },
    {
      num: '04',
      title: t('multimodal.pipeline.step4Title'),
      desc: t('multimodal.pipeline.step4Desc'),
      icon: GitMerge,
      badge: 'Cross-Attention',
      accent: 'border-amber-500/30 bg-amber-500/5 text-amber-700',
    },
    {
      num: '05',
      title: t('multimodal.pipeline.step5Title'),
      desc: t('multimodal.pipeline.step5Desc'),
      icon: Sparkles,
      badge: 'Signal & XAI',
      accent: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700',
    },
  ];

  return (
    <Card
      variant="default"
      padding="lg"
      className={cn('space-y-6 border border-surface-border bg-surface-card', className)}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-teal-600" aria-hidden="true" />
          <h3 className="text-base font-bold text-text-primary">
            {t('multimodal.pipeline.title')}
          </h3>
        </div>
        <p className="text-xs text-text-muted">
          {t('multimodal.pipeline.subtitle')}
        </p>
      </div>

      {/* Pipeline Steps - Flow on desktop, Stack on mobile */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isLast = idx === stages.length - 1;

          return (
            <div
              key={idx}
              className="w-full lg:flex-1 flex flex-col lg:flex-row items-center gap-3"
            >
              {/* Stage Card */}
              <div
                className={cn(
                  'w-full p-4 rounded-[var(--radius-lg)] border transition-all duration-200 flex flex-col justify-between min-h-[140px]',
                  stage.accent
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold tracking-wider opacity-60">
                    STAGE {stage.num}
                  </span>
                  <div className="w-7 h-7 rounded-md bg-surface-card border border-surface-border/60 flex items-center justify-center shadow-xs">
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-text-primary">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-snug">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-surface-border/30">
                  <span className="text-[10px] font-medium text-text-muted">
                    {stage.badge}
                  </span>
                </div>
              </div>

              {/* Connector Arrow */}
              {!isLast && (
                <div className="shrink-0 text-text-muted py-1 lg:py-0">
                  <div className="hidden lg:block">
                    {isRtl ? (
                      <ArrowLeft className="w-4 h-4 text-teal-600/70" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-teal-600/70" aria-hidden="true" />
                    )}
                  </div>
                  <div className="block lg:hidden">
                    <ArrowDown className="w-4 h-4 text-teal-600/70" aria-hidden="true" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
