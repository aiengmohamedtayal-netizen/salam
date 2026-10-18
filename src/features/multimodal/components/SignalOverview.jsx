import { Activity, BarChart3, Clock, Database, Globe, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * SignalOverview Component
 * Displays model performance benchmarks and dataset statistics,
 * explicitly labeled as demo/research prototype metrics.
 *
 * @param {object} props
 * @param {string} [props.className]
 */
export function SignalOverview({ className }) {
  const { t } = useTranslation();

  const metrics = [
    {
      label: t('multimodal.overview.statPostsAnalyzed'),
      value: t('multimodal.overview.statPostsValue'),
      icon: Database,
      desc: 'حجم العينة الاسترشادية المدعومة',
      accent: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      label: t('multimodal.overview.statAccuracy'),
      value: t('multimodal.overview.statAccuracyValue'),
      icon: BarChart3,
      desc: 'معدل التوافق بين نمطي النص والصورة',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: t('multimodal.overview.statDialect'),
      value: t('multimodal.overview.statDialectValue'),
      icon: Globe,
      desc: 'استيعاب مفردات وتعبيرات العامية المصرية',
      accent: 'text-sky-700 bg-sky-50 border-sky-200',
    },
    {
      label: t('multimodal.overview.statLatency'),
      value: t('multimodal.overview.statLatencyValue'),
      icon: Clock,
      desc: 'استخلاص السمات متعددة الوسائط محلياً',
      accent: 'text-amber-700 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[var(--radius-xl)] bg-surface-elevated/70 border border-surface-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <h3 className="text-base font-bold text-text-primary">
              {t('multimodal.overview.title')}
            </h3>
          </div>
          <p className="text-xs text-text-muted">
            {t('multimodal.overview.researchNote')}
          </p>
        </div>

        <Badge variant="attention" size="sm" className="shrink-0 self-start sm:self-center">
          <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('multimodal.overview.badge')}</span>
        </Badge>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card
              key={idx}
              variant="default"
              padding="sm"
              className="flex flex-col justify-between border border-surface-border hover:border-teal-500/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-semibold text-text-secondary leading-tight">
                  {m.label}
                </span>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center border shrink-0', m.accent)}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-2xl font-black text-text-primary tracking-tight">
                  {m.value}
                </span>
                <p className="text-[11px] text-text-muted">
                  {m.desc}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
