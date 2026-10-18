import { useState, useRef, useEffect, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

/**
 * ImageUploader Component
 * Provides drag-and-drop & file selection with client-side preview,
 * size/type validation, memory cleanup, and remove/replace controls.
 *
 * @param {object} props
 * @param {File|null} props.file
 * @param {string|null} props.previewUrl
 * @param {(file: File|null, previewUrl: string|null) => void} props.onChange
 * @param {string} [props.className]
 */
export function ImageUploader({ file, previewUrl, onChange, className }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleFileProcess = useCallback((selectedFile) => {
    setErrorMessage(null);

    if (!selectedFile) return;

    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setErrorMessage(t('multimodal.typeError'));
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(t('multimodal.sizeError'));
      return;
    }

    // Revoke previous object URL if one existed
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const newUrl = URL.createObjectURL(selectedFile);
    onChange(selectedFile, newUrl);
  }, [previewUrl, onChange, t]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    onChange(null, null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Cleanup blob URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-semibold text-text-primary flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-teal-600" aria-hidden="true" />
          {t('multimodal.imageLabel')}
        </span>
        {file && (
          <span className="text-xs text-text-muted font-normal">
            {formatFileSize(file.size)}
          </span>
        )}
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileProcess(e.target.files[0]);
          }
        }}
        aria-label={t('multimodal.imageLabel')}
      />

      {/* Dropzone / Preview Area */}
      {!previewUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrowseClick();
            }
          }}
          className={cn(
            'flex flex-col items-center justify-center p-6 rounded-[var(--radius-xl)] border-2 border-dashed transition-all duration-200 cursor-pointer text-center select-none',
            isDragging
              ? 'border-teal-500 bg-teal-500/10 scale-[1.01]'
              : 'border-surface-border bg-surface-card/60 hover:bg-surface-card hover:border-teal-500/40',
            errorMessage ? 'border-rose-400 bg-rose-50/50' : ''
          )}
        >
          <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 mb-3 shadow-sm">
            <UploadCloud className="w-6 h-6" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-text-primary">
            {t('multimodal.dropzoneText')}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {t('multimodal.dropzoneHint')}
          </p>
        </div>
      ) : (
        <div className="relative rounded-[var(--radius-xl)] border border-surface-border overflow-hidden bg-slate-900/5 group shadow-sm">
          {/* Image Preview */}
          <div className="max-h-64 flex items-center justify-center bg-black/10 overflow-hidden">
            <img
              src={previewUrl}
              alt="Uploaded post media preview"
              className="w-full h-auto max-h-64 object-contain rounded-t-[calc(var(--radius-xl)-1px)] transition-transform duration-300 group-hover:scale-[1.01]"
            />
          </div>

          {/* Action Bar */}
          <div className="p-3 bg-surface-card border-t border-surface-border flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-hidden text-text-secondary">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <span className="truncate font-medium">{file?.name || t('multimodal.imageUploaded')}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBrowseClick}
                className="h-8 px-2.5 text-xs text-text-secondary hover:text-teal-700 flex items-center gap-1.5"
                title={t('multimodal.replaceImage')}
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('multimodal.replaceImage')}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-8 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center gap-1.5"
                title={t('multimodal.removeImage')}
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t('multimodal.removeImage')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1 font-medium" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
