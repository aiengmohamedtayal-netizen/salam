import { useState } from 'react';
import { Type, Eye, Layers, Info, Sparkles } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * ExplanationPanel Component
 * Future-ready Explainability (XAI) UI presenting token weights,
 * visual heatmaps, and multimodal cross-attention cues without claiming clinical causality.
 *
 * @param {object} props
 * @param {'textOnly'|'imageOnly'|'multimodal'} props.modality
 * @param {string} [props.className]
 */
export function ExplanationPanel({ modality = 'multimodal', className }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(() => {
    if (modality === 'imageOnly') return 'vision';
    return 'text';
  });

  const tabs = [
    { id: 'text', label: t('multimodal.results.tabText'), icon: Type, disabled: modality === 'imageOnly' },
    { id: 'vision', label: t('multimodal.results.tabVision'), icon: Eye, disabled: modality === 'textOnly' },
    { id: 'fusion', label: t('multimodal.results.tabCombined'), icon: Layers, disabled: modality !== 'multimodal' },
  ];

  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border border-surface-border bg-surface-card p-5 space-y-4',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" aria-hidden="true" />
          <h4 className="text-sm font-bold text-text-primary">
            {t('multimodal.results.xaiTitle')}
          </h4>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-lg border border-surface-border/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={tab.disabled}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all',
                  isSelected
                    ? 'bg-surface-card text-teal-700 shadow-sm border border-surface-border'
                    : 'text-text-muted hover:text-text-primary disabled:opacity-40 disabled:hover:text-text-muted cursor-pointer disabled:cursor-not-allowed'
                )}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      {activeTab === 'text' && (
        <div className="space-y-3 pt-1">
          <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/20 text-xs text-text-secondary leading-relaxed">
            <span className="font-semibold text-teal-800">
              {t('multimodal.results.textMarkers')}:
            </span>{' '}
            {t('multimodal.results.textMarkersDesc')}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-text-muted">
              <span>وزن المؤشرات اللغوية السلبية (Token Attention Weights)</span>
              <span className="font-semibold text-text-primary">مرتفع نسبياً</span>
            </div>
            <div className="h-2 w-full bg-surface-border rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 rounded-full w-3/4" />
            </div>

            <div className="flex justify-between items-center text-text-muted pt-1">
              <span>تطابق نبرة اللهجة العامية المصرية (Colloquial Dialect Cues)</span>
              <span className="font-semibold text-text-primary">متوافق</span>
            </div>
            <div className="h-2 w-full bg-surface-border rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full w-4/5" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vision' && (
        <div className="space-y-3 pt-1">
          <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/20 text-xs text-text-secondary leading-relaxed">
            <span className="font-semibold text-sky-800">
              {t('multimodal.results.visualMarkers')}:
            </span>{' '}
            {t('multimodal.results.visualMarkersDesc')}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-text-muted">
              <span>كثافة الألوان والسطوع (Color Saturation & Brightness)</span>
              <span className="font-semibold text-text-primary">منخفض / خافت</span>
            </div>
            <div className="h-2 w-full bg-surface-border rounded-full overflow-hidden">
              <div className="h-full bg-sky-600 rounded-full w-2/3" />
            </div>

            <div className="flex justify-between items-center text-text-muted pt-1">
              <span>تركيز رقع الاهتمام البصري (Vision Transformer Patches)</span>
              <span className="font-semibold text-text-primary">تجريدي عام</span>
            </div>
            <div className="h-2 w-full bg-surface-border rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full w-3/5" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fusion' && (
        <div className="space-y-3 pt-1">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-text-secondary leading-relaxed">
            <span className="font-semibold text-amber-800">
              {t('multimodal.results.fusionMarkers')}:
            </span>{' '}
            {t('multimodal.results.fusionMarkersDesc')}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-text-muted">
              <span>مصفوفة الانتباه المتقاطع (Cross-Attention Agreement)</span>
              <span className="font-semibold text-text-primary">توافق ملحوظ</span>
            </div>
            <div className="h-2 w-full bg-surface-border rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full w-5/6" />
            </div>
          </div>
        </div>
      )}

      {/* Non-diagnostic Transparency Note */}
      <div className="flex items-start gap-2 pt-2 border-t border-surface-border/60 text-[11px] text-text-muted">
        <Info className="w-3.5 h-3.5 shrink-0 text-text-muted mt-0.5" aria-hidden="true" />
        <p>
          {t('multimodal.results.disclaimerNotice')}
        </p>
      </div>
    </div>
  );
}
