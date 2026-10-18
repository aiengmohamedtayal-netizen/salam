import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icon3D } from '@/components/ui/Icon3D';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Radar Overview Component
 * Summarizes current monitoring categories based on active loaded claims.
 * Does not display fake percentages or fabricated statistics.
 */
export function RadarOverview({ claims = [] }) {
  const { language } = useTranslation();
  const isEn = language === 'en';

  const circulatingCount = claims.length;
  const needsVerificationCount = claims.filter(
    (c) => c.status === 'needs_verification' || c.status === 'unverified'
  ).length;
  const misleadingCount = claims.filter(
    (c) => c.status === 'potentially_misleading' || c.status === 'partially_inaccurate'
  ).length;
  const verifiedCount = claims.filter((c) => c.status === 'verified').length;

  const STATS_ITEMS = [
    {
      id: 'circulating',
      label: isEn ? 'Total Circulating Claims' : 'إجمالي المحتوى المتداول',
      count: circulatingCount,
      icon3d: 'gauge',
      badge: isEn ? 'Active' : 'المرصود حالياً',
      badgeVariant: 'info',
      hint: isEn ? 'Claims under active tracking' : 'ادعاءات تحت المتابعة النشطة',
    },
    {
      id: 'needs_verification',
      label: isEn ? 'Needs Verification' : 'يحتاج إلى تحقق',
      count: needsVerificationCount,
      icon3d: 'clipboard',
      badge: isEn ? 'Under Review' : 'قيد التدقيق',
      badgeVariant: 'attention',
      hint: isEn ? 'Sparse sources or conflicting data' : 'نقص في المصادر أو تضارب أولي',
    },
    {
      id: 'potentially_misleading',
      label: isEn ? 'Potentially Misleading' : 'مضلل محتمل',
      count: misleadingCount,
      icon3d: 'lifebuoy',
      badge: isEn ? 'High Indicators' : 'مؤشرات مرتفعة',
      badgeVariant: 'elevated',
      hint: isEn ? 'Decontextualized framing or sensational tone' : 'تأطير مقتطع أو مبالغة لغوية',
    },
    {
      id: 'verified',
      label: isEn ? 'Verified' : 'تم التحقق منه',
      count: verifiedCount,
      icon3d: 'shield',
      badge: isEn ? 'Official Records' : 'موثّق رسمياً',
      badgeVariant: 'safe',
      hint: isEn ? 'Supported by verified evidence & sources' : 'مؤيد بأدلة ومصادر موثوقة',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS_ITEMS.map((item) => {
        return (
          <Card
            key={item.id}
            variant="default"
            padding="md"
            className="flex flex-col justify-between hover:border-teal-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <Icon3D name={item.icon3d} size="md" className="w-10 h-10 object-contain drop-shadow-xs" />
                </div>
                <Badge variant={item.badgeVariant} size="sm">
                  {item.badge}
                </Badge>
              </div>

              <div>
                <span className="text-2xl font-black text-text-primary tracking-tight font-mono">
                  {item.count}
                </span>
                <h3 className="text-sm font-bold text-text-primary mt-1">
                  {item.label}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {item.hint}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
