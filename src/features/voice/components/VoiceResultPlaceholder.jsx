import { CheckCircle2, RotateCcw, AlertTriangle, Phone, Sparkles, Mic, Activity, Clock, Zap, Waves } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * VoiceResultPlaceholder Component
 * Future-ready result placeholder presenting the 5 acoustic features,
 * with zero fake predictions and explicit non-diagnostic disclaimers.
 *
 * @param {object} props
 * @param {number} props.duration - Recording duration in seconds
 * @param {() => void} props.onReset - Reset to record again
 * @param {string} [props.className]
 */
export function VoiceResultPlaceholder({ duration, onReset, className }) {
  const { t } = useTranslation();

  const features = [
    {
      title: t('voice.results.speakingRate'),
      desc: t('voice.results.speakingRateDesc'),
      icon: Clock,
      status: 'في انتظار نموذج الاستدلال',
      statusEn: 'Pending Model Inference',
    },
    {
      title: t('voice.results.pausePattern'),
      desc: t('voice.results.pausePatternDesc'),
      icon: Activity,
      status: 'في انتظار نموذج الاستدلال',
      statusEn: 'Pending Model Inference',
    },
    {
      title: t('voice.results.pitchVariation'),
      desc: t('voice.results.pitchVariationDesc'),
      icon: Waves,
      status: 'في انتظار نموذج الاستدلال',
      statusEn: 'Pending Model Inference',
    },
    {
      title: t('voice.results.energyProsody'),
      desc: t('voice.results.energyProsodyDesc'),
      icon: Zap,
      status: 'في انتظار نموذج الاستدلال',
      statusEn: 'Pending Model Inference',
    },
    {
      title: t('voice.results.prosodicRhythm'),
      desc: t('voice.results.prosodicRhythmDesc'),
      icon: Mic,
      status: 'في انتظار نموذج الاستدلال',
      statusEn: 'Pending Model Inference',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Top Status Card */}
      <Card
        variant="default"
        padding="md"
        className="border border-surface-border bg-surface-card space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {t('voice.results.title')}
              </h3>
              <p className="text-xs text-text-muted">
                {t('voice.results.statusReady')} ({duration} {t('voice.seconds')})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted px-3 py-1 rounded-full bg-surface-elevated border border-surface-border self-start sm:self-center">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
            <span>نمط صوتي (Voice Signal)</span>
          </div>
        </div>

        {/* Future Model Pending Notice Banner */}
        <div className="p-3.5 rounded-[var(--radius-lg)] bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 leading-relaxed flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p>{t('voice.results.placeholder')}</p>
        </div>

        {/* Acoustic Features Blueprint Grid */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-text-primary">
              {t('voice.results.featuresTitle')}
            </h4>
            <span className="text-[11px] text-text-muted">
              {t('voice.results.uncertaintyNote')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-surface-border bg-surface-elevated/40 space-y-2 hover:border-teal-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800">
                      {feature.title}
                    </span>
                    <div className="w-6 h-6 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  </div>

                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    {feature.desc}
                  </p>

                  <div className="pt-1 border-t border-surface-border/40 flex items-center justify-between text-[10px] text-text-muted">
                    <span>الحالة:</span>
                    <span className="font-medium text-teal-700">
                      {feature.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Safety & Helpline Guidance Callout */}
      <div className="p-4 rounded-[var(--radius-xl)] bg-amber-500/10 border border-amber-500/30 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
          <span>تنبيه علمي وأخلاقي</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          {t('voice.results.disclaimerNotice')}
        </p>
        <div className="flex items-center gap-2 pt-1 text-xs text-teal-800 font-semibold">
          <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" aria-hidden="true" />
          <span>{t('voice.results.hotlineAdvice')}</span>
        </div>
      </div>

      {/* Reset Action */}
      <div className="flex justify-center pt-2">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>{t('voice.reRecord')}</span>
        </Button>
      </div>
    </div>
  );
}
