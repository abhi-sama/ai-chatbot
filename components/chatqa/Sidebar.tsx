'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ConversationItem } from './ConversationItem';
import { ThemeToggle } from './ThemeToggle';
import type { SidebarProps, Conversation, ConversationGroup } from '@/types/chatqa';

const GROUP_LABELS: Record<ConversationGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7days: 'Last 7 Days',
  older: 'Older',
};

const GROUP_ORDER: ConversationGroup[] = ['today', 'yesterday', 'last7days', 'older'];

function SidebarContent({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
}: Omit<SidebarProps, 'isOpen' | 'onToggle'>) {
  return (
    <div className="flex h-full flex-col bg-chatqa-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-chatqa-border px-4 py-4">
        <h1 className="text-lg font-semibold text-chatqa-text">ChatQA</h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={onNew}
            className="h-8 w-8 text-chatqa-secondary hover:bg-chatqa-surface hover:text-chatqa-text"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1 px-2 py-2">
        <AnimatePresence initial={false}>
          {GROUP_ORDER.map((group) => {
            const items: Conversation[] = conversations[group];
            if (!items || items.length === 0) return null;

            return (
              <motion.div
                key={group}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-2"
              >
                <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-chatqa-muted">
                  {GROUP_LABELS[group]}
                </p>
                {items.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isActive={conversation.id === activeId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onRename={onRename}
                  />
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isOpen,
  onToggle,
}: SidebarProps) {
  const contentProps = { conversations, activeId, onSelect, onNew, onDelete, onRename };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-[260px] shrink-0 border-r border-chatqa-border md:block">
        <SidebarContent {...contentProps} />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent side="left" className="w-[260px] p-0 border-chatqa-border">
          <SidebarContent {...contentProps} />
        </SheetContent>
      </Sheet>
    </>
  );
}
