import type {
  Conversation,
  CreateConversationParams,
  Message,
  Prompt,
  SendMessageParams,
  StreamChunk,
} from '@/types/chatqa';
import { generateId } from '@/lib/chatqa-utils';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400_000).toISOString();

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    userId: 'user-1',
    title: 'Q3 Revenue Analysis',
    model: 'claude-3-5-sonnet-20241022',
    dataSource: 'both',
    mode: 'assistant',
    status: 'active',
    messageCount: 12,
    lastMessageAt: hoursAgo(0.5),
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(0.5),
  },
  {
    id: 'conv-2',
    userId: 'user-1',
    title: 'Customer Churn Prediction',
    model: 'claude-3-5-sonnet-20241022',
    dataSource: 'records',
    mode: 'developer',
    status: 'active',
    messageCount: 8,
    lastMessageAt: hoursAgo(3),
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(3),
  },
  {
    id: 'conv-3',
    userId: 'user-1',
    title: 'API Integration Guide',
    model: 'claude-3-haiku-20240307',
    dataSource: 'insights',
    mode: 'developer',
    status: 'active',
    messageCount: 15,
    lastMessageAt: hoursAgo(6),
    createdAt: hoursAgo(10),
    updatedAt: hoursAgo(6),
  },
  {
    id: 'conv-4',
    userId: 'user-1',
    title: 'Marketing Campaign Performance',
    model: 'claude-3-5-sonnet-20241022',
    dataSource: 'both',
    mode: 'assistant',
    status: 'active',
    messageCount: 6,
    lastMessageAt: daysAgo(1),
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'conv-5',
    userId: 'user-1',
    title: 'Database Schema Review',
    model: 'claude-3-haiku-20240307',
    dataSource: 'records',
    mode: 'developer',
    status: 'active',
    messageCount: 20,
    lastMessageAt: daysAgo(1.2),
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1.2),
  },
  {
    id: 'conv-6',
    userId: 'user-1',
    title: 'Weekly Team Standup Notes',
    model: 'claude-3-haiku-20240307',
    dataSource: 'insights',
    mode: 'assistant',
    status: 'active',
    messageCount: 4,
    lastMessageAt: daysAgo(3),
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
  },
  {
    id: 'conv-7',
    userId: 'user-1',
    title: 'Sales Pipeline Optimization',
    model: 'claude-3-5-sonnet-20241022',
    dataSource: 'records',
    mode: 'assistant',
    status: 'active',
    messageCount: 9,
    lastMessageAt: daysAgo(5),
    createdAt: daysAgo(6),
    updatedAt: daysAgo(5),
  },
  {
    id: 'conv-8',
    userId: 'user-1',
    title: 'Product Roadmap Q4 Planning',
    model: 'claude-3-5-sonnet-20241022',
    dataSource: 'both',
    mode: 'assistant',
    status: 'active',
    messageCount: 14,
    lastMessageAt: daysAgo(12),
    createdAt: daysAgo(15),
    updatedAt: daysAgo(12),
  },
  {
    id: 'conv-9',
    userId: 'user-1',
    title: 'Infrastructure Cost Analysis',
    model: 'claude-3-haiku-20240307',
    dataSource: 'records',
    mode: 'developer',
    status: 'active',
    messageCount: 7,
    lastMessageAt: daysAgo(20),
    createdAt: daysAgo(22),
    updatedAt: daysAgo(20),
  },
  {
    id: 'conv-10',
    userId: 'user-1',
    title: 'Customer Feedback Sentiment',
    model: 'claude-3-5-sonnet-20241022',
    dataSource: 'insights',
    mode: 'assistant',
    status: 'active',
    messageCount: 11,
    lastMessageAt: daysAgo(30),
    createdAt: daysAgo(35),
    updatedAt: daysAgo(30),
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'Can you analyze our Q3 revenue numbers and compare them to Q2? I want to understand the key drivers of growth.',
      createdAt: hoursAgo(2),
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: `## Q3 Revenue Analysis

Here's a comprehensive breakdown of Q3 vs Q2 performance:

### Key Metrics

| Metric | Q2 | Q3 | Change |
|--------|-----|-----|--------|
| Total Revenue | $4.2M | $5.1M | +21.4% |
| MRR | $1.4M | $1.7M | +21.4% |
| New Customers | 142 | 189 | +33.1% |
| Avg Deal Size | $29.5K | $27.0K | -8.5% |

### Growth Drivers

1. **Enterprise segment expansion** — 3 new enterprise deals closed (>$100K ARR each)
2. **Product-led growth** — Self-serve signups increased 45% after the freemium launch
3. **Upsell improvements** — Customer success team achieved 28% upsell rate (up from 19%)

### Areas of Concern

- Average deal size decreased slightly, indicating more SMB mix
- Sales cycle lengthened by 4 days on average
- Churn in mid-market segment increased to 3.2%

Would you like me to dive deeper into any of these areas?`,
      model: 'claude-3-5-sonnet-20241022',
      dataSource: 'both',
      tokensUsed: 487,
      latencyMs: 2100,
      isComplete: true,
      createdAt: hoursAgo(1.9),
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      role: 'user',
      content: 'Yes, tell me more about the mid-market churn. What are the primary reasons customers are leaving?',
      createdAt: hoursAgo(1.5),
    },
    {
      id: 'msg-1-4',
      conversationId: 'conv-1',
      role: 'assistant',
      content: `## Mid-Market Churn Analysis

Based on exit survey data and usage patterns, here are the primary churn drivers:

### Top Reasons for Churn (Mid-Market Segment)

\`\`\`
Reason                    | % of Churned | Count
--------------------------|-------------|------
Pricing/Budget cuts       | 34%         | 12
Missing features          | 28%         | 10
Competitor switch         | 22%         | 8
Poor onboarding           | 11%         | 4
Other                     | 5%          | 2
\`\`\`

### Notable Patterns

- **Pricing sensitivity**: Most budget-related churn came from companies with 50-100 employees that found the per-seat model too expensive as they scaled
- **Feature gaps**: The most-requested missing features were:
  - Custom reporting dashboards
  - SSO/SAML integration
  - Advanced API rate limits
- **Competitor**: Mainly losing to *DataPulse* which launched an aggressive mid-market pricing tier

### Recommended Actions

1. Consider a mid-market pricing tier ($15-20/seat vs current $25)
2. Accelerate SSO development (currently in backlog)
3. Implement health scoring to identify at-risk accounts earlier

Here's a sample health score query you could implement:

\`\`\`sql
SELECT
  account_id,
  company_name,
  last_login_days_ago,
  feature_adoption_score,
  support_tickets_30d,
  CASE
    WHEN last_login_days_ago > 14 AND feature_adoption_score < 0.3 THEN 'high_risk'
    WHEN last_login_days_ago > 7 OR support_tickets_30d > 3 THEN 'medium_risk'
    ELSE 'healthy'
  END as health_status
FROM account_metrics
WHERE segment = 'mid_market'
ORDER BY last_login_days_ago DESC;
\`\`\`

Want me to pull the actual data for at-risk accounts?`,
      model: 'claude-3-5-sonnet-20241022',
      dataSource: 'both',
      tokensUsed: 612,
      latencyMs: 3200,
      isComplete: true,
      createdAt: hoursAgo(1.4),
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      role: 'user',
      content: 'I need help building a customer churn prediction model. What data points should I be looking at?',
      createdAt: hoursAgo(5),
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      role: 'assistant',
      content: `## Customer Churn Prediction Model

Here's a recommended approach using the data available in your records:

### Key Feature Categories

#### 1. Usage Metrics
- Daily/weekly active users per account
- Feature adoption breadth (% of features used)
- Session duration trends (increasing/decreasing)
- API call volume changes

#### 2. Engagement Signals
- Last login recency
- Support ticket frequency and sentiment
- NPS/CSAT survey responses
- Email open rates for product updates

#### 3. Commercial Factors
- Contract renewal date proximity
- Payment failures or late payments
- Discount level at signup
- Expansion/contraction of seats

#### 4. Product Experience
- Time-to-value (days to first meaningful action)
- Onboarding completion rate
- Error rates encountered
- Page load performance per account

### Suggested Model Architecture

\`\`\`python
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Feature engineering
features = [
    'days_since_last_login',
    'login_frequency_30d',
    'feature_adoption_score',
    'support_tickets_30d',
    'nps_score',
    'contract_days_remaining',
    'seat_utilization_pct',
    'api_calls_trend',  # slope of last 30 days
    'payment_failures_90d',
]

# Train model
X_train, X_test, y_train, y_test = train_test_split(
    df[features], df['churned'], test_size=0.2, random_state=42
)

model = GradientBoostingClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
)
model.fit(X_train, y_train)

# Evaluate
predictions = model.predict(X_test)
print(classification_report(y_test, predictions))
\`\`\`

### Expected Performance
Based on similar models, you should expect:
- **Precision**: 75-85% (correctly identified churners)
- **Recall**: 65-75% (% of actual churners caught)
- **Lead time**: 30-45 days before churn event

Would you like me to pull the actual data and start building this?`,
      model: 'claude-3-5-sonnet-20241022',
      dataSource: 'records',
      tokensUsed: 580,
      latencyMs: 2800,
      isComplete: true,
      createdAt: hoursAgo(4.8),
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-3',
      role: 'user',
      content: 'How do I set up the REST API authentication for our platform? I need to integrate with a third-party service.',
      createdAt: hoursAgo(10),
    },
    {
      id: 'msg-3-2',
      conversationId: 'conv-3',
      role: 'assistant',
      content: `## API Authentication Setup

Here's how to integrate with our REST API:

### 1. Generate API Keys

Navigate to **Settings > API Keys** or use the CLI:

\`\`\`bash
curl -X POST https://api.platform.com/v1/keys \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "third-party-integration", "scopes": ["read:records", "write:records"]}'
\`\`\`

### 2. Authentication Flow

We support two auth methods:

#### Bearer Token (recommended for server-to-server)
\`\`\`typescript
const response = await fetch('https://api.platform.com/v1/records', {
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json',
    'X-Request-ID': crypto.randomUUID(),
  },
});
\`\`\`

#### OAuth 2.0 (for user-context integrations)
\`\`\`typescript
// Step 1: Redirect to authorize
const authUrl = new URL('https://api.platform.com/oauth/authorize');
authUrl.searchParams.set('client_id', CLIENT_ID);
authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
authUrl.searchParams.set('scope', 'read:records write:records');
authUrl.searchParams.set('response_type', 'code');

// Step 2: Exchange code for token
const tokenResponse = await fetch('https://api.platform.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
  }),
});
\`\`\`

### 3. Rate Limits

| Plan | Requests/min | Burst |
|------|-------------|-------|
| Free | 60 | 10 |
| Pro | 600 | 50 |
| Enterprise | 6000 | 200 |

### 4. Error Handling

\`\`\`typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Always check for rate limiting
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  await sleep(parseInt(retryAfter || '1') * 1000);
  // Retry request...
}
\`\`\`

Need help with a specific integration pattern?`,
      model: 'claude-3-haiku-20240307',
      dataSource: 'insights',
      tokensUsed: 445,
      latencyMs: 1500,
      isComplete: true,
      createdAt: hoursAgo(9.8),
    },
  ],
};

