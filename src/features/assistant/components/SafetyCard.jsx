import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useTranslation } from '@/context/LanguageContext';
import { PROFESSIONAL_REFERRAL_GUIDE } from '@/data/awarenessContent';

/**
 * Crisis branch of the assistant.
 *
 * This is a navigation and support surface only — it never analyses, scores
 * or clinically reassures. It surfaces the project's existing approved
 * resources: the referral guide from `awarenessContent.js` plus the
 * `/support`, `/awareness` and `/privacy` pages.
 */
export function SafetyCard() {
  const { t, language, isAr } = useTranslation();

  const prefix = language === 'en' ? '/en' : '/ar';
  const guide = PROFESSIONAL_REFERRAL_GUIDE;

  const guideTitle = isAr ? guide.title : guide.titleEn;
  const guideDescription = isAr ? guide.description : guide.descriptionEn;
  const guideSigns = isAr ? guide.signs : guide.signsEn;

  const links = [
    { to: `${prefix}/support`, label: t('assistant.supportLinks.support') },
    { to: `${prefix}/awareness`, label: t('assistant.supportLinks.awareness') },
    { to: `${prefix}/privacy`, label: t('assistant.supportLinks.privacy') },
  ];

  return (
    <div className="flex flex-col gap-3" role="group" aria-label={t('assistant.safetyHeadline')}>
      <p className="text-sm leading-relaxed text-text-primary">{t('assistant.responses.safety')}</p>

      <Alert
        variant="warning"
        title={t('assistant.safetyHeadline')}
        icon={<ShieldAlert className="h-5 w-5" aria-hidden="true" />}
      >
        {t('assistant.safetyBody')}
      </Alert>

      <Card variant="bordered" padding="sm">
        <CardHeader>
          <h3 className="font-cairo text-sm font-bold text-text-primary">{guideTitle}</h3>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-text-secondary">{guideDescription}</p>

          <ul className="flex list-disc flex-col gap-1.5 ps-5 text-sm leading-relaxed text-text-secondary">
            {guideSigns.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <nav aria-label={t('assistant.supportLinks.support')}>
        <ul className="flex flex-col gap-2">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="text-sm font-medium text-primary-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
