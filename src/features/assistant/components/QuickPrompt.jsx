import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { chipEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * A clickable quick prompt. It reads as a soft suggestion chip rather than a
 * badge: the question plus a trailing arrow that nudges on hover. Clicking
 * sends the text exactly as if it had been typed.
 */
export function QuickPrompt({ text, onSelect, index = 0 }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(text)}
      {...chipEnter}
      transition={{ ...chipEnter.transition, delay: index * 0.04 }}
      className={cn(
        'group inline-flex shrink-0 cursor-pointer items-center gap-2',
        'rounded-[var(--radius-lg)] border border-surface-border bg-surface-card/90',
        'px-3 py-2.5 text-start text-xs font-semibold text-text-secondary',
        'shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        'transition-[transform,box-shadow,border-color,color] duration-200',
        'hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-700',
        'hover:shadow-[0_8px_16px_-10px_rgba(112,64,154,0.5)]',
        'active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
      )}
    >
      <span className="whitespace-nowrap">{text}</span>
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180"
        aria-hidden="true"
      />
    </motion.button>
  );
}