const MOCK_ASSISTANT_RESPONSE = `Based on my analysis of the available data, here are the key findings:

## Summary

The data shows a **positive trend** over the last quarter with some notable patterns:

1. **Growth acceleration** in the enterprise segment
2. **Improved retention** metrics across all cohorts
3. **Cost optimization** opportunities in infrastructure

### Detailed Breakdown

| Category | Current | Previous | Delta |
|----------|---------|----------|-------|
| Active Users | 12,450 | 10,200 | +22% |
| Engagement | 73% | 68% | +5pp |
| Revenue/User | $42.30 | $38.90 | +8.7% |

\`\`\`javascript
// Sample query to reproduce this analysis
const results = await db.query({
  table: 'metrics_daily',
  filters: { date: { gte: '2024-07-01' } },
  groupBy: 'category',
  aggregate: { value: 'avg' }
});
\`\`\`

Would you like me to explore any specific aspect in more detail?`;

const MOCK_USER_PROMPTS: Prompt[] = [
  {
    id: 'user-prompt-1',
    userId: 'user-1',
    title: 'Weekly Report Template',
    description: 'Standard format for weekly team updates',
    content: 'Generate a weekly report covering: 1) Key accomplishments, 2) Metrics updates, 3) Blockers, 4) Next week priorities. Use data from the last 7 days.',
    icon: 'Calendar',
    category: 'Reporting',
    isDefault: false,
    isPinned: true,
    usageCount: 12,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(2),
  },
  {
    id: 'user-prompt-2',
    userId: 'user-1',
    title: 'SQL Query Helper',
    description: 'Generate optimized SQL for data extraction',
    content: 'Help me write an optimized SQL query for the following requirement. Consider indexing, performance, and readability. Database is PostgreSQL 15.',
    icon: 'Database',
    category: 'Development',
    isDefault: false,
    isPinned: false,
    usageCount: 8,
    createdAt: daysAgo(20),
    updatedAt: daysAgo(5),
  },
];

