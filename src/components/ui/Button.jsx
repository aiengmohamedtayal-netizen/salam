import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-[var(--radius-lg)] cursor-pointer',
    'transition-colors duration-200',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'select-none whitespace-nowrap',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-text-on-primary hover:bg-primary-700 active:bg-primary-800',
        secondary:
          'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200',
        outline:
          'border border-surface-border text-text-primary hover:bg-surface-muted active:bg-surface-border/30',
        ghost:
          'text-text-secondary hover:bg-surface-muted active:bg-surface-border/30',
        danger:
          'bg-error text-white hover:bg-red-600 active:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-5 text-base',
        lg: 'h-12 px-7 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

/**
 * Shared Button component.
 * @param {object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {boolean} [props.loading]
 * @param {boolean} [props.fullWidth]
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.children]
 */
export const Button = forwardRef(function Button(
  { variant, size, loading, fullWidth, className, children, disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant, size }),
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});

export { buttonVariants };
