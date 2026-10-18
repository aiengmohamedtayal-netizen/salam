import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import { AuthHeader } from '../components/AuthHeader';
import { PasswordField } from '../components/PasswordField';
import { AuthDivider } from '../components/AuthDivider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { useTranslation } from '@/context/LanguageContext';

export function LoginPage() {
  const { t, language } = useTranslation();
  const registerPath = language === 'en' ? '/en/register' : '/ar/register';

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validation & UI State
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formAlert, setFormAlert] = useState(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Email format regex
  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = t('auth.validation.emailRequired');
    } else if (!isValidEmail(email)) {
      nextErrors.email = t('auth.validation.emailInvalid');
    }

    if (!password) {
      nextErrors.password = t('auth.validation.passwordRequired');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormAlert(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate frontend submission interaction with clear UI state
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Demonstration frontend feedback
      setFormAlert({
        type: 'success',
        title: t('auth.demoSuccessLogin'),
        message: t('auth.demoNotice'),
      });
    } catch {
      setFormAlert({
        type: 'error',
        title: t('auth.errors.generalFailure'),
        message: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthHeader
        title={t('auth.loginTitle')}
        subtitle={t('auth.loginSubtitle')}
      />

      <Card
        variant="elevated"
        padding="lg"
        className="border border-surface-border/80 bg-surface-card/95 backdrop-blur-md shadow-[var(--shadow-xl)]"
      >
        {/* Status / Error Feedback Alert */}
        {formAlert && (
          <div className="mb-6">
            <Alert
              variant={formAlert.type === 'success' ? 'success' : 'error'}
              title={formAlert.title}
              dismissible
              onDismiss={() => setFormAlert(null)}
              icon={
                formAlert.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
                )
              }
            >
              {formAlert.message}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Field */}
          <Input
            id="login-email"
            type="email"
            label={t('auth.emailLabel')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            error={errors.email}
            icon={<Mail className="w-4 h-4" aria-hidden="true" />}
            autoComplete="email"
            disabled={isLoading}
            required
          />

          {/* Password Field */}
          <div>
            <PasswordField
              id="login-password"
              label={t('auth.passwordLabel')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              error={errors.password}
              autoComplete="current-password"
              disabled={isLoading}
              required
            />

            {/* Forgot Password Link */}
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setForgotPasswordOpen((prev) => !prev)}
                className="text-xs font-semibold text-primary-700 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-primary-500 rounded px-1 transition-colors cursor-pointer"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>

            {/* Accessible Forgot Password Notice */}
            {forgotPasswordOpen && (
              <div className="mt-2 p-3 rounded-lg bg-surface-muted border border-surface-border text-xs text-text-secondary flex items-start gap-2 animate-in fade-in duration-200">
                <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{t('auth.forgotPasswordNotice')}</span>
              </div>
            )}
          </div>

          {/* Primary Submit CTA */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="h-11 text-base font-bold shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? t('auth.loginLoading') : t('auth.loginCta')}
            </Button>
          </div>
        </form>

        <AuthDivider />

        {/* Switch to Register Page */}
        <div className="text-center text-sm text-text-secondary">
          <span>{t('auth.noAccountPrompt')}</span>{' '}
          <Link
            to={registerPath}
            className="font-bold text-primary-700 hover:text-primary-800 hover:underline focus-visible:outline-2 focus-visible:outline-primary-500 rounded px-1 transition-colors"
          >
            {t('auth.createAccountLink')}
          </Link>
        </div>
      </Card>
    </AuthShell>
  );
}
