import { cn } from '@/lib/utils';

/**
 * Standardized container for form actions (submit, cancel, back).
 * @param {object} props
 * @param {'start'|'center'|'end'|'between'} [props.align]
 * @param {boolean} [props.stickyMobile]
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function FormActions({
  align = 'end',
  stickyMobile = false,
  children,
  className,
}) {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 pt-6 border-t border-surface-border',
        alignClasses[align],
        stickyMobile &&
          'max-sm:fixed max-sm:bottom-0 max-sm:inset-x-0 max-sm:p-4 max-sm:bg-surface-card/95 max-sm:backdrop-blur-md max-sm:border-t max-sm:border-surface-border max-sm:shadow-lg max-sm:z-30',
        className
      )}
    >
      {children}
    </div>
  );
}
