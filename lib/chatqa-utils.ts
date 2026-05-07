import {
  isToday,
  isYesterday,
  differenceInDays,
  formatDistanceToNow,
} from 'date-fns';

import type {
  Conversation,
  FileType,
  GroupedConversations,
  Message,
} from '@/types/chatqa';
import {
  ALLOWED_FILE_TYPES,
  CONVERSATION_TITLE_MAX_LENGTH,
  FILE_LIMITS,
} from '@/lib/chatqa-constants';

// ─── Group Conversations by Date ────────────────────────────────────────────

export function groupConversationsByDate(
  conversations: Conversation[]
): GroupedConversations {
  const groups: GroupedConversations = {
    today: [],
    yesterday: [],
    last7days: [],
    older: [],
  };

  for (const convo of conversations) {
    const date = new Date(convo.lastMessageAt);
    if (isToday(date)) {
      groups.today.push(convo);
    } else if (isYesterday(date)) {
      groups.yesterday.push(convo);
    } else if (differenceInDays(new Date(), date) <= 7) {
      groups.last7days.push(convo);
    } else {
      groups.older.push(convo);
    }
  }

  // Sort each group by most recent first
  const sortDesc = (a: Conversation, b: Conversation) =>
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();

  groups.today.sort(sortDesc);
  groups.yesterday.sort(sortDesc);
  groups.last7days.sort(sortDesc);
  groups.older.sort(sortDesc);

  return groups;
}

// ─── Generate Sortable ID ───────────────────────────────────────────────────

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

// ─── Truncate Title ─────────────────────────────────────────────────────────

export function truncateTitle(
  text: string,
  maxLength: number = CONVERSATION_TITLE_MAX_LENGTH
): string {
  const cleaned = text.trim().replace(/\n/g, ' ');
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength - 1).trimEnd() + '…';
}

// ─── Format Timestamp ───────────────────────────────────────────────────────

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24 && isToday(date)) return `${diffHours}h ago`;

  if (isYesterday(date)) return 'Yesterday';

  return formatDistanceToNow(date, { addSuffix: true });
}

// ─── Get File Icon ──────────────────────────────────────────────────────────

export function getFileIcon(fileType: FileType): string {
  const iconMap: Record<FileType, string> = {
    pdf: 'FileText',
    pptx: 'Presentation',
    ppt: 'Presentation',
    png: 'Image',
    jpg: 'Image',
    webp: 'Image',
  };
  return iconMap[fileType] ?? 'File';
}

// ─── Format File Size ───────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`;
}

// ─── Validate File ──────────────────────────────────────────────────────────

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Determine file extension
  const extension = file.name.split('.').pop()?.toLowerCase() as FileType | undefined;

  if (!extension || !(extension in ALLOWED_FILE_TYPES)) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed: ${Object.keys(ALLOWED_FILE_TYPES).join(', ')}`,
    };
  }

  const expectedMime = ALLOWED_FILE_TYPES[extension];
  if (file.type && file.type !== expectedMime) {
    // Allow empty MIME (some browsers don't set it)
    return {
      valid: false,
      error: `Invalid file type. Expected ${expectedMime} for .${extension} files.`,
    };
  }

  const maxSize = FILE_LIMITS[extension];
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size for .${extension} is ${formatFileSize(maxSize)}.`,
    };
  }

  return { valid: true };
}

// ─── Export to PDF ──────────────────────────────────────────────────────────

export async function exportConversationToPDF(
  messages: Message[],
  title: string,
  scope: 'full' | 'assistant-only'
): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const filteredMessages =
    scope === 'assistant-only'
      ? messages.filter((m) => m.role === 'assistant')
      : messages;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  // Title
  doc.setFontSize(16);
  doc.text(title, margin, y);
  y += 12;

  doc.setFontSize(10);
  doc.text(`Exported: ${new Date().toLocaleString()}`, margin, y);
  y += 10;

  // Messages
  doc.setFontSize(11);
  for (const msg of filteredMessages) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const roleLabel = msg.role === 'user' ? 'You' : 'Assistant';
    doc.setFont('helvetica', 'bold');
    doc.text(`${roleLabel}:`, margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(msg.content, maxWidth);
    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 5;
    }
    y += 6;
  }

  doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

// ─── Export to Word ─────────────────────────────────────────────────────────

export async function exportConversationToWord(
  messages: Message[],
  title: string,
  scope: 'full' | 'assistant-only'
): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
  const { saveAs } = await import('file-saver');

  const filteredMessages =
    scope === 'assistant-only'
      ? messages.filter((m) => m.role === 'assistant')
      : messages;

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Exported: ${new Date().toLocaleString()}`,
          italics: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  for (const msg of filteredMessages) {
    const roleLabel = msg.role === 'user' ? 'You' : 'Assistant';
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${roleLabel}:`, bold: true }),
        ],
      })
    );

    // Split content by newlines for proper paragraphs
    const contentLines = msg.content.split('\n');
    for (const line of contentLines) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line })],
        })
      );
    }

    children.push(new Paragraph({ text: '' }));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
}
