import { cn } from '@/lib/utils';

/**
 * Skeleton loading placeholder.
 * @param {object} props
 * @param {'text'|'circular'|'rectangular'|'rounded'} [props.variant]
 * @param {string|number} [props.width]
 * @param {string|number} [props.height]
 * @param {string} [props.className]
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  ...rest
}) {
  const variantClasses = {
    text: 'h-4 w-full rounded-[var(--radius-sm)]',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-none',
    rounded: 'rounded-[var(--radius-xl)]',
  };

  const style = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-slate-200/80',
        variantClasses[variant],
        className
      )}
      style={style}
      {...rest}
    />
  );
}
