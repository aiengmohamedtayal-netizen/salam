import { useLocation } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { useTranslation } from '@/context/LanguageContext';

const GOOGLE_ERROR_KEYS = {
  GOOGLE_CANCELLED: 'googleErrors.cancelled',
  GOOGLE_STATE_INVALID: 'googleErrors.stateInvalid',
  GOOGLE_IDENTITY_INVALID: 'googleErrors.identityInvalid',
  GOOGLE_ACCOUNT_CONFLICT: 'googleErrors.accountConflict',
  GOOGLE_NOT_CONFIGURED: 'googleErrors.notConfigured',
  GOOGLE_AUTH_FAILED: 'googleErrors.failed',
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 18l6.8-5.3Z" />
      <path fill="#EA4335" d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 15l6.8 5.3C14.2 15.5 18.7 11.9 24 11.9Z" />
    </svg>
  );
}

export function GoogleAuthButton() {
  const { t, language } = useTranslation();
  const location = useLocation();
  const errorCode = new URLSearchParams(location.search).get('auth_error');

  const nextPath = `/${language}/assessment`;
  const startUrl = `/api/v1/auth/google/start?${new URLSearchParams({ next: nextPath, form: location.pathname })}`;

  return (
    <div className="space-y-3">
      {errorCode && (
        <Alert variant="error" title={t('auth.googleErrorTitle')}>
          {t(`auth.${GOOGLE_ERROR_KEYS[errorCode] || 'googleErrors.failed'}`)}
        </Alert>
      )}
      <a
        href={startUrl}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-surface-border bg-surface-card px-4 text-sm font-semibold text-text-primary shadow-xs transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        <GoogleMark />
        <span>{t('auth.googleContinue')}</span>
      </a>
    </div>
  );
}
