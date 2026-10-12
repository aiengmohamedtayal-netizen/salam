import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-medium rounded-[var(--radius-full)] select-none transition-colors',
  {
    variants: {
      variant: {
        safe: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        attention: 'bg-amber-50 text-amber-800 border border-amber-200',
        elevated: 'bg-rose-50 text-rose-800 border border-rose-200',
        info: 'bg-sky-50 text-sky-800 border border-sky-200',
        primary: 'bg-teal-50 text-teal-800 border border-teal-200',
        default: 'bg-slate-100 text-slate-700 border border-slate-200',
      },
      size: {
        sm: 'text-xs px-2.5 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-3.5 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

/**
 * Status and category Badge component.
 * @param {object} props
 * @param {'safe'|'attention'|'elevated'|'info'|'primary'|'default'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {React.ReactNode} [props.icon]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Badge({ variant, size, icon, className, children, ...rest }) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...rest}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export { badgeVariants };
