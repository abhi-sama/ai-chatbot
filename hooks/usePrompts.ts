'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Prompt, UsePromptsReturn } from '@/types/chatqa';
import { DEFAULT_PROMPTS } from '@/lib/chatqa-constants';
import {
  fetchUserPrompts,
  createUserPrompt,
  updateUserPrompt,
  deleteUserPrompt,
} from '@/lib/chatqa-api';

const STORAGE_KEY = 'chatqa-user-prompts';
const PIN_STATE_KEY = 'chatqa-prompt-pins'; // tracks pin state for ALL prompts (incl defaults)
const ORDER_KEY = 'chatqa-prompt-order'; // tracks display order of pinned prompts

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function store(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

interface UsePromptsOptions {
  userId: string;
}

export function usePrompts({ userId }: UsePromptsOptions): UsePromptsReturn {
  // Initialize directly from localStorage (synchronous, no flash)
  const [userPrompts, setUserPrompts] = useState<Prompt[]>(() => getStored<Prompt[]>(STORAGE_KEY, []));
  const [pinStates, setPinStates] = useState<Record<string, boolean>>(() => getStored<Record<string, boolean>>(PIN_STATE_KEY, {}));
  const [pinnedOrder, setPinnedOrder] = useState<string[]>(() => getStored<string[]>(ORDER_KEY, []));
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user prompts from API and merge
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const apiPrompts = await fetchUserPrompts(userId);
        if (cancelled) return;

        const cached = getStored<Prompt[]>(STORAGE_KEY, []);
        const apiIds = new Set(apiPrompts.map((p) => p.id));
        const localOnly = cached.filter((p) => !apiIds.has(p.id));
        const merged = [...apiPrompts, ...localOnly];

        setUserPrompts(merged);
        store(STORAGE_KEY, merged);
      } catch (error) {
        console.error('Failed to fetch user prompts:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  // Combine all prompts with pin states applied
  const allPrompts = [...DEFAULT_PROMPTS, ...userPrompts].map((p) => ({
    ...p,
    isPinned: pinStates[p.id] ?? p.isPinned,
  }));

  // Get pinned prompts in saved order for the home screen
  const pinnedPrompts = (() => {
    const pinned = allPrompts.filter((p) => p.isPinned);
    // Sort by saved order, unordered ones go to the end
    const orderMap = new Map(pinnedOrder.map((id, i) => [id, i]));
    return pinned.sort((a, b) => {
      const aIdx = orderMap.get(a.id) ?? Infinity;
      const bIdx = orderMap.get(b.id) ?? Infinity;
      return aIdx - bIdx;
    });
  })();

  const togglePin = useCallback(
    (id: string) => {
      setPinStates((prev) => {
        const prompt = allPrompts.find((p) => p.id === id);
        const currentlyPinned = prev[id] ?? prompt?.isPinned ?? false;
        const next = { ...prev, [id]: !currentlyPinned };
        store(PIN_STATE_KEY, next);

        // Update order: add to end if pinning, remove if unpinning
        if (!currentlyPinned) {
          setPinnedOrder((prevOrder) => {
            const newOrder = prevOrder.includes(id) ? prevOrder : [...prevOrder, id];
            store(ORDER_KEY, newOrder);
            return newOrder;
          });
        } else {
          setPinnedOrder((prevOrder) => {
            const newOrder = prevOrder.filter((oid) => oid !== id);
            store(ORDER_KEY, newOrder);
            return newOrder;
          });
        }

        return next;
      });

      // Sync to API for user prompts
      const prompt = userPrompts.find((p) => p.id === id);
      if (prompt) {
        const newPinned = !(pinStates[id] ?? prompt.isPinned);
        updateUserPrompt(id, { isPinned: newPinned }).catch(console.error);
      }
    },
    [allPrompts, userPrompts, pinStates]
  );

  const reorderPinned = useCallback((newOrder: string[]) => {
    setPinnedOrder(newOrder);
    store(ORDER_KEY, newOrder);
  }, []);

  const createPrompt = useCallback(
    async (prompt: Omit<Prompt, 'id' | 'createdAt' | 'isDefault' | 'usageCount'>) => {
      const optimistic: Prompt = {
        ...prompt,
        id: `temp-${Date.now()}`,
        isDefault: false,
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };

      setUserPrompts((prev) => {
        const next = [...prev, optimistic];
        store(STORAGE_KEY, next);
        return next;
      });

      try {
        const created = await createUserPrompt(userId, prompt);
        setUserPrompts((prev) => {
          const next = prev.map((p) => (p.id === optimistic.id ? created : p));
          store(STORAGE_KEY, next);
          return next;
        });
      } catch (error) {
        console.error('Failed to create prompt:', error);
        setUserPrompts((prev) => {
          const next = prev.filter((p) => p.id !== optimistic.id);
          store(STORAGE_KEY, next);
          return next;
        });
      }
    },
    [userId]
  );

  const updatePrompt = useCallback(
    async (id: string, updates: Partial<Prompt>) => {
      setUserPrompts((prev) => {
        const next = prev.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        );
        store(STORAGE_KEY, next);
        return next;
      });

      try {
        await updateUserPrompt(id, updates);
      } catch (error) {
        console.error('Failed to update prompt:', error);
      }
    },
    []
  );

  const deletePrompt = useCallback(async (id: string) => {
    const previous = userPrompts;

    setUserPrompts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      store(STORAGE_KEY, next);
      return next;
    });

    // Also remove from pin state and order
    setPinStates((prev) => {
      const next = { ...prev };
      delete next[id];
      store(PIN_STATE_KEY, next);
      return next;
    });
    setPinnedOrder((prev) => {
      const next = prev.filter((oid) => oid !== id);
      store(ORDER_KEY, next);
      return next;
    });

    try {
      await deleteUserPrompt(id);
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      setUserPrompts(previous);
      store(STORAGE_KEY, previous);
    }
  }, [userPrompts]);

  return {
    prompts: allPrompts,
    defaultPrompts: DEFAULT_PROMPTS,
    userPrompts,
    pinnedPrompts,
    isLoading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    togglePin,
    reorderPinned,
  };
}
