import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import { AuthHeader } from '../components/AuthHeader';
import { PasswordField } from '../components/PasswordField';
import { PasswordStrength } from '../components/PasswordStrength';
import { AuthDivider } from '../components/AuthDivider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { useTranslation } from '@/context/LanguageContext';

export function RegisterPage() {
  const { t, language } = useTranslation();
  const loginPath = language === 'en' ? '/en/login' : '/ar/login';

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation & UI State
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formAlert, setFormAlert] = useState(null);

  // Email format regex
  const isValidEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = t('auth.validation.nameRequired');
    }

    if (!email.trim()) {
      nextErrors.email = t('auth.validation.emailRequired');
    } else if (!isValidEmail(email)) {
      nextErrors.email = t('auth.validation.emailInvalid');
    }

    if (!password) {
      nextErrors.password = t('auth.validation.passwordRequired');
    } else if (password.length < 8) {
      nextErrors.password = t('auth.validation.passwordMinLength');
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = t('auth.validation.confirmPasswordRequired');
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = t('auth.validation.passwordsDoNotMatch');
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
        title: t('auth.demoSuccessRegister'),
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
        title={t('auth.registerTitle')}
        subtitle={t('auth.registerSubtitle')}
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
          {/* Full Name Field */}
          <Input
            id="register-name"
            type="text"
            label={t('auth.nameLabel')}
            placeholder={t('auth.namePlaceholder')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            error={errors.name}
            icon={<User className="w-4 h-4" aria-hidden="true" />}
            autoComplete="name"
            disabled={isLoading}
            required
          />

          {/* Email Field */}
          <Input
            id="register-email"
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

          {/* Password Field & Strength Indicator */}
          <div>
            <PasswordField
              id="register-password"
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
              autoComplete="new-password"
              disabled={isLoading}
              required
            />
            <PasswordStrength password={password} />
          </div>

          {/* Confirm Password Field */}
          <PasswordField
            id="register-confirm-password"
            label={t('auth.confirmPasswordLabel')}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) {
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={isLoading}
            required
          />

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
              {isLoading ? t('auth.registerLoading') : t('auth.registerCta')}
            </Button>
          </div>
        </form>

        <AuthDivider />

        {/* Switch to Login Page */}
        <div className="text-center text-sm text-text-secondary">
          <span>{t('auth.hasAccountPrompt')}</span>{' '}
          <Link
            to={loginPath}
            className="font-bold text-primary-700 hover:text-primary-800 hover:underline focus-visible:outline-2 focus-visible:outline-primary-500 rounded px-1 transition-colors"
          >
            {t('auth.loginLink')}
          </Link>
        </div>
      </Card>
    </AuthShell>
  );
}
