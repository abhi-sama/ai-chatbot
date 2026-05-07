import type { ChatMode, DataSource, FileType, ModelId, Prompt } from '@/types/chatqa';

// ─── Timing & Limits ─────────────────────────────────────────────────────────

/** Maximum time (ms) to wait for a streaming response before failing over to polling */
export const FAILSAFE_TIMEOUT = 30_000;

/** Interval (ms) between polling attempts when SSE is unavailable */
export const POLLING_INTERVAL = 3_000;

/** Maximum file size for image uploads (10 MB) */
export const MAX_FILE_SIZE_IMAGE = 10 * 1024 * 1024;

/** Maximum file size for document uploads (25 MB) */
export const MAX_FILE_SIZE_DOCUMENT = 25 * 1024 * 1024;

/** Maximum character length for conversation titles */
export const CONVERSATION_TITLE_MAX_LENGTH = 50;

// ─── File Handling ───────────────────────────────────────────────────────────

/** Per-type file size limits in bytes */
export const FILE_LIMITS: Record<FileType, number> = {
  pdf: MAX_FILE_SIZE_DOCUMENT,
  pptx: MAX_FILE_SIZE_DOCUMENT,
  ppt: MAX_FILE_SIZE_DOCUMENT,
  png: MAX_FILE_SIZE_IMAGE,
  jpg: MAX_FILE_SIZE_IMAGE,
  webp: MAX_FILE_SIZE_IMAGE,
};

/** Mapping of allowed file types to their MIME types */
export const ALLOWED_FILE_TYPES: Record<FileType, string> = {
  pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

// ─── Model Options ───────────────────────────────────────────────────────────

export const MODEL_OPTIONS: { label: string; value: ModelId; description: string }[] = [
  {
    label: 'Claude 3 Haiku',
    value: 'claude-3-haiku-20240307',
    description: 'Fast responses, ideal for simple queries',
  },
  {
    label: 'Claude 3.5 Sonnet',
    value: 'claude-3-5-sonnet-20241022',
    description: 'Advanced reasoning for complex analysis',
  },
];

// ─── Data Source Options ─────────────────────────────────────────────────────

export const DATA_SOURCE_OPTIONS: { label: string; value: DataSource; description: string }[] = [
  {
    label: 'Records',
    value: 'records',
    description: 'Query structured data from your database',
  },
  {
    label: 'Insights',
    value: 'insights',
    description: 'Search reports, dashboards, and summaries',
  },
  {
    label: 'Both',
    value: 'both',
    description: 'Combined search across all data sources',
  },
];

// ─── Mode Options ────────────────────────────────────────────────────────────

export const MODE_OPTIONS: { label: string; value: ChatMode; description: string }[] = [
  {
    label: 'Assistant',
    value: 'assistant',
    description: 'Conversational answers with business context',
  },
  {
    label: 'Developer',
    value: 'developer',
    description: 'Technical responses with raw data access',
  },
];

// ─── Default Prompts (3x2 grid) ─────────────────────────────────────────────

export const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: 'default-1',
    title: 'Summarize Key Metrics',
    description: 'Get a high-level overview of your business KPIs',
    content:
      'Summarize the key performance metrics for this quarter compared to last quarter. Highlight any significant changes and suggest areas that need attention.',
    icon: 'BarChart3',
    category: 'Analysis',
    isDefault: true,
    isPinned: false,
    usageCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'default-2',
    title: 'Draft Executive Report',
    description: 'Generate a concise report for leadership',
    content:
      'Draft a brief executive summary report covering recent performance, notable trends, and recommended actions. Format it with clear headings and bullet points.',
    icon: 'FileText',
    category: 'Writing',
    isDefault: true,
    isPinned: false,
    usageCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'default-3',
    title: 'Build Data Query',
    description: 'Generate a structured query for your records',
    content:
      'Help me construct a query to extract data from our records. I need to filter by date range and aggregate results by department. Walk me through the parameters.',
    icon: 'Code',
    category: 'Code',
    isDefault: true,
    isPinned: false,
    usageCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'default-4',
    title: 'Competitive Landscape',
    description: 'Analyze market position and competitor activity',
    content:
      'Based on available insights, provide an overview of our competitive position. Identify key competitors, their recent moves, and potential threats or opportunities.',
    icon: 'Search',
    category: 'Research',
    isDefault: true,
    isPinned: false,
    usageCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'default-5',
    title: 'Trend Analysis',
    description: 'Identify patterns and anomalies in your data',
    content:
      'Analyze the data for the past 6 months and identify any notable trends, seasonal patterns, or anomalies. Present findings with supporting data points.',
    icon: 'TrendingUp',
    category: 'Data',
    isDefault: true,
    isPinned: false,
    usageCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'default-6',
    title: 'Brainstorm Strategies',
    description: 'Generate creative approaches to business challenges',
    content:
      'Help me brainstorm strategic options for improving our customer retention rate. Consider data-driven approaches, industry best practices, and creative solutions.',
    icon: 'Lightbulb',
    category: 'Creative',
    isDefault: true,
    isPinned: false,
    usageCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];
