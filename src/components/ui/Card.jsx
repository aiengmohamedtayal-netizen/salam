import { cn } from '@/lib/utils';

/**
 * Surface card container.
 * @param {object} props
 * @param {'default'|'elevated'|'bordered'} [props.variant]
 * @param {'sm'|'md'|'lg'|'none'} [props.padding]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export function Card({ variant = 'default', padding = 'md', className, children, ...rest }) {
  const variantClasses = {
    default: 'bg-surface-card shadow-[var(--shadow-card)] border border-surface-border',
    elevated: 'bg-surface-elevated shadow-[var(--shadow-lg)]',
    bordered: 'bg-surface-card border-2 border-surface-border-strong',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)]',
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Card header section with bottom border.
 */
export function CardHeader({ className, children, ...rest }) {
  return (
    <div className={cn('pb-4 border-b border-surface-border', className)} {...rest}>
      {children}
    </div>
  );
}

/**
 * Card content section.
 */
export function CardContent({ className, children, ...rest }) {
  return (
    <div className={cn('py-4', className)} {...rest}>
      {children}
    </div>
  );
}

/**
 * Card footer section with top border.
 */
export function CardFooter({ className, children, ...rest }) {
  return (
    <div className={cn('pt-4 border-t border-surface-border', className)} {...rest}>
      {children}
    </div>
  );
}
