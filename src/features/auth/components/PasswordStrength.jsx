import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Lightweight, non-intrusive password strength indicator.
 * @param {object} props
 * @param {string} props.password
 * @param {string} [props.className]
 */
export function PasswordStrength({ password = '', className }) {
  const { t } = useTranslation();

  const { score, label, colorClass } = useMemo(() => {
    if (!password) {
      return { score: 0, label: '', colorClass: '' };
    }

    let calculatedScore = 0;
    if (password.length >= 8) calculatedScore += 1;
    if (/[0-9]/.test(password) && /[a-zA-Z\u0600-\u06FF]/.test(password)) calculatedScore += 1;
    if (password.length >= 10 && /[^a-zA-Z0-9\u0600-\u06FF]/.test(password)) calculatedScore += 1;

    // Minimum 1 if user typed something
    const finalScore = Math.max(1, Math.min(calculatedScore, 3));

    if (finalScore === 1) {
      return {
        score: 1,
        label: t('auth.strengthWeak'),
        colorClass: 'bg-error',
        textColor: 'text-error',
      };
    }
    if (finalScore === 2) {
      return {
        score: 2,
        label: t('auth.strengthMedium'),
        colorClass: 'bg-attention',
        textColor: 'text-amber-700',
      };
    }
    return {
      score: 3,
      label: t('auth.strengthStrong'),
      colorClass: 'bg-safe',
      textColor: 'text-emerald-700',
    };
  }, [password, t]);

  if (!password) return null;

  return (
    <div className={cn('mt-2 space-y-1.5 text-start', className)} aria-live="polite">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-text-muted">{t('auth.strengthLabel')}</span>
        <span className={cn('transition-colors duration-150', colorClass ? colorClass.replace('bg-', 'text-') : 'text-text-muted')}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 h-1.5 w-full">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            score >= 1 ? colorClass : 'bg-surface-muted'
          )}
        />
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            score >= 2 ? colorClass : 'bg-surface-muted'
          )}
        />
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            score >= 3 ? colorClass : 'bg-surface-muted'
          )}
        />
      </div>
    </div>
  );
}
