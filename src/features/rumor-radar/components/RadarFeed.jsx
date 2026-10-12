import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ExternalLink,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Eye,
  FileQuestion,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/context/LanguageContext';
import { getStatusMeta, resolveClaimText } from '../data/radarData';
import { fadeUp, safeMotion } from '@/lib/motion';

/**
 * Radar Feed Component
 * Displays filtered list of monitored claims with status indicators and detail trigger.
 */
export function RadarFeed({ claims = [], onSelectClaim }) {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const FILTER_TABS = [
    { id: 'all', label: isEn ? 'All' : 'الكل' },
    { id: 'circulating', label: isEn ? 'Circulating' : 'متداول' },
    { id: 'needs_verification', label: isEn ? 'Needs Verification' : 'يحتاج إلى تحقق' },
    { id: 'potentially_misleading', label: isEn ? 'Potentially Misleading' : 'مضلل محتمل' },
    { id: 'verified', label: isEn ? 'Verified' : 'تم التحقق منه' },
  ];

  const filteredClaims = claims.filter((claim) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'needs_verification'
        ? claim.status === 'needs_verification' || claim.status === 'unverified'
        : activeFilter === 'potentially_misleading'
        ? claim.status === 'potentially_misleading' || claim.status === 'partially_inaccurate'
        : claim.status === activeFilter;

    const claimTitle = resolveClaimText(claim, 'title', language);
    const claimSummary = resolveClaimText(claim, 'summary', language);
    const claimSource = resolveClaimText(claim, 'sourceOrigin', language);

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : claimTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          claimSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          claimSource.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Feed Header, Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            {isEn ? 'Monitored Claims & Narratives Feed' : 'سجل الادعاءات والمحتوى المرصود'}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {isEn
              ? 'Field updates and verification telemetry across monitored sources'
              : 'تحديثات الرصد الميداني ومؤشرات التدقيق وفق المصادر المتاحة'}
          </p>
        </div>

        {/* Search input in feed */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search claims...' : 'بحث في الادعاءات...'}
            className="w-full h-9 rounded-lg border border-surface-border bg-surface-card px-3 ps-8 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <Search className="h-3.5 w-3.5 text-text-muted absolute top-1/2 -translate-y-1/2 start-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer shrink-0 select-none ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-surface-card border border-surface-border text-text-secondary hover:text-text-primary hover:bg-surface-muted'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Feed List Cards */}
      <div className="space-y-4">
        {filteredClaims.length > 0 ? (
          filteredClaims.map((claim) => {
            const statusMeta = getStatusMeta(claim.status, language);
            const claimTitle = resolveClaimText(claim, 'title', language);
            const claimSummary = resolveClaimText(claim, 'summary', language);
            const claimOrigin = resolveClaimText(claim, 'sourceOrigin', language);
            const claimPublished = resolveClaimText(claim, 'publishedAt', language);
            const claimConfidence = resolveClaimText(claim, 'confidenceScore', language);
            const indicatorsList = isEn && claim.indicatorsEn ? claim.indicatorsEn : claim.indicators;

            return (
              <Card
                key={claim.id}
                variant="default"
                padding="md"
                className="hover:border-teal-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Meta: Status, Origin & Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusMeta.badgeVariant} size="sm" className="font-bold">
                        {statusMeta.label}
                      </Badge>
                      <span className="text-xs text-text-muted font-medium">
                        {isEn ? 'Source:' : 'المصدر:'}{' '}
                        <strong className="text-text-primary">{claimOrigin}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <span>{claimPublished}</span>
                    </div>
                  </div>

                  {/* Headline Title */}
                  <h3 className="text-base font-bold text-text-primary leading-snug">
                    {claimTitle}
                  </h3>

                  {/* Short Summary */}
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {claimSummary}
                  </p>

                  {/* Indicators Preview Tags */}
                  {indicatorsList && indicatorsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {indicatorsList.map((ind, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-surface-muted text-text-secondary border border-surface-border"
                        >
                          <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" aria-hidden="true" />
                          <span>{ind}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-text-muted">
                    {isEn ? 'Confidence:' : 'درجة الثقة:'}{' '}
                    <span className="font-mono text-teal-900 font-semibold">{claimConfidence}</span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectClaim(claim)}
                    className="gap-1.5 text-xs hover:border-teal-500 hover:text-teal-900 font-semibold"
                  >
                    <span>{isEn ? 'View Dossier & Evidence' : 'عرض التفاصيل والأدلة'}</span>
                    <ChevronLeft className="h-3.5 w-3.5 ltr:rotate-180 rtl:rotate-0" aria-hidden="true" />
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          /* Empty State */
          <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border space-y-3">
            <FileQuestion className="h-10 w-10 text-text-muted mx-auto" aria-hidden="true" />
            <h3 className="text-base font-bold text-text-primary">
              {isEn ? 'No Claims Matching Criteria' : 'لا توجد ادعاءات مطابقة للمحددات حالياً'}
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              {isEn
                ? 'No recorded claims match the selected filter or query. You can reset filters or inspect a new narrative.'
                : 'لم نعثر على ادعاءات مسجلة تطابق التصنيف أو البحث المطلوب. يمكنك إعادة ضبط خيارات التصفية أو إدخال ادعاء جديد للتحقق.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
