import { cn } from '@/lib/utils';

export function AssistantAvatar({ className }) {
  return (
    <img
      src="/icons/assistant/amal-companion.png"
      alt=""
      aria-hidden="true"
      draggable="false"
      className={cn('pointer-events-none select-none object-contain', className)}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
