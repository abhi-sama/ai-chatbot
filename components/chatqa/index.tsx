'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  ChatQAProps,
  ChatSettings,
  ExportFormat,
  ExportScope,
  Attachment,
} from '@/types/chatqa';
import { useChat } from '@/hooks/useChat';
import { useConversations } from '@/hooks/useConversations';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { usePrompts } from '@/hooks/usePrompts';
import {
  exportConversationToPDF,
  exportConversationToWord,
  truncateTitle,
} from '@/lib/chatqa-utils';
import { ChatLayout } from '@/components/chatqa/ChatLayout';
import { InputBar } from '@/components/chatqa/InputBar';
import { NewConversationScreen } from '@/components/chatqa/NewConversationScreen';
import { PromptLibraryModal } from '@/components/chatqa/PromptLibraryModal';

// Apply theme before first paint (runs once, client-only since ssr:false)
function initTheme() {
  try {
    const t = localStorage.getItem('chatqa-theme');
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {}
}

export default function ChatQA({ userId, className }: ChatQAProps) {
  // Init theme on mount
  useEffect(() => { initTheme(); }, []);

  // ─── Settings State ─────────────────────────────────────────────────────
  const [settings, setSettings] = useState<ChatSettings>({
    mode: 'assistant',
    model: 'claude-3-5-sonnet-20241022',
    dataSource: 'both',
  });

  const [promptLibraryOpen, setPromptLibraryOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [prefillText, setPrefillText] = useState('');

  // ─── Hooks ──────────────────────────────────────────────────────────────
  const {
    conversations,
    activeConversation,
    isLoading: conversationsLoading,
    createConversation,
    deleteConversation,
    selectConversation,
    renameConversation,
  } = useConversations({ userId: userId ?? 'anonymous' });

  const {
    messages,
    isStreaming,
    connectionStatus,
    sendMessage,
    stopStreaming,
    retryLastMessage,
    prepareForNewConversation,
  } = useChat({
    conversationId: activeConversation?.id ?? null,
    settings,
  });

  const {
    uploadFile,
    isUploading,
    progress: uploadProgress,
    error: uploadError,
    clearError: clearUploadError,
  } = useFileUpload();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: voiceSupported,
    error: voiceError,
  } = useVoiceInput();

  const {
    prompts,
    defaultPrompts,
    isLoading: promptsLoading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    togglePin,
    pinnedPrompts,
    reorderPinned,
  } = usePrompts({ userId: userId ?? 'anonymous' });

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleSettingsChange = useCallback(
    (updates: Partial<ChatSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleNewConversation = useCallback(async () => {
    selectConversation(''); // deselect to show prompt screen
    setPendingAttachments([]);
  }, [selectConversation]);

  const handleSend = useCallback(
    async (content: string, files?: File[]) => {
      // Upload any attached files first
      let attachments = [...pendingAttachments];
      if (files && files.length > 0) {
        const uploaded = await Promise.all(files.map((f) => uploadFile(f)));
        attachments = [...attachments, ...uploaded];
      }

      // If no active conversation, create one first
      if (!activeConversation) {
        const title = truncateTitle(content);
        prepareForNewConversation(); // prevent useEffect from wiping messages
        const newConvo = await createConversation();
        if (newConvo) {
          await renameConversation(newConvo.id, title);
          // Wait a tick so conversationIdRef updates before sendMessage reads it
          await new Promise((r) => setTimeout(r, 0));
        }
      } else if (messages.length === 0) {
        const title = truncateTitle(content);
        await renameConversation(activeConversation.id, title);
      }

      await sendMessage(content, files);
      setPendingAttachments([]);
    },
    [
      activeConversation,
      messages.length,
      pendingAttachments,
      uploadFile,
      createConversation,
      renameConversation,
      sendMessage,
    ]
  );

  const handleFileAdd = useCallback(
    async (file: File) => {
      const attachment = await uploadFile(file);
      setPendingAttachments((prev) => [...prev, attachment]);
    },
    [uploadFile]
  );

  const handleExport = useCallback(
    (format: ExportFormat, scope: ExportScope) => {
      const title = activeConversation?.title ?? 'Conversation';
      if (format === 'pdf') {
        exportConversationToPDF(messages, title, scope);
      } else {
        exportConversationToWord(messages, title, scope);
      }
    },
    [messages, activeConversation]
  );

  const handlePromptSelect = useCallback(
    (content: string) => {
      setPrefillText(content);
    },
    []
  );

  // ─── Derived State ──────────────────────────────────────────────────────
  const showNewConversationScreen = !activeConversation || messages.length === 0;

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className={`flex-1 min-h-0 ${className ?? ''}`}>
      <ChatLayout
        conversations={conversations}
        activeConversationId={activeConversation?.id ?? null}
        activeConversationTitle={activeConversation?.title ?? 'New Conversation'}
        onSelectConversation={selectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={deleteConversation}
        onRenameConversation={renameConversation}
        messages={messages}
        isStreaming={isStreaming}
        connectionStatus={connectionStatus}
        mode={settings.mode}
        onExport={handleExport}
        emptyState={
          showNewConversationScreen ? (
            <NewConversationScreen
              prompts={(() => {
                if (pinnedPrompts.length === 0) return defaultPrompts;
                if (pinnedPrompts.length >= 6) return pinnedPrompts;
                // Fill remaining slots with unpinned defaults
                const pinnedIds = new Set(pinnedPrompts.map(p => p.id));
                const fillers = defaultPrompts.filter(p => !pinnedIds.has(p.id));
                return [...pinnedPrompts, ...fillers].slice(0, 6);
              })()}
              onSelectPrompt={handlePromptSelect}
              onManagePrompts={() => setPromptLibraryOpen(true)}
              onReorder={reorderPinned}
            />
          ) : undefined
        }
        inputBar={
          <InputBar
            onSend={handleSend}
            isStreaming={isStreaming}
            onStop={stopStreaming}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            pendingFiles={pendingAttachments.map(a => new File([], a.fileName))}
            onRemoveFile={(index) => setPendingAttachments(prev => prev.filter((_, i) => i !== index))}
            onFilesAdded={(files) => files.forEach(f => handleFileAdd(f))}
            voiceTranscript={transcript}
            isListening={isListening}
            voiceSupported={voiceSupported}
            onStartListening={startListening}
            onStopListening={stopListening}
            prefillText={prefillText}
            onPrefillConsumed={() => setPrefillText('')}
          />
        }
      />

      <PromptLibraryModal
        isOpen={promptLibraryOpen}
        onClose={() => setPromptLibraryOpen(false)}
        prompts={prompts}
        pinnedPrompts={pinnedPrompts}
        onCreate={createPrompt}
        onUpdate={updatePrompt}
        onDelete={deletePrompt}
        onTogglePin={togglePin}
        onReorder={reorderPinned}
      />
    </div>
  );
}
