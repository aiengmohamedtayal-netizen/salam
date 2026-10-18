import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icon3D } from '@/components/ui/Icon3D';
import { technicalStack } from '../data/projectData';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Proposed Technical Stack Section
 * Displays the 7 architectural components, proposed choices, and rationale.
 */
export function TechStackSection() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const getComponentIcon3D = (index) => {
    switch (index) {
      case 0: return 'robot';      // Frontend UI
      case 1: return 'shield';     // Backend API
      case 2: return 'notepad';    // Data Pipeline / NLP
      case 3: return 'brain';      // Core ML / LLM
      case 4: return 'analytics';  // XAI & Interpretability
      case 5: return 'clipboard';  // Validation & Evaluation
      case 6: return 'location';   // Cloud & Deployment
      default: return 'robot';
    }
  };

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <Badge variant="primary" className="mb-2">
            {isEn ? '3. Technical Stack & Infrastructure' : '3. المنظومة التقنية والمعمارية'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t('about.stack.title')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('about.stack.subtitle')}
          </p>
        </div>
        <Badge variant="info">
          {isEn ? '7 Architectural Components' : '٧ مكونات برمجية'}
        </Badge>
      </div>

      {/* Tech Stack Matrix / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {technicalStack.map((item, idx) => {
          const isAi = idx === 2 || idx === 3;

          return (
            <Card
              key={item.component}
              variant="default"
              padding="md"
              className={`flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                isAi ? 'border-teal-300 bg-teal-50/20' : 'hover:border-teal-300'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Role Badge & Icon */}
                <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <Icon3D name={getComponentIcon3D(idx)} size="md" className="w-10 h-10 object-contain drop-shadow-xs" />
                  </div>
                  <Badge variant={isAi ? 'primary' : 'default'} size="sm">
                    {isEn ? item.roleEn || item.role : item.role}
                  </Badge>
                </div>

                {/* Component Name */}
                <div>
                  <span className="text-[11px] font-mono text-text-muted block">
                    Module 0{idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-text-primary mt-0.5">
                    {isEn ? item.componentEn || item.component : item.component}
                  </h3>
                </div>

                {/* Tech Choice */}
                <div className="p-2.5 rounded-lg bg-surface-muted/80 border border-surface-border">
                  <span className="text-[11px] font-bold text-teal-900 block mb-0.5">
                    {isEn ? 'Selected Tool / Library:' : 'التقنية / المكتبة المعتمدة:'}
                  </span>
                  <span className="font-mono text-xs font-bold text-teal-950 block">
                    {item.choice}
                  </span>
                </div>

                {/* Justification Details */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {isEn ? item.detailsEn || item.details : item.details}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
