import { Type, Image as ImageIcon, Layers, Sparkles, Mic } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * ModalityBadge Component
 * Dynamically displays the active input modality:
 * - Empty: Awaiting Input
 * - Text-only
 * - Image-only
 * - Voice-only
 * - Text + Image (Multimodal)
 * - Text + Voice
 * - Image + Voice
 * - Tri-Modal (Text + Image + Voice)
 *
 * @param {object} props
 * @param {string} [props.modality='empty']
 * @param {string} [props.className]
 */
export function ModalityBadge({ modality = 'empty', className }) {
  const { t } = useTranslation();

  const configs = {
    empty: {
      label: t('multimodal.modalities.empty'),
      icon: Sparkles,
      color: 'bg-surface-elevated/70 text-text-muted border-surface-border',
      dot: 'bg-text-muted/40',
    },
    textOnly: {
      label: t('multimodal.modalities.textOnly'),
      icon: Type,
      color: 'bg-teal-500/10 text-teal-700 border-teal-500/30',
      dot: 'bg-teal-500',
    },
    imageOnly: {
      label: t('multimodal.modalities.imageOnly'),
      icon: ImageIcon,
      color: 'bg-sky-500/10 text-sky-700 border-sky-500/30',
      dot: 'bg-sky-500',
    },
    voiceOnly: {
      label: t('multimodal.modalities.voiceOnly'),
      icon: Mic,
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    multimodal: {
      label: t('multimodal.modalities.multimodal'),
      icon: Layers,
      color: 'bg-amber-500/15 text-amber-800 border-amber-500/40 ring-1 ring-amber-500/20',
      dot: 'bg-amber-500 animate-pulse',
    },
    textVoice: {
      label: t('multimodal.modalities.textVoice'),
      icon: Mic,
      color: 'bg-teal-500/15 text-teal-800 border-teal-500/40 ring-1 ring-teal-500/20',
      dot: 'bg-teal-600 animate-pulse',
    },
    imageVoice: {
      label: t('multimodal.modalities.imageVoice'),
      icon: Layers,
      color: 'bg-sky-500/15 text-sky-800 border-sky-500/40 ring-1 ring-sky-500/20',
      dot: 'bg-sky-600 animate-pulse',
    },
    triModal: {
      label: t('multimodal.modalities.triModal'),
      icon: Sparkles,
      color: 'bg-indigo-500/15 text-indigo-800 border-indigo-500/40 ring-1 ring-indigo-500/20',
      dot: 'bg-indigo-600 animate-pulse',
    },
  };

  const current = configs[modality] || configs.empty;
  const Icon = current.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all duration-200',
        current.color,
        className
      )}
      role="status"
      aria-label={`${t('multimodal.modalityLabel')} ${current.label}`}
    >
      <span className={cn('w-2 h-2 rounded-full', current.dot)} aria-hidden="true" />
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{current.label}</span>
    </div>
  );
}
