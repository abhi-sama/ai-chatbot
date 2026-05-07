'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import { ChatWindow } from './ChatWindow';
import type {
  Message,
  ConnectionStatus,
  ChatMode,
  ExportFormat,
  ExportScope,
  GroupedConversations,
} from '@/types/chatqa';

interface ChatLayoutProps {
  conversations: GroupedConversations;
  activeConversationId: string | null;
  activeConversationTitle: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  messages: Message[];
  isStreaming: boolean;
  connectionStatus: ConnectionStatus;
  mode: ChatMode;
  onExport: (format: ExportFormat, scope: ExportScope) => void;
  /** Rendered when there are no messages (new conversation prompt screen) */
  emptyState?: React.ReactNode;
  /** Input bar — always rendered at the bottom */
  inputBar: React.ReactNode;
}

export function ChatLayout({
  conversations,
  activeConversationId,
  activeConversationTitle,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  messages,
  isStreaming,
  connectionStatus,
  mode,
  onExport,
  emptyState,
  inputBar,
}: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen w-full bg-chatqa-bg">
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={onSelectConversation}
        onNew={onNewConversation}
        onDelete={onDeleteConversation}
        onRename={onRenameConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        {/* Mobile header */}
        <div className="shrink-0 flex items-center border-b border-chatqa-border px-3 py-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-8 w-8 text-chatqa-text-secondary hover:bg-chatqa-surface hover:text-chatqa-text"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable content area — takes all remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {hasMessages ? (
            <ChatWindow
              messages={messages}
              isStreaming={isStreaming}
              connectionStatus={connectionStatus}
              mode={mode}
              conversationTitle={activeConversationTitle}
              onExport={onExport}
            />
          ) : (
            <div className="flex h-full items-center justify-center overflow-y-auto p-4">
              {emptyState}
            </div>
          )}
        </div>

        {/* Input bar — pinned to bottom, never shifts */}
        <div className="shrink-0">
          {inputBar}
        </div>
      </div>
    </div>
  );
}
