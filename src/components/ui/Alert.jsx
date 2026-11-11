import { useState } from 'react';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { AppIcon } from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-[var(--radius-xl)] p-4 border text-sm leading-relaxed transition-all flex gap-3 items-start',
  {
    variants: {
      variant: {
        info: 'bg-sky-50/70 border-sky-200 text-sky-900 dark:bg-sky-950/35 dark:border-sky-800/70 dark:text-sky-100',
        warning: 'bg-amber-50/80 border-amber-200 text-amber-950 dark:bg-amber-950/35 dark:border-amber-800/70 dark:text-amber-800',
        success: 'bg-emerald-50/80 border-emerald-200 text-emerald-950 dark:bg-emerald-950/35 dark:border-emerald-800/70 dark:text-emerald-900',
        error: 'bg-rose-50/80 border-rose-200 text-rose-950 dark:bg-rose-950/35 dark:border-rose-800/70 dark:text-rose-900',
        disclaimer: 'bg-teal-50/90 border-teal-200 text-teal-950 shadow-sm dark:bg-primary-950/45 dark:border-primary-800/70 dark:text-text-primary',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const defaultVectorIcons = {
  info: 'info',
  warning: 'warning',
  success: 'check',
  error: 'error',
  disclaimer: 'shield',
};

/**
 * Accessible Alert banner component.
 * Features Iconsax Two-Tone icons with color-matched squircle badges.
 *
 * @param {object} props
 * @param {'info'|'warning'|'success'|'error'|'disclaimer'} [props.variant]
 * @param {string} [props.title]
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.icon]
 * @param {boolean} [props.dismissible]
 * @param {() => void} [props.onDismiss]
 * @param {string} [props.className]
 */
export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  className,
  ...rest
}) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const iconName = defaultVectorIcons[variant] || 'info';

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...rest}
    >
      <div className="shrink-0 pt-0.5">
        {icon || (
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center border shadow-xs shrink-0',
              variant === 'disclaimer' && 'bg-teal-500/15 border-teal-500/30 text-teal-700 dark:text-teal-300',
              variant === 'warning' && 'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300',
              variant === 'success' && 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
              variant === 'error' && 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300',
              variant === 'info' && 'bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300'
            )}
          >
            <AppIcon name={iconName} size="sm" style="two-tone" />
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-bold text-base leading-snug">{title}</h5>}
        <div className="text-sm opacity-95">{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1 -m-1 rounded-md text-current opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-2 focus-visible:outline-current cursor-pointer"
          aria-label="إغلاق التنبيه"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default Alert;
