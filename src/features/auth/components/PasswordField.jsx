import { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/context/LanguageContext';

/**
 * Reusable PasswordField with accessible show/hide toggle and start lock icon.
 * Follows WCAG 2.1 AA accessibility guidelines with visible focus state.
 */
export const PasswordField = forwardRef(function PasswordField(
  { label, error, helperText, className, id, ...rest },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

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
          className="p-1 rounded-md text-text-muted hover:text-text-primary transition-colors focus-visible:outline-2 focus-visible:outline-primary-500 cursor-pointer"
          aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      }
      {...rest}
    />
  );
});
