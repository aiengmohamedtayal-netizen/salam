import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  HeartHandshake,
  AlertTriangle,
  Scale,
  FileCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { safetyPrinciples } from '../data/projectData';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Safety, Privacy, and Limitations Section
 * Emphasizes the ethical charter and scientific governance of SALAM.
 */
export function SafetyGovernanceSection() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const getIcon = (id) => {
    switch (id) {
      case 'non-diagnostic': return ShieldAlert;
      case 'uncertainty-handling': return AlertTriangle;
      case 'no-safe-guarantee': return Scale;
      case 'zero-storage': return Lock;
      case 'always-visible-support': return HeartHandshake;
      case 'academic-governance': return FileCheck;
      default: return ShieldCheck;
    }
  };

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <Badge variant="primary" className="mb-2">
            {isEn ? '5. Safety, Ethics & Governance' : '5. السلامة والخصوصية والمحددات'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t('about.safety.title')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('about.safety.subtitle')}
          </p>
        </div>
        <Badge variant="elevated">
          {isEn ? '6 Binding Safeguards' : '٦ ضوابط ملزمة'}
        </Badge>
      </div>

      {/* Primary Alert Banner */}
      <Alert
        variant="disclaimer"
        title={isEn ? 'Educational Awareness Charter' : 'ميثاق الاستخدام التوعوي الآمن'}
      >
        <span>
          {isEn
            ? 'SALAM is an educational and research prototype. It is strictly prohibited to treat the system as a clinical tool or as a substitute for certified human practitioner consultation.'
            : 'نظام «سَـــلام» نموذج أولي توعوي مبني لأغراض التعليم والبحث الأكاديمي. يُحظر تماماً التعامل مع النظام كأداة سريرية أو طبية أو استخدامه كبديل عن التقييم البشري المتخصص.'}
        </span>
      </Alert>

      {/* Safety Principles Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safetyPrinciples.map((item) => {
          const Icon = getIcon(item.id);
          const isCritical = item.id === 'non-diagnostic' || item.id === 'no-safe-guarantee';

          return (
            <Card
              key={item.id}
              variant="default"
              padding="md"
              className={`flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                isCritical ? 'border-rose-300 bg-rose-50/20' : 'hover:border-teal-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-teal-50 text-teal-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <Badge variant={isCritical ? 'elevated' : 'primary'} size="sm">
                    {isCritical
                      ? isEn ? 'Mandatory Red Line' : 'خط أحمر ملزم'
                      : isEn ? 'Governance Policy' : 'سياسة حوكمة'}
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-text-primary">
                  {isEn ? item.titleEn || item.title : item.title}
                </h3>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  {isEn ? item.ruleEn || item.descriptionEn || item.description : item.rule || item.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
