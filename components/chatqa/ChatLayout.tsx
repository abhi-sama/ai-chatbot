'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import { ChatWindow } from './ChatWindow';
import type {
  Message, ConnectionStatus, ChatMode, ExportFormat, ExportScope, GroupedConversations,
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
  emptyState?: React.ReactNode;
  inputBar: React.ReactNode;
}

const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 260;

export function ChatLayout({
  conversations, activeConversationId, activeConversationTitle,
  onSelectConversation, onNewConversation, onDeleteConversation, onRenameConversation,
  messages, isStreaming, connectionStatus, mode, onExport, emptyState, inputBar,
}: ChatLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const hasMessages = messages.length > 0;

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    lastX.current = e.clientX;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - lastX.current;
      lastX.current = ev.clientX;
      setSidebarWidth((w) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w + delta)));
    };

    const onUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  return (
    <div className="flex h-full w-full bg-chatqa-bg">
      {/* Desktop sidebar with resize */}
      <motion.div
        className="relative hidden shrink-0 md:flex"
        animate={{ width: collapsed ? 0 : sidebarWidth }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ width: sidebarWidth, minWidth: sidebarWidth }} className="h-full border-r border-chatqa-border">
          <Sidebar
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={onSelectConversation}
            onNew={onNewConversation}
            onDelete={onDeleteConversation}
            onRename={onRenameConversation}
            isOpen={mobileOpen}
            onToggle={() => setMobileOpen(!mobileOpen)}
            onCollapse={() => setCollapsed(true)}
          />
        </div>

        {/* Resize handle */}
        {!collapsed && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute right-0 top-0 bottom-0 z-10 w-1.5 cursor-col-resize group"
          >
            <div className="h-full w-full transition-colors group-hover:bg-chatqa-accent/30 group-active:bg-chatqa-accent/50" />
          </div>
        )}
      </motion.div>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <Sidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={onSelectConversation}
          onNew={onNewConversation}
          onDelete={onDeleteConversation}
          onRename={onRenameConversation}
          isOpen={mobileOpen}
          onToggle={() => setMobileOpen(!mobileOpen)}
        />
      </div>

      {/* Main column */}
      <div className="relative flex flex-1 flex-col min-w-0 min-h-0">

        {/* Mobile-only hamburger */}
        <div className="shrink-0 flex items-center border-b border-chatqa-border px-3 py-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="h-8 w-8 text-chatqa-text-secondary hover:bg-chatqa-surface hover:text-chatqa-text"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable content area */}
        <div className={`flex-1 min-h-0 overflow-hidden ${collapsed ? 'md:pl-10' : ''}`}>
          {/* Expand sidebar button — inline, top-left corner */}
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="absolute left-1 top-1 z-20 hidden h-8 w-8 text-chatqa-text-secondary hover:bg-chatqa-surface hover:text-chatqa-text md:inline-flex"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          )}
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

        {/* Input bar */}
        <div className="shrink-0">
          {inputBar}
        </div>
      </div>
    </div>
  );
}
