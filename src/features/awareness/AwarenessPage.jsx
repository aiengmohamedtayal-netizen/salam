import { useState } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Accordion } from '@/components/ui/Accordion';
import { Icon3D } from '@/components/ui/Icon3D';
import {
  AWARENESS_ARTICLES,
  CULTURAL_MYTHS_FACTS,
} from '@/data/awarenessContent';
import { useTranslation } from '@/context/LanguageContext';

export function AwarenessPage() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  // Accordion format for Myths vs Facts
  const mythAccordionItems = CULTURAL_MYTHS_FACTS.map((item) => {
    const mythText = isEn && item.mythEn ? item.mythEn : item.myth;
    const factText = isEn && item.factEn ? item.factEn : item.fact;

    return {
      id: item.id,
      title: t('awareness.mythPrefix', { myth: mythText }),
      badge: (
        <Badge variant="attention" size="sm">
          {t('awareness.conceptCorrection')}
        </Badge>
      ),
      content: (
        <div className="space-y-2">
          <p className="font-bold text-teal-900 text-xs sm:text-sm">
            {t('awareness.factLabel')}
          </p>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {factText}
          </p>
        </div>
      ),
    };
  });

  return (
    <div className="py-12 sm:py-20 bg-surface-bg min-h-screen space-y-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="primary">{t('awareness.badge')}</Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-text-primary">
            {t('awareness.title')}
          </h1>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            {t('awareness.subtitle')}
          </p>
        </div>

        {/* Section 1: Awareness Articles Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon3D name="books" size="md" className="w-8 h-8 shrink-0 drop-shadow-xs" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {t('awareness.articlesTitle')}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {t('awareness.articlesSubtitle')}
                </p>
              </div>
            </div>
            <Badge variant="info">{t('awareness.reviewedBadge')}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AWARENESS_ARTICLES.map((article) => {
              const artTitle = isEn && article.titleEn ? article.titleEn : article.title;
              const artCat = isEn && article.categoryEn ? article.categoryEn : article.category;
              const artTime = isEn && article.readTimeEn ? article.readTimeEn : article.readTime;
              const artSummary = isEn && article.summaryEn ? article.summaryEn : article.summary;

              return (
                <Card
                  key={article.id}
                  variant="default"
                  padding="md"
                  className="flex flex-col justify-between hover:border-teal-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <Badge variant="primary" size="sm">
                        {artCat}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        <span>{artTime}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-text-primary leading-snug">
                      {artTitle}
                    </h3>

                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                      {artSummary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-surface-border mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => setSelectedArticle(article)}
                    >
                      {t('awareness.readArticleBtn')}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Section 2: Myths vs Facts in Arabic Culture */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Icon3D name="lightbulb" size="md" className="w-8 h-8 shrink-0 drop-shadow-xs" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                  {t('awareness.mythsTitle')}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {t('awareness.mythsSubtitle')}
                </p>
              </div>
            </div>
            <Badge variant="attention">{t('awareness.destigmaBadge')}</Badge>
          </div>

          <Accordion items={mythAccordionItems} allowMultiple defaultOpen={['mf_1']} />
        </div>

        {/* Section 3: Grounding & Breathing Self-Care Widget */}
        <Card variant="default" padding="lg" className="bg-teal-900 text-white space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-teal-800">
            <div className="w-12 h-12 flex items-center justify-center font-bold shrink-0">
              <Icon3D name="meditation" size="lg" className="w-12 h-12 object-contain drop-shadow-md" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{t('awareness.breathingTitle')}</h3>
              <span className="text-xs text-teal-200">{t('awareness.breathingSubtitle')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-teal-800/60 border border-teal-700/60 space-y-2">
              <span className="text-2xl font-black text-teal-200">{t('awareness.breatheStep1Time')}</span>
              <span className="block font-bold text-xs text-white">{t('awareness.breatheStep1Title')}</span>
              <p className="text-[11px] text-teal-100">{t('awareness.breatheStep1Desc')}</p>
            </div>
            <div className="p-4 rounded-xl bg-teal-800/60 border border-teal-700/60 space-y-2">
              <span className="text-2xl font-black text-teal-200">{t('awareness.breatheStep2Time')}</span>
              <span className="block font-bold text-xs text-white">{t('awareness.breatheStep2Title')}</span>
              <p className="text-[11px] text-teal-100">{t('awareness.breatheStep2Desc')}</p>
            </div>
            <div className="p-4 rounded-xl bg-teal-800/60 border border-teal-700/60 space-y-2">
              <span className="text-2xl font-black text-teal-200">{t('awareness.breatheStep3Time')}</span>
              <span className="block font-bold text-xs text-white">{t('awareness.breatheStep3Title')}</span>
              <p className="text-[11px] text-teal-100">{t('awareness.breatheStep3Desc')}</p>
            </div>
          </div>

          <p className="text-xs text-center text-teal-200 pt-2">
            {t('awareness.breathingRepeat')}
          </p>
        </Card>
      </div>

      {/* Article Reader Modal */}
      <Dialog
        open={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        title={selectedArticle ? (isEn && selectedArticle.titleEn ? selectedArticle.titleEn : selectedArticle.title) : ''}
        size="lg"
      >
        {selectedArticle && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3 text-xs text-text-muted pb-3 border-b border-surface-border">
              <Badge variant="primary" size="sm">
                {isEn && selectedArticle.categoryEn ? selectedArticle.categoryEn : selectedArticle.category}
              </Badge>
              <span>
                {t('awareness.readTimeLabel', {
                  time: isEn && selectedArticle.readTimeEn ? selectedArticle.readTimeEn : selectedArticle.readTime,
                })}
              </span>
            </div>

            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {isEn && selectedArticle.contentEn ? selectedArticle.contentEn : selectedArticle.content}
            </div>

            <div className="pt-4 border-t border-surface-border flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedArticle(null)}
              >
                {t('awareness.closeArticle')}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