// ─── Helper ─────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Conversations API ──────────────────────────────────────────────────────

/**
 * MOCK: Returns 10 sample conversations spread across date groups
 * REAL: AppSync query listConversations with userId filter, sorted by lastMessageAt desc
 */
export async function fetchConversations(userId: string): Promise<Conversation[]> {
  await delay(400);
  return MOCK_CONVERSATIONS.filter((c) => c.userId === userId || userId === 'user-1');
}

/**
 * MOCK: Creates conversation with generated ID and timestamps
 * REAL: AppSync mutation createConversation
 */
export async function createConversation(
  params: CreateConversationParams
): Promise<Conversation> {
  await delay(200);
  const now = new Date().toISOString();
  return {
    id: generateId(),
    userId: params.userId,
    title: params.title,
    model: params.model,
    dataSource: params.dataSource,
    mode: params.mode,
    status: 'active',
    messageCount: 0,
    lastMessageAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * MOCK: Simulates deletion delay
 * REAL: AppSync mutation deleteConversation
 */
export async function deleteConversation(id: string): Promise<void> {
  await delay(200);
  // In real implementation, this would delete from DynamoDB
  void id;
}

/**
 * MOCK: Simulates rename delay
 * REAL: AppSync mutation updateConversation with title field
 */
export async function renameConversation(id: string, title: string): Promise<void> {
  await delay(150);
  void id;
  void title;
}

// ─── Messages API ───────────────────────────────────────────────────────────

/**
 * MOCK: Returns sample multi-turn conversation with markdown/code
 * REAL: AppSync query listMessages with conversationId, sorted by createdAt asc
 */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  await delay(300);
  return MOCK_MESSAGES[conversationId] ?? [];
}

/**
 * MOCK: Streams response character by character with 30-50ms delays
 * REAL: AppSync subscription onMessageStream, chunked by server
 */
export async function* sendMessage(
  params: SendMessageParams
): AsyncGenerator<StreamChunk> {
  void params;

  await delay(500); // Initial "thinking" delay

  const messageId = generateId();
  const text = MOCK_ASSISTANT_RESPONSE;

  // Stream character by character with realistic delays
  for (let i = 0; i < text.length; i++) {
    const chunkSize = Math.floor(Math.random() * 3) + 1;
    const chunk = text.slice(i, i + chunkSize);
    i += chunkSize - 1;

    yield {
      type: 'text',
      content: chunk,
      messageId,
    };

    await delay(30 + Math.random() * 20); // 30-50ms per chunk
  }

  yield {
    type: 'done',
    content: '',
    messageId,
  };
}

/**
 * MOCK: Returns completed message after delay
 * REAL: AppSync query getMessage with polling until isComplete=true
 */
export async function pollForResponse(
  conversationId: string,
  messageId: string
): Promise<Message> {
  await delay(2000);
  return {
    id: messageId,
    conversationId,
    role: 'assistant',
    content: MOCK_ASSISTANT_RESPONSE,
    model: 'claude-3-5-sonnet-20241022',
    dataSource: 'both',
    tokensUsed: 350,
    latencyMs: 2000,
    isComplete: true,
    createdAt: new Date().toISOString(),
  };
}

// ─── File Upload API ────────────────────────────────────────────────────────

/**
 * MOCK: Returns a fake presigned URL
 * REAL: AppSync mutation getUploadUrl that generates S3 presigned URL
 */
export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string
): Promise<{ url: string; key: string }> {
  await delay(300);
  const key = `uploads/${generateId()}/${fileName}`;
  return {
    url: `https://mock-s3-bucket.s3.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600`,
    key,
  };
  void fileType;
}

