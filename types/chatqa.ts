// ─── ChatQA Type Definitions ─────────────────────────────────────────────────

// Enums/Unions
export type ChatMode = 'assistant' | 'developer';
export type DataSource = 'records' | 'insights' | 'both';
export type ModelId = 'claude-3-haiku-20240307' | 'claude-3-5-sonnet-20241022';
export type ConnectionStatus = 'connected' | 'polling' | 'reconnecting' | 'error';
export type MessageRole = 'user' | 'assistant' | 'system';
export type FileType = 'pdf' | 'pptx' | 'ppt' | 'png' | 'jpg' | 'webp';
export type ConversationGroup = 'today' | 'yesterday' | 'last7days' | 'older';
export type ExportFormat = 'pdf' | 'word';
export type ExportScope = 'full' | 'assistant-only';

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  fileName: string;
  fileType: FileType;
  s3Key: string;
  url: string;
  size: number;
  /** ISO 8601 timestamp */
  uploadedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  /** Markdown-formatted content */
  content: string;
  attachments?: Attachment[];
  model?: ModelId;
  dataSource?: DataSource;
  tokensUsed?: number;
  latencyMs?: number;
  isComplete?: boolean;
  isStreaming?: boolean;
  /** ISO 8601 timestamp */
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  model: ModelId;
  dataSource: DataSource;
  mode: ChatMode;
  status: 'active' | 'archived';
  messageCount: number;
  /** ISO 8601 timestamp */
  lastMessageAt: string;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** ISO 8601 timestamp */
  updatedAt: string;
}

export interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  last7days: Conversation[];
  older: Conversation[];
}

export interface Prompt {
  id: string;
  userId?: string;
  title: string;
  description: string;
  content: string;
  /** Lucide icon name */
  icon: string;
  category: string;
  isDefault: boolean;
  isPinned: boolean;
  usageCount: number;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** ISO 8601 timestamp */
  updatedAt?: string;
}

export interface ChatSettings {
  mode: ChatMode;
  model: ModelId;
  dataSource: DataSource;
  planMode: boolean;
}

// ─── Hook Return Types ───────────────────────────────────────────────────────

export interface UseChatReturn {
  messages: Message[];
  isStreaming: boolean;
  connectionStatus: ConnectionStatus;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  stopStreaming: () => void;
  retryLastMessage: () => Promise<void>;
  prepareForNewConversation: () => void;
}

export interface UseConversationsReturn {
  conversations: GroupedConversations;
  activeConversation: Conversation | null;
  isLoading: boolean;
  createConversation: () => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  selectConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => Promise<void>;
}

export interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<Attachment>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  clearError: () => void;
}

export interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  error: string | null;
}

export interface UsePromptsReturn {
  prompts: Prompt[];
  defaultPrompts: Prompt[];
  userPrompts: Prompt[];
  pinnedPrompts: Prompt[];
  isLoading: boolean;
  createPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'isDefault' | 'usageCount'>) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  togglePin: (id: string) => void;
  reorderPinned: (newOrder: string[]) => void;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface ChatQAProps {
  userId?: string;
  className?: string;
}

export interface MessageBubbleProps {
  message: Message;
  mode: ChatMode;
  onCopy: (content: string) => void;
}

export interface InputBarProps {
  onSend: (content: string, attachments?: File[]) => void;
  isStreaming: boolean;
  onStop: () => void;
  settings: ChatSettings;
  onSettingsChange: (settings: Partial<ChatSettings>) => void;
}

export interface SidebarProps {
  conversations: GroupedConversations;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface SendMessageParams {
  conversationId: string;
  content: string;
  model: ModelId;
  dataSource: DataSource;
  mode: ChatMode;
  planMode: boolean;
  attachments?: Attachment[];
}

export interface CreateConversationParams {
  userId: string;
  title: string;
  model: ModelId;
  dataSource: DataSource;
  mode: ChatMode;
}

export interface StreamChunk {
  type: 'text' | 'done' | 'error';
  content: string;
  messageId?: string;
}
