import { cn } from '@/lib/utils';

/**
 * Visual divider with optional text for separating authentication form sections.
 * @param {object} props
 * @param {React.ReactNode} [props.children]
 * @param {string} [props.className]
 */
export function AuthDivider({ children, className }) {
  return (
    <div className={cn('relative flex items-center my-6', className)} role="separator">
      <div className="flex-grow border-t border-surface-border" />
      {children && (
        <span className="shrink-0 px-3 text-xs font-medium text-text-muted select-none">
          {children}
        </span>
      )}
      <div className="flex-grow border-t border-surface-border" />
    </div>
  );
}
