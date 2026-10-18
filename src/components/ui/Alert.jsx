import { useState } from 'react';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { Icon3D } from '@/components/ui/Icon3D';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-[var(--radius-xl)] p-4 border text-sm leading-relaxed transition-all flex gap-3 items-start',
  {
    variants: {
      variant: {
        info: 'bg-sky-50/70 border-sky-200 text-sky-900',
        warning: 'bg-amber-50/80 border-amber-200 text-amber-950',
        success: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
        error: 'bg-rose-50/80 border-rose-200 text-rose-950',
        disclaimer: 'bg-teal-50/90 border-teal-200 text-teal-950 shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const default3DIcons = {
  info: 'lightbulb',
  warning: 'lifebuoy',
  success: 'care',
  error: 'lifebuoy',
  disclaimer: 'shield',
};

/**
 * Accessible Alert banner component.
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

  const iconName = default3DIcons[variant] || 'lightbulb';

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
        {icon || <Icon3D name={iconName} size="md" className="w-6 h-6 object-contain drop-shadow-xs" />}
      </div>
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-bold text-base leading-snug">{title}</h5>}
        <div className="text-sm opacity-95">{children}</div>
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 p-1 -m-1 rounded-md text-current opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-2 focus-visible:outline-current"
          aria-label="إغلاق التنبيه"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
