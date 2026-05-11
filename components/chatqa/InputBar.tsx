'use client';

import { useRef, useState, useCallback, KeyboardEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUploadButton } from './FileUploadButton';
import { VoiceButton } from './VoiceButton';
import { ModelSelector } from './ModelSelector';
import { DataSourceToggle } from './DataSourceToggle';
import { ModeSelector } from './ModeSelector';
import { PlanModeToggle } from './PlanModeToggle';
import type { InputBarProps, ChatSettings } from '@/types/chatqa';

interface ExtendedInputBarProps extends InputBarProps {
  pendingFiles: File[];
  onRemoveFile: (index: number) => void;
  onFilesAdded: (files: File[]) => void;
  voiceTranscript: string;
  isListening: boolean;
  voiceSupported: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  prefillText?: string;
  onPrefillConsumed?: () => void;
}

export function InputBar({
  onSend,
  isStreaming,
  onStop,
  settings,
  onSettingsChange,
  pendingFiles,
  onRemoveFile,
  onFilesAdded,
  voiceTranscript,
  isListening,
  voiceSupported,
  onStartListening,
  onStopListening,
  prefillText,
  onPrefillConsumed,
}: ExtendedInputBarProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Apply prefill text from prompt selection
  useEffect(() => {
    if (prefillText) {
      setContent(prefillText);
      onPrefillConsumed?.();
      // Focus the textarea so user can immediately augment
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [prefillText, onPrefillConsumed]);

  // Apply voice transcript — hook only emits new finalized text via append
  const prevTranscriptLenRef = useRef(0);
  useEffect(() => {
    if (voiceTranscript.length > prevTranscriptLenRef.current) {
      const newText = voiceTranscript.slice(prevTranscriptLenRef.current);
      setContent((prev) => prev + newText);
      prevTranscriptLenRef.current = voiceTranscript.length;
    }
  }, [voiceTranscript]);

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  const hasContent = content.trim().length > 0 || pendingFiles.length > 0;

  const handleSend = useCallback(() => {
    if (!hasContent || isStreaming) return;
    onSend(content.trim(), pendingFiles.length > 0 ? pendingFiles : undefined);
    setContent('');
  }, [content, pendingFiles, hasContent, isStreaming, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-5 pb-5 pt-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl rounded-2xl border border-chatqa-border bg-chatqa-surface/80 backdrop-blur-xl shadow-lg"
      >
        {/* Settings pills row */}
        <div className="flex items-center justify-end gap-2 px-5 pt-3">
          <ModelSelector
            value={settings.model}
            onChange={(model) => onSettingsChange({ model })}
          />
          <DataSourceToggle
            value={settings.dataSource}
            onChange={(dataSource) => onSettingsChange({ dataSource })}
          />
          <ModeSelector
            value={settings.mode}
            onChange={(mode) => onSettingsChange({ mode })}
          />
        </div>

        {/* File chips area */}
        <AnimatePresence>
          {pendingFiles.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto px-5 pt-3 pb-1 scrollbar-hide">
                {pendingFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-chatqa-bg px-2.5 py-1.5 text-xs text-chatqa-text-secondary border border-chatqa-border"
                  >
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <button
                      onClick={() => onRemoveFile(index)}
                      className="rounded p-0.5 hover:bg-chatqa-border transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <div className="px-5 pt-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            className="w-full resize-none bg-transparent text-chatqa-text placeholder:text-chatqa-text-muted outline-none text-sm leading-relaxed max-h-[200px]"
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 pb-3 pt-2">
          <div className="flex items-center gap-2">
            <FileUploadButton onFilesAdded={onFilesAdded} disabled={isStreaming} />
            <VoiceButton
              isListening={isListening}
              isSupported={voiceSupported}
              onStart={onStartListening}
              onStop={onStopListening}
            />
          </div>

          <div className="flex items-center gap-2">
            <PlanModeToggle
              enabled={settings.planMode}
              onChange={(planMode) => onSettingsChange({ planMode })}
            />
            {isStreaming ? (
              <Button
                size="icon"
                onClick={onStop}
                className="h-8 w-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!hasContent}
                className={`h-8 w-8 rounded-lg transition-colors ${
                  hasContent
                    ? 'bg-chatqa-accent text-white hover:bg-chatqa-accent-hover'
                    : 'bg-chatqa-border text-chatqa-text-muted'
                }`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