/**
 * MOCK: Simulates upload progress over 1-2 seconds
 * REAL: Direct PUT to S3 presigned URL with progress tracking
 */
export async function uploadFileToS3(url: string, file: File): Promise<void> {
  void url;
  void file;
  // Simulate upload time proportional to file size
  const uploadTime = Math.min(2000, Math.max(500, file.size / 10000));
  await delay(uploadTime);
}

// ─── Prompts API ────────────────────────────────────────────────────────────

/**
 * MOCK: Returns sample user prompts
 * REAL: AppSync query listPrompts with userId filter
 */
export async function fetchUserPrompts(userId: string): Promise<Prompt[]> {
  await delay(250);
  void userId;
  return [...MOCK_USER_PROMPTS];
}

/**
 * MOCK: Creates prompt with generated ID
 * REAL: AppSync mutation createPrompt
 */
export async function createUserPrompt(
  userId: string,
  prompt: Partial<Prompt>
): Promise<Prompt> {
  await delay(200);
  const now = new Date().toISOString();
  return {
    id: generateId(),
    userId,
    title: prompt.title ?? 'Untitled Prompt',
    description: prompt.description ?? '',
    content: prompt.content ?? '',
    icon: prompt.icon ?? 'Zap',
    category: prompt.category ?? 'Custom',
    isDefault: false,
    isPinned: prompt.isPinned ?? false,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * MOCK: Returns updated prompt
 * REAL: AppSync mutation updatePrompt
 */
export async function updateUserPrompt(
  id: string,
  updates: Partial<Prompt>
): Promise<Prompt> {
  await delay(150);
  const existing = MOCK_USER_PROMPTS.find((p) => p.id === id);
  if (!existing) throw new Error(`Prompt not found: ${id}`);
  return {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * MOCK: Simulates deletion
 * REAL: AppSync mutation deletePrompt
 */
export async function deleteUserPrompt(id: string): Promise<void> {
  await delay(150);
  void id;
}
