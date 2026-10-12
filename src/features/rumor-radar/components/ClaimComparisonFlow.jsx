import { MessageSquareQuote, Layers, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Claim vs Evidence Visual Flow Component
 * Illustrates the logical progression:
 * Claim -> Available Evidence -> Verification State
 */
export function ClaimComparisonFlow() {
  const { language } = useTranslation();
  const isEn = language === 'en';

  const FLOW_STAGES = [
    {
      step: '01',
      title: isEn ? 'Circulating Claim' : 'الادعاء المرصود',
      desc: isEn
        ? 'Ingesting the circulating headline or text, parsing salient keywords, and tracing initial publishing origin.'
        : 'استقبال النص أو الشائعة المتداولة، وتحديد الكلمات المفتاحية ومصدر النشر الأساسي.',
      icon: MessageSquareQuote,
      badge: isEn ? 'Input' : 'المدخلات',
    },
    {
      step: '02',
      title: isEn ? 'Evidence & Sources' : 'الأدلة والمصادر المتاحة',
      desc: isEn
        ? 'Scanning for conflicting statements, matching against authoritative registries & peer-reviewed journals, and anchoring time context.'
        : 'فحص التضارب، مضاهاة البيانات بالجهات الرسمية والدوريات المحكمة، ورصد السياق الزمني.',
      icon: Layers,
      badge: isEn ? 'Comparison' : 'التحليل والمقارنة',
    },
    {
      step: '03',
      title: isEn ? 'Verification & Confidence' : 'حالة التحقق ومستوى الثقة',
      desc: isEn
        ? 'Issuing a calibrated advisory label (Circulating / Needs Verification / Potentially Misleading / Verified) with explicit confidence bounds.'
        : 'إصدار تصنيف استرشادي واضح (متداول / يحتاج تحقق / مضلل محتمل / موثق) مع توضيح حزام الثقة.',
      icon: ShieldCheck,
      badge: isEn ? 'Guidance Outcome' : 'النتيجة الاسترشادية',
    },
  ];

  return (
    <Card variant="default" padding="lg" className="space-y-6 border border-surface-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-text-primary">
            {isEn
              ? 'Verification Flow: Claim vs. Evidence'
              : 'مسار التحقق: مقارنة الادعاء بالأدلة (Claim vs Evidence)'}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {isEn
              ? 'Rigorous framework for weighing circulating narratives against independent evidence'
              : 'المنهجية المتبعة في وزن الادعاء مقابل مصادر الإسناد المستقلة'}
          </p>
        </div>
        <Badge variant="primary" size="sm">
          {isEn ? '3 Review Stages' : '٣ محطات تدقيق'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {FLOW_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.step}
              className="relative flex flex-col justify-between p-4 rounded-xl bg-surface-muted/60 border border-surface-border space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-xs font-mono">
                    {stage.step}
                  </span>
                  <Badge variant="outline" size="sm">
                    {stage.badge}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Icon className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
                  <h4 className="font-bold text-sm text-text-primary">{stage.title}</h4>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              {idx < FLOW_STAGES.length - 1 && (
                <div className="hidden md:flex absolute -end-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-surface-card border border-surface-border items-center justify-center shadow-2xs">
                  <ArrowLeft
                    className="h-3 w-3 text-teal-700 ltr:rotate-180 rtl:rotate-0"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
