'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  Conversation,
  GroupedConversations,
  UseConversationsReturn,
} from '@/types/chatqa';
import { groupConversationsByDate, truncateTitle, generateId } from '@/lib/chatqa-utils';
import {
  fetchConversations,
  createConversation as createConversationApi,
  deleteConversation as deleteConversationApi,
  renameConversation as renameConversationApi,
} from '@/lib/chatqa-api';

interface UseConversationsOptions {
  userId: string;
}

const EMPTY_GROUPS: GroupedConversations = {
  today: [],
  yesterday: [],
  last7days: [],
  older: [],
};

export function useConversations({
  userId,
}: UseConversationsOptions): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [grouped, setGrouped] = useState<GroupedConversations>(EMPTY_GROUPS);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch conversations on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchConversations(userId);
        if (cancelled) return;
        setConversations(data);
        setGrouped(groupConversationsByDate(data));
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Re-group when conversations change
  useEffect(() => {
    setGrouped(groupConversationsByDate(conversations));
  }, [conversations]);

  const createConversation = useCallback(async (): Promise<Conversation> => {
    const newConvo = await createConversationApi({
      userId,
      title: 'New Conversation',
      model: 'claude-3-5-sonnet-20241022',
      dataSource: 'both',
      mode: 'assistant',
    });
    setConversations((prev) => [newConvo, ...prev]);
    setActiveConversation(newConvo);
    return newConvo;
  }, [userId]);

  const deleteConversation = useCallback(
    async (id: string) => {
      await deleteConversationApi(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversation?.id === id) {
        setActiveConversation(null);
      }
    },
    [activeConversation]
  );

  const selectConversation = useCallback(
    (id: string) => {
      if (!id) {
        setActiveConversation(null);
        return;
      }
      const convo = conversations.find((c) => c.id === id);
      setActiveConversation(convo ?? null);
    },
    [conversations]
  );

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      const truncated = truncateTitle(title);
      await renameConversationApi(id, truncated);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, title: truncated, updatedAt: new Date().toISOString() }
            : c
        )
      );
      if (activeConversation?.id === id) {
        setActiveConversation((prev) =>
          prev ? { ...prev, title: truncated } : prev
        );
      }
    },
    [activeConversation]
  );

  return {
    conversations: grouped,
    activeConversation,
    isLoading,
    createConversation,
    deleteConversation,
    selectConversation,
    renameConversation,
  };
}
