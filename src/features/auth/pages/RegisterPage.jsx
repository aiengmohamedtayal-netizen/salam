import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthShell } from '../components/AuthShell';
import { AuthHeader } from '../components/AuthHeader';
import { PasswordField } from '../components/PasswordField';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { AuthDivider } from '../components/AuthDivider';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { OtpCode } from '@/components/ui/OtpCode';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { useTranslation } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export function RegisterPage() {
  const { t, language } = useTranslation();
  const { register, sendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const isAr = language !== 'en';

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

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
      await sendOtp(email.trim(), name.trim());
      setStep('otp');
      setResendTimer(60);
      setOtpError('');
      setFormAlert(null);
    } catch (error) {
      const message =
        error.code === 'ACCOUNT_EXISTS'
          ? t('auth.errors.accountExists')
          : error.code === 'API_UNAVAILABLE'
          ? t('auth.errors.networkError')
          : t('auth.errors.generalFailure');
      setFormAlert({ type: 'error', title: t('auth.errors.generalFailure'), message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    setIsLoading(true);
    setOtpError('');
    try {
      await register(name.trim(), email.trim(), password, code);
      const destination = location.state?.from;
      setTimeout(() => {
        navigate(
          destination
            ? `${destination.pathname}${destination.search || ''}`
            : (language === 'en' ? '/en/assessment' : '/ar/assessment'),
          { replace: true }
        );
      }, 700);
    } catch (error) {
      const message =
        error.code === 'INVALID_OTP'
          ? (isAr ? 'رمز التحقق غير صحيح أو انتهت صلاحيته' : 'Invalid or expired verification code')
          : error.code === 'ACCOUNT_EXISTS'
          ? t('auth.errors.accountExists')
          : error.code === 'API_UNAVAILABLE'
          ? t('auth.errors.networkError')
          : t('auth.errors.generalFailure');
      setOtpError(message);
      setFormAlert({ type: 'error', title: isAr ? 'خطأ في التحقق' : 'Verification Error', message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setIsLoading(true);
    try {
      await sendOtp(email.trim(), name.trim());
      setResendTimer(60);
      setOtpCode('');
      setOtpError('');
      setFormAlert({
        type: 'success',
        title: isAr ? 'تم إرسال رمز جديد' : 'New code sent',
        message: isAr
          ? `تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني: ${email}`
          : `A new verification code was sent to ${email}`,
      });
    } catch (error) {
      setOtpError(isAr ? 'تعذر إرسال الرمز، حاول مرة أخرى' : 'Failed to resend code, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthHeader
        title={step === 'otp' ? (isAr ? 'التحقق من الحساب' : 'Account Verification') : t('auth.registerTitle')}
        subtitle={step === 'otp' ? (isAr ? 'خطوة أخيرة لتأكيد بريدك الإلكتروني' : 'One last step to confirm your email') : t('auth.registerSubtitle')}
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

        {step === 'otp' ? (
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300 flex items-center justify-center shadow-inner">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-text-primary tracking-tight">
                {isAr ? 'رمز التحقق من البريد الإلكتروني' : 'Verify Your Email'}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
                {isAr ? 'أدخل الرمز المكون من 6 أرقام المرسل إلى:' : 'Enter the 6-digit code sent to:'}
                <br />
                <span className="font-bold text-text-primary inline-block mt-0.5 dir-ltr">{email}</span>
              </p>
            </div>

            {/* OTP Code Component with exact DesignBookmark physics */}
            <div className="py-2">
              <OtpCode
                length={6}
                value={otpCode}
                onChange={setOtpCode}
                onComplete={handleVerifyOtp}
                error={!!otpError}
                disabled={isLoading}
                verifiedText={isAr ? 'تم التحقق بنجاح' : 'Verified'}
              />
              {otpError && (
                <p className="mt-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {otpError}
                </p>
              )}
            </div>

            {/* Resend & Change Email Controls */}
            <div className="space-y-3 pt-2 text-xs text-text-muted border-t border-surface-border/60">
              <div>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className="font-bold text-primary-700 hover:text-primary-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {resendTimer > 0
                    ? (isAr ? `إعادة إرسال الرمز خلال ${resendTimer} ثانية` : `Resend code in ${resendTimer}s`)
                    : (isAr ? 'إعادة إرسال رمز التحقق' : 'Resend verification code')}
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setOtpError('');
                    setOtpCode('');
                  }}
                  className="text-text-secondary hover:text-text-primary hover:underline cursor-pointer transition-colors"
                >
                  {isAr ? 'تعديل البريد الإلكتروني أو البيانات' : 'Change email or registration details'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
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

              {/* Animated Password Field & Strength Indicator (DesignBookmark Motion) */}
              <div>
                <PasswordStrength
                  id="register-password"
                  name="password"
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

            <AuthDivider>{t('auth.orContinue')}</AuthDivider>

            <GoogleAuthButton />

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
          </>
        )}
      </Card>
    </AuthShell>
  );
}
