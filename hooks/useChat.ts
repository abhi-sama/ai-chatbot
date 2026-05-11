'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  Attachment,
  ChatSettings,
  ConnectionStatus,
  Message,
  UseChatReturn,
} from '@/types/chatqa';
import { FAILSAFE_TIMEOUT } from '@/lib/chatqa-constants';
import { generateId } from '@/lib/chatqa-utils';
import {
  sendMessage as sendMessageApi,
  pollForResponse,
  fetchMessages,
} from '@/lib/chatqa-api';

interface UseChatOptions {
  conversationId: string | null;
  settings: ChatSettings;
  initialMessages?: Message[];
}

export function useChat({
  conversationId,
  settings,
  initialMessages = [],
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');

  const abortRef = useRef<AbortController | null>(null);
  const failsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUserMessageRef = useRef<string>('');
  const lastAttachmentsRef = useRef<File[] | undefined>(undefined);
  const conversationIdRef = useRef(conversationId);
  const skipResetRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Local cache: conversationId → messages (instant switching)
  const cacheRef = useRef<Map<string, Message[]>>(new Map());

  // Load messages when conversation changes
  useEffect(() => {
    // Skip reset if we just created a conversation and are about to send
    if (skipResetRef.current) {
      skipResetRef.current = false;
      return;
    }

    setIsStreaming(false);
    setConnectionStatus('connected');

    if (!conversationId) {
      setMessages([]);
      return;
    }

    // Check cache first — instant restore
    const cached = cacheRef.current.get(conversationId);
    if (cached) {
      setMessages(cached);
      return;
    }

    // Fetch from API (mock for now, DynamoDB later)
    let cancelled = false;
    setMessages([]);
    fetchMessages(conversationId).then((msgs) => {
      if (!cancelled) {
        setMessages(msgs);
        cacheRef.current.set(conversationId, msgs);
      }
    });
    return () => { cancelled = true; };
  }, [conversationId]);

  // Keep cache in sync with current messages
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      cacheRef.current.set(conversationId, messages);
    }
  }, [conversationId, messages]);

  /** Call this before changing conversationId when you plan to sendMessage right after */
  const prepareForNewConversation = useCallback(() => {
    skipResetRef.current = true;
  }, []);

  const clearFailsafeTimer = useCallback(() => {
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      lastUserMessageRef.current = content;
      lastAttachmentsRef.current = attachments;

      // Use ref for latest conversationId (avoids stale closure after createConversation)
      const currentConvoId = conversationIdRef.current ?? '';

      // 1. Add user message to state
      const userMessage: Message = {
        id: generateId(),
        conversationId: currentConvoId,
        role: 'user',
        content,
        attachments: attachments?.map(
          (f) =>
            ({
              id: generateId(),
              fileName: f.name,
              fileType: f.name.split('.').pop() as Attachment['fileType'],
              s3Key: '',
              url: URL.createObjectURL(f),
              size: f.size,
              uploadedAt: new Date().toISOString(),
            }) satisfies Attachment
        ),
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      setConnectionStatus('connected');

      // 2. Create placeholder assistant message
      const assistantMessageId = generateId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        conversationId: currentConvoId,
        role: 'assistant',
        content: '',
        model: settings.model,
        dataSource: settings.dataSource,
        isStreaming: true,
        isComplete: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // 3. Set up abort controller
      abortRef.current = new AbortController();

      // 4. Start failsafe timer
      failsafeTimerRef.current = setTimeout(async () => {
        // Switch to polling mode
        setConnectionStatus('polling');
        try {
          const polledMessage = await pollForResponse(
            currentConvoId,
            assistantMessageId
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...polledMessage, isStreaming: false, isComplete: true }
                : m
            )
          );
        } catch {
          setConnectionStatus('error');
        } finally {
          setIsStreaming(false);
        }
      }, FAILSAFE_TIMEOUT);

      // 5. Stream response
      try {
        const stream = sendMessageApi({
          conversationId: currentConvoId,
          content,
          model: settings.model,
          dataSource: settings.dataSource,
          mode: settings.mode,
          planMode: settings.planMode,
          attachments: userMessage.attachments,
        });

        let accumulated = '';

        for await (const chunk of stream) {
          if (abortRef.current?.signal.aborted) break;

          if (chunk.type === 'text') {
            accumulated += chunk.content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: accumulated }
                  : m
              )
            );
          } else if (chunk.type === 'done') {
            clearFailsafeTimer();
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, isStreaming: false, isComplete: true }
                  : m
              )
            );
            setIsStreaming(false);
            setConnectionStatus('connected');
          } else if (chunk.type === 'error') {
            clearFailsafeTimer();
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: accumulated || 'An error occurred. Please try again.',
                      isStreaming: false,
                      isComplete: true,
                    }
                  : m
              )
            );
            setIsStreaming(false);
            setConnectionStatus('error');
          }
        }
      } catch (error) {
        // If not aborted, the failsafe timer will handle recovery
        if (abortRef.current?.signal.aborted) {
          clearFailsafeTimer();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? { ...m, isStreaming: false, isComplete: false }
                : m
            )
          );
          setIsStreaming(false);
        }
      }
    },
    [conversationId, settings, clearFailsafeTimer]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    clearFailsafeTimer();
    setIsStreaming(false);
  }, [clearFailsafeTimer]);

  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current) return;

    // Remove the last assistant message (failed one)
    setMessages((prev) => {
      const lastAssistantIdx = prev.findLastIndex((m) => m.role === 'assistant');
      if (lastAssistantIdx === -1) return prev;
      // Also remove the last user message to re-send
      const lastUserIdx = prev.findLastIndex((m) => m.role === 'user');
      return prev.filter(
        (_, i) => i !== lastAssistantIdx && i !== lastUserIdx
      );
    });

    await sendMessage(lastUserMessageRef.current, lastAttachmentsRef.current);
  }, [sendMessage]);

  return {
    messages,
    isStreaming,
    connectionStatus,
    sendMessage,
    stopStreaming,
    retryLastMessage,
    prepareForNewConversation,
  };
}
