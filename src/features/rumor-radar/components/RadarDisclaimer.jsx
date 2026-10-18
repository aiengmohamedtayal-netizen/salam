import { ShieldAlert } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Radar Trust & Disclaimer Notice Component
 * Non-alarmist, dignified trust guidance on verification limits.
 */
export function RadarDisclaimer() {
  const { language } = useTranslation();
  const isEn = language === 'en';

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/80 border border-teal-200/90 text-teal-950 flex items-start gap-3.5 shadow-2xs">
      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
        <ShieldAlert className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="space-y-1 text-xs leading-relaxed">
        <strong className="text-sm font-bold block text-teal-950">
          {isEn ? 'Notice & Monitoring Boundaries:' : 'تنويه ومحددات الرصد والتحقق:'}
        </strong>
        <p className="text-teal-900/90">
          {isEn
            ? 'Radar outcomes represent assistive verification indicators and do not serve as definitive rulings on content validity. Cross-examine context and authoritative sources before distributing information, and never rely on automated models as a replacement for independent verification.'
            : 'نتائج الرصد هي مؤشرات مساعدة على التحقق وليست حكماً نهائياً على صحة المحتوى. راجع المصادر والسياق قبل مشاركة المعلومات، ولا تعتمد على أي نموذج آلي كبديل عن التوثيق المستقل.'}
        </p>
      </div>
    </div>
  );
}
