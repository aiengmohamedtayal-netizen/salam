import {
  FileText,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Info,
  Layers,
  HelpCircle,
  X,
} from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/context/LanguageContext';
import { getStatusMeta, resolveClaimText } from '../data/radarData';

/**
 * Claim Detail Modal Component
 * Renders the in-depth verification dossier for an inspected claim.
 */
export function ClaimDetailModal({ claim, open, onClose }) {
  const { language } = useTranslation();
  const isEn = language === 'en';

  if (!claim) return null;

  const statusMeta = getStatusMeta(claim.status, language);
  const claimTitle = resolveClaimText(claim, 'title', language);
  const claimText = resolveClaimText(claim, 'claimText', language) || claimTitle;
  const sourceOrigin = resolveClaimText(claim, 'sourceOrigin', language);
  const updatedAt = resolveClaimText(claim, 'updatedAt', language);
  const confidenceScore = resolveClaimText(claim, 'confidenceScore', language);
  const explanation = resolveClaimText(claim, 'explanation', language);
  const indicatorsList = isEn && claim.indicatorsEn ? claim.indicatorsEn : claim.indicators;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={isEn ? 'Claim Verification Dossier' : 'ملف تدقيق الادعاء والمؤشرات المرصودة'}
      description={
        isEn
          ? 'Advisory evaluation, observed indicators, and comparative evidence sources'
          : 'تفاصيل التقييم الاسترشادي وقائمة المصادر والأدلة المقارنة'
      }
    >
      <div className="space-y-6 pt-2">
        {/* Status & Confidence Banner */}
        <div className="p-4 rounded-xl bg-surface-muted border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-text-muted">
              {isEn ? 'Verification Status:' : 'حالة التحقق:'}
            </span>
            <Badge variant={statusMeta.badgeVariant} size="md" className="font-bold">
              {statusMeta.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Clock className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
            <span>
              {isEn ? 'Last updated:' : 'آخر تحديث:'} <strong>{updatedAt}</strong>
            </span>
          </div>
        </div>

        {/* Claim Text */}
        <div className="space-y-1.5 p-4 rounded-xl bg-surface-card border border-surface-border">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
            {isEn ? 'Circulating Claim Text:' : 'نص الادعاء المتداول:'}
          </span>
          <p className="text-sm font-semibold text-text-primary leading-relaxed">
            «{claimText}»
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-text-muted border-t border-surface-border mt-2">
            <span>{isEn ? 'Publishing Origin:' : 'مصدر النشر المرصود:'}</span>
            <span className="font-mono text-teal-900 font-semibold">{sourceOrigin}</span>
          </div>
        </div>

        {/* Confidence Level */}
        <div className="p-3.5 rounded-xl bg-surface-muted/70 border border-surface-border flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-text-primary">
            {isEn ? 'Evaluation Confidence Level:' : 'درجة الثقة في التقييم:'}
          </span>
          <span className="font-mono text-teal-900 font-bold bg-surface-card px-2.5 py-1 rounded border border-surface-border">
            {confidenceScore || (isEn ? 'Preliminary estimate' : 'تقدير أولي مستند للنصوص المتاحة')}
          </span>
        </div>

        {/* Why was it flagged? */}
        <div className="space-y-2.5">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-teal-700" aria-hidden="true" />
            <span>
              {isEn
                ? 'Why is this narrative under review? (Observed Indicators)'
                : 'لماذا تم وضع هذا الادعاء تحت المراجعة؟ (مؤشرات الرصد)'}
            </span>
          </h4>
          {indicatorsList && indicatorsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {indicatorsList.map((indicator, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{indicator}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>
                {isEn
                  ? 'No deceptive linguistic markers observed; claim aligns with accredited public data.'
                  : 'لم تُرصد مؤشرات تضليل إنشائية؛ الادعاء يستند لبيانات رسمية معلنة.'}
              </span>
            </div>
          )}
        </div>

        {/* Factors & Explanation */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-bold text-text-primary">
            {isEn ? 'Factors Influencing Assessment & Classification:' : 'العوامل التي أثرت في التقييم والتصنيف:'}
          </h4>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed p-3.5 rounded-xl bg-surface-muted/80 border border-surface-border">
            {explanation}
          </p>
        </div>

        {/* Evidence & Sources */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Layers className="h-4 w-4 text-teal-700" aria-hidden="true" />
            <span>{isEn ? 'Referenced Sources & Evidence:' : 'المصادر والأدلة المتاحة للمراجعة:'}</span>
          </h4>

          {claim.sources && claim.sources.length > 0 ? (
            <div className="space-y-2">
              {claim.sources.map((source, sIdx) => {
                const srcName = isEn && source.nameEn ? source.nameEn : source.name;
                const srcType = isEn && source.typeEn ? source.typeEn : source.type;
                const srcRelevance = isEn && source.relevanceEn ? source.relevanceEn : source.relevance;
                const srcStatus = isEn && source.statusEn ? source.statusEn : source.status;

                return (
                  <div
                    key={sIdx}
                    className="p-3.5 rounded-xl bg-surface-card border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-text-primary">{srcName}</strong>
                        <span className="text-[10px] text-text-muted bg-surface-muted px-2 py-0.5 rounded">
                          {srcType}
                        </span>
                      </div>
                      <p className="text-text-secondary text-[11px] leading-relaxed">
                        {srcRelevance}
                      </p>
                    </div>
                    <Badge variant="default" size="sm" className="self-start sm:self-center shrink-0">
                      {srcStatus}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-muted text-center text-xs text-text-muted italic border border-surface-border">
              {isEn
                ? 'No authoritative records available yet for this specific phrasing.'
                : 'لم يتم العثور على مصادر كافية للمراجعة حتى الآن.'}
            </div>
          )}
        </div>

        {/* Disclaimer in Modal */}
        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950 leading-relaxed">
          <strong>{isEn ? 'Educational Notice:' : 'تنبيه توعوي:'}</strong>{' '}
          {isEn
            ? 'Radar classifications are indicative based on published evidence at the time of review, and do not constitute legal rulings. Always verify sources before sharing.'
            : 'نتائج الرصد هي مؤشرات مساعدة على التحقق وليست حكماً نهائياً على صحة المحتوى. راجع المصادر والسياق قبل مشاركة أي معلومات.'}
        </div>
      </div>
    </Dialog>
  );
}
