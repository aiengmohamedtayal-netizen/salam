import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

/**
 * EmptyState feedback component.
 * @param {object} props
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string} [props.actionLabel]
 * @param {() => void} [props.onAction]
 * @param {React.ReactNode} [props.children]
 * @param {string} [props.className]
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[var(--radius-2xl)] border border-dashed border-surface-border bg-surface-card/60 max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 mb-4 shadow-xs">
        {icon || <Inbox className="h-7 w-7" aria-hidden="true" />}
      </div>

      <h3 className="text-lg font-bold text-text-primary mb-2 leading-snug">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-text-secondary leading-relaxed max-w-sm mb-6">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}

      {children}
    </div>
  );
}
