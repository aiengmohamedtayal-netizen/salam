import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Activity, GitMerge, Sparkles } from 'lucide-react';
import { MultimodalAnalysisCard } from '../components/MultimodalAnalysisCard';
import { SocialPostPreview } from '../components/SocialPostPreview';
import { AnalysisProcess } from '../components/AnalysisProcess';
import { MultimodalResult } from '../components/MultimodalResult';
import { AnalysisPipelineVisual } from '../components/AnalysisPipelineVisual';
import { SignalOverview } from '../components/SignalOverview';
import { useTranslation } from '@/context/LanguageContext';
import { fadeUp, safeMotion } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * MultimodalAnalysisPage Component
 * Main page for multimodal social-media content analysis.
 * Fully interactive frontend simulation adhering to the SALAM design system.
 */
export function MultimodalAnalysisPage() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('workspace');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [viewState, setViewState] = useState('input'); // 'input' | 'analyzing' | 'result'

  // Determine active input modality across Text, Image, Voice
  const modality = useMemo(() => {
    const hasText = text && text.trim().length > 0;
    const hasImage = Boolean(imagePreviewUrl);
    const hasAudio = Boolean(audioUrl && audioDuration >= 2);

    if (hasText && hasImage && hasAudio) return 'triModal';
    if (hasText && hasImage) return 'multimodal';
    if (hasText && hasAudio) return 'textVoice';
    if (hasImage && hasAudio) return 'imageVoice';
    if (hasText) return 'textOnly';
    if (hasImage) return 'imageOnly';
    if (hasAudio) return 'voiceOnly';
    return 'empty';
  }, [text, imagePreviewUrl, audioUrl, audioDuration]);

  const handleImageChange = (file, url) => {
    setImageFile(file);
    setImagePreviewUrl(url);
  };

  const handleAudioChange = (blob, url, duration) => {
    setAudioBlob(blob);
    setAudioUrl(url);
    setAudioDuration(duration);
  };

  const handleReset = () => {
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setText('');
    setImageFile(null);
    setImagePreviewUrl(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setAudioDuration(0);
    setViewState('input');
  };

  const handleStartAnalysis = () => {
    if (modality === 'empty') return;
    setViewState('analyzing');
  };

  const handleAnalysisComplete = () => {
    setViewState('result');
  };

  const tabs = [
    { id: 'workspace', label: t('multimodal.tabs.workspace'), icon: Layers },
    { id: 'pipeline', label: t('multimodal.tabs.pipeline'), icon: GitMerge },
    { id: 'overview', label: t('multimodal.tabs.overview'), icon: Activity },
  ];

  return (
    <motion.main
      {...safeMotion(fadeUp)}
      className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-800">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
          <span>{t('multimodal.pageBadge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          {t('multimodal.pageTitle')}
        </h1>

        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          {t('multimodal.pageSubtitle')}
        </p>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center pt-2">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated/80 border border-surface-border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150',
                    isSelected
                      ? 'bg-surface-card text-teal-700 shadow-sm border border-surface-border'
                      : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'workspace' && (
          <motion.div
            key="workspace-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            {viewState === 'input' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left (Desktop): Input Workspace Card */}
                <div className="lg:col-span-7">
                  <MultimodalAnalysisCard
                    text={text}
                    onTextChange={setText}
                    imageFile={imageFile}
                    imagePreviewUrl={imagePreviewUrl}
                    onImageChange={handleImageChange}
                    audioBlob={audioBlob}
                    audioUrl={audioUrl}
                    audioDuration={audioDuration}
                    onAudioChange={handleAudioChange}
                    modality={modality}
                    onAnalyze={handleStartAnalysis}
                    onReset={handleReset}
                  />
                </div>

                {/* Right (Desktop): Live Social Post Preview */}
                <div className="lg:col-span-5 space-y-3 sticky top-24">
                  <div className="text-xs font-bold text-text-secondary px-1">
                    {t('multimodal.postPreviewTitle')}
                  </div>
                  <SocialPostPreview
                    text={text}
                    imageUrl={imagePreviewUrl}
                    audioUrl={audioUrl}
                    audioDuration={audioDuration}
                  />
                </div>
              </div>
            )}

            {viewState === 'analyzing' && (
              <div className="max-w-2xl mx-auto">
                <AnalysisProcess
                  modality={modality}
                  onComplete={handleAnalysisComplete}
                />
              </div>
            )}

            {viewState === 'result' && (
              <div className="max-w-4xl mx-auto">
                <MultimodalResult
                  modality={modality}
                  onReset={handleReset}
                />
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'pipeline' && (
          <motion.div
            key="pipeline-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <AnalysisPipelineVisual />
          </motion.div>
        )}

        {activeTab === 'overview' && (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <SignalOverview />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
