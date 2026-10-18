import { useState } from 'react';
import { Play, RotateCcw, Sparkles, Type, Image as ImageIcon, Mic, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ModalityBadge } from './ModalityBadge';
import { ImageUploader } from './ImageUploader';
import { VoiceRecorder } from '@/features/voice/components/VoiceRecorder';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

/**
 * MultimodalAnalysisCard Component
 * Primary workspace container providing text inputs, image uploads, voice recording,
 * live modality detection badges, and execution controls.
 *
 * @param {object} props
 * @param {string} props.text
 * @param {(text: string) => void} props.onTextChange
 * @param {File|null} props.imageFile
 * @param {string|null} props.imagePreviewUrl
 * @param {(file: File|null, url: string|null) => void} props.onImageChange
 * @param {Blob|null} props.audioBlob
 * @param {string|null} props.audioUrl
 * @param {number} props.audioDuration
 * @param {(blob: Blob|null, url: string|null, duration: number) => void} props.onAudioChange
 * @param {string} props.modality
 * @param {() => void} props.onAnalyze
 * @param {() => void} props.onReset
 * @param {boolean} [props.isLoading]
 * @param {string} [props.className]
 */
export function MultimodalAnalysisCard({
  text,
  onTextChange,
  imageFile,
  imagePreviewUrl,
  onImageChange,
  audioBlob,
  audioUrl,
  audioDuration = 0,
  onAudioChange,
  modality,
  onAnalyze,
  onReset,
  isLoading = false,
  className,
}) {
  const { t } = useTranslation();
  const [activeInputTab, setActiveInputTab] = useState('text'); // 'text' | 'image' | 'voice'

  const hasText = text && text.trim().length > 0;
  const hasImage = Boolean(imagePreviewUrl);
  const hasAudio = Boolean(audioUrl && audioDuration >= 2);
  const hasInput = hasText || hasImage || hasAudio;

  const inputTabs = [
    { id: 'text', label: 'النص', labelEn: 'Text', icon: Type, active: hasText },
    { id: 'image', label: 'الصورة', labelEn: 'Image', icon: ImageIcon, active: hasImage },
    { id: 'voice', label: 'الصوت', labelEn: 'Voice', icon: Mic, active: hasAudio },
  ];

  return (
    <Card
      variant="default"
      padding="lg"
      className={cn('space-y-6 border border-surface-border bg-surface-card', className)}
    >
      {/* Header with Title and Dynamic Modality Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" aria-hidden="true" />
            <h3 className="text-base font-bold text-text-primary">
              {t('multimodal.cardTitle')}
            </h3>
          </div>
          <p className="text-xs text-text-muted">
            {t('multimodal.cardSubtitle')}
          </p>
        </div>

        <div className="self-start sm:self-center">
          <ModalityBadge modality={modality} />
        </div>
      </div>

      {/* Input Modality Selectors (Tabs with active checkmarks) */}
      <div className="flex items-center gap-2 pb-1 border-b border-surface-border/60">
        <span className="text-xs text-text-muted font-medium ml-1 rtl:ml-0 rtl:mr-1">
          وسائط الإدخال:
        </span>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-surface-elevated border border-surface-border">
          {inputTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeInputTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveInputTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all',
                  isSelected
                    ? 'bg-surface-card text-teal-700 shadow-sm border border-surface-border'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.active && (
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">
                    <Check className="w-2.5 h-2.5 stroke-[3]" aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Controls for Selected Input Modality */}
      <div className="space-y-5">
        {activeInputTab === 'text' && (
          <Textarea
            label={t('multimodal.textLabel')}
            placeholder={t('multimodal.textPlaceholder')}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            maxLength={1000}
            showCount
            className="w-full"
          />
        )}

        {activeInputTab === 'image' && (
          <ImageUploader
            file={imageFile}
            previewUrl={imagePreviewUrl}
            onChange={onImageChange}
          />
        )}

        {activeInputTab === 'voice' && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-teal-600" aria-hidden="true" />
              <span>{t('voice.cardTitle')}</span>
            </label>
            <VoiceRecorder
              audioBlob={audioBlob}
              audioUrl={audioUrl}
              duration={audioDuration}
              onChange={onAudioChange}
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-border">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onReset}
          disabled={!hasInput || isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('multimodal.resetCta')}</span>
        </Button>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onAnalyze}
          disabled={!hasInput || isLoading}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          <span>{isLoading ? t('multimodal.analyzingCta') : t('multimodal.analyzeCta')}</span>
        </Button>
      </div>
    </Card>
  );
}
