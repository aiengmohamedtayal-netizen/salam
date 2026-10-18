import { cn } from '@/lib/utils';

/**
 * Accessible SVG/CSS fallback when WebGL is unavailable or disabled.
 * Renders an abstract linguistic neural network using SALAM design tokens.
 * @param {object} props
 * @param {string} [props.className]
 */
export function WebGLFallback({ className }) {
  return (
    <div
      className={cn(
        'relative w-full h-full min-h-[260px] flex items-center justify-center overflow-hidden bg-transparent pointer-events-none select-none',
        className
      )}
      aria-hidden="true"
    >
      {/* Decorative SVG network pattern */}
      <svg
        className="w-full h-full max-w-md max-h-[360px] opacity-75"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 300"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="salam-node-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="salam-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Connection lines */}
        <g stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6">
          <line x1="200" y1="150" x2="120" y2="80" />
          <line x1="200" y1="150" x2="280" y2="90" />
          <line x1="200" y1="150" x2="110" y2="210" />
          <line x1="200" y1="150" x2="290" y2="210" />
          <line x1="120" y1="80" x2="280" y2="90" />
          <line x1="110" y1="210" x2="290" y2="210" />
          <line x1="60" y1="150" x2="120" y2="80" />
          <line x1="340" y1="150" x2="280" y2="90" />
          <line x1="60" y1="150" x2="110" y2="210" />
          <line x1="340" y1="150" x2="290" y2="210" />
        </g>

        {/* Central Core Nodes */}
        <circle cx="200" cy="150" r="28" fill="#f0fdfa" stroke="#14b8a6" strokeWidth="2" opacity="0.8" />
        <circle cx="200" cy="150" r="14" fill="url(#salam-node-grad)" />

        {/* Surrounding NLP Nodes */}
        <circle cx="120" cy="80" r="10" fill="url(#salam-node-grad)" />
        <circle cx="280" cy="90" r="12" fill="url(#salam-gold-grad)" />
        <circle cx="110" cy="210" r="11" fill="url(#salam-node-grad)" />
        <circle cx="290" cy="210" r="9" fill="url(#salam-node-grad)" />
        <circle cx="60" cy="150" r="7" fill="#99f6e4" />
        <circle cx="340" cy="150" r="8" fill="#fde68a" />
      </svg>
    </div>
  );
}
