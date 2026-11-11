import { useState, forwardRef } from 'react';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Animated PasswordField
 * Built with DesignBookmark Motion animated Eye toggle:
 * - Smooth stroke-dashoffset slash line (240ms cubic-bezier)
 * - Scaled pupil spring transition
 * - RTL-friendly layout with accessible aria-pressed and label
 */
export const PasswordField = forwardRef(function PasswordField(
  { label, error, helperText, className, id, ...rest },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const { t, isAr } = useTranslation();

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Input
      ref={ref}
      id={id}
      type={showPassword ? 'text' : 'password'}
      label={label}
      error={error}
      helperText={helperText}
      className={className}
      icon={<Lock className="w-4 h-4 text-text-muted" aria-hidden="true" />}
      endAdornment={
        <button
          type="button"
          onClick={toggleVisibility}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-muted/60 transition-colors focus-visible:outline-2 focus-visible:outline-primary-500 cursor-pointer"
          aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
          aria-pressed={showPassword}
          title={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {/* Outer Eye Shape */}
            <path d="M2.5 12c2.2-4.5 5.8-7 9.5-7s7.3 2.5 9.5 7c-2.2 4.5-5.8 7-9.5 7s-7.3-2.5-9.5-7z" />
            {/* Scaled Pupil */}
            <circle
              cx="12"
              cy="12"
              r="3.2"
              fill="currentColor"
              stroke="none"
              style={{
                transformOrigin: '12px 12px',
                transform: `scale(${showPassword ? 0.35 : 1})`,
                opacity: showPassword ? 0.35 : 1,
                transition: 'transform 260ms cubic-bezier(0.2, 0, 0, 1), opacity 260ms ease',
              }}
            />
            {/* Animated Slash Line */}
            <path
              d="M4 4l16 16"
              style={{
                strokeDasharray: 24,
                strokeDashoffset: showPassword ? 0 : 24,
                transition: 'stroke-dashoffset 240ms cubic-bezier(0.2, 0, 0, 1)',
              }}
            />
          </svg>
        </button>
      }
      {...rest}
    />
  );
});

export default PasswordField;
