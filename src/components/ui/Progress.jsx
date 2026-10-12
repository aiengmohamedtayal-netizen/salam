import { cn } from '@/lib/utils';

/**
 * Progress component supporting linear and circular presentations.
 * @param {object} props
 * @param {number} [props.value] - Progress value (0 to 100)
 * @param {'linear'|'circular'} [props.variant]
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {'primary'|'safe'|'attention'|'elevated'} [props.color]
 * @param {boolean} [props.indeterminate]
 * @param {string} [props.label]
 * @param {boolean} [props.showValue]
 * @param {string} [props.className]
 */
export function Progress({
  value = 0,
  variant = 'linear',
  size = 'md',
  color = 'primary',
  indeterminate = false,
  label,
  showValue = false,
  className,
}) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorClasses = {
    primary: 'bg-teal-600',
    safe: 'bg-emerald-600',
    attention: 'bg-amber-500',
    elevated: 'bg-rose-500',
  };

  const ringColorClasses = {
    primary: 'text-teal-600',
    safe: 'text-emerald-600',
    attention: 'text-amber-500',
    elevated: 'text-rose-500',
  };

  if (variant === 'circular') {
    const sizePx = size === 'sm' ? 48 : size === 'lg' ? 96 : 64;
    const strokeWidth = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
    const radius = (sizePx - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

    return (
      <div
        className={cn('inline-flex flex-col items-center justify-center gap-1', className)}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'مؤشر التقدم'}
      >
        <div className="relative inline-flex items-center justify-center">
          <svg
            width={sizePx}
            height={sizePx}
            viewBox={`0 0 ${sizePx} ${sizePx}`}
            className="-rotate-90 transform"
          >
            <circle
              cx={sizePx / 2}
              cy={sizePx / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-surface-border fill-transparent"
            />
            <circle
              cx={sizePx / 2}
              cy={sizePx / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={indeterminate ? 0 : strokeDashoffset}
              strokeLinecap="round"
              className={cn(
                'fill-transparent transition-all duration-500 ease-out',
                ringColorClasses[color],
                indeterminate && 'animate-spin origin-center'
              )}
            />
          </svg>
          {showValue && !indeterminate && (
            <span className="absolute text-xs font-bold tabular-nums text-text-primary">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
        {label && <span className="text-xs text-text-secondary">{label}</span>}
      </div>
    );
  }

  // Linear Variant
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
          {label && <span>{label}</span>}
          {showValue && !indeterminate && (
            <span className="tabular-nums font-semibold text-text-primary">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'مستوى الإنجاز'}
        className={cn(
          'w-full bg-surface-muted rounded-[var(--radius-full)] overflow-hidden relative border border-surface-border/40',
          heightClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-[var(--radius-full)] transition-all duration-500 ease-out',
            colorClasses[color],
            indeterminate && 'w-2/5 animate-[pulse_1.5s_infinite]'
          )}
          style={{ width: indeterminate ? '40%' : `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
