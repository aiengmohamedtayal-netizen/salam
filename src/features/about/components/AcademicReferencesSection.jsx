import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { academicReferences } from '../data/projectData';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Academic References and Research Catalogs Section
 */
export function AcademicReferencesSection() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <Badge variant="primary" className="mb-2">
            {isEn ? '6. Academic References & Literature' : '6. المراجع والتوثيق الأكاديمي'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {t('about.references.title')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            {t('about.references.subtitle')}
          </p>
        </div>
        <Badge variant="default">
          {isEn ? '8 Approved References' : '٨ مراجع معتمدة'}
        </Badge>
      </div>

      {/* References Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {academicReferences.map((ref, idx) => {
          return (
            <Card
              key={idx}
              variant="default"
              padding="sm"
              className="flex flex-col justify-between hover:border-teal-300 hover:shadow-xs transition-all duration-150"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-text-muted bg-surface-muted px-2 py-0.5 rounded">
                    {ref.type}
                  </span>
                  <span className="text-[10px] text-teal-800 font-bold">
                    {isEn ? ref.categoryEn || ref.category : ref.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-text-primary">
                  {isEn ? ref.titleEn || ref.title : ref.title}
                </h3>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {isEn ? ref.descriptionEn || ref.description : ref.description}
                </p>
              </div>

              {ref.url && (
                <div className="pt-3 border-t border-surface-border mt-3">
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-900 font-semibold"
                  >
                    <span>{isEn ? 'View Reference / Documentation' : 'فتح المرجع أو التوثيق البرمجي'}</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
