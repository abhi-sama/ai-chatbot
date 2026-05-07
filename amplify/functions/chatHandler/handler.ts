// ─── ChatHandler Lambda ─────────────────────────────────────────────────────
// This Lambda is invoked by AppSync to handle chat messages.
// It orchestrates cross-account calls and streams responses back.

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatHandlerEvent {
  conversationId: string;
  content: string;
  model: string;
  dataSource: string;
  mode: string;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    s3Key: string;
    url: string;
    size: number;
    uploadedAt: string;
  }>;
  userId?: string;
}

interface ChatHandlerResponse {
  statusCode: number;
  body: string;
}

interface StreamChunk {
  type: 'text' | 'done' | 'error';
  content: string;
  messageId?: string;
}

// ─── Handler ────────────────────────────────────────────────────────────────

export const handler = async (
  event: ChatHandlerEvent
): Promise<ChatHandlerResponse> => {
  const { conversationId, content, model, dataSource, mode, attachments } = event;

  console.log('[chatHandler] Received request:', {
    conversationId,
    model,
    dataSource,
    mode,
    attachmentCount: attachments?.length ?? 0,
  });

  // ─── Step 1: Assume cross-account role (Account B) via STS ──────────────
  // REAL: Use AWS SDK STS client to assume role
  // const stsClient = new STSClient({ region: process.env.AWS_REGION });
  // const assumeRoleResponse = await stsClient.send(new AssumeRoleCommand({
  //   RoleArn: process.env.CROSS_ACCOUNT_ROLE_ARN,
  //   RoleSessionName: `chatqa-${conversationId}`,
  // }));
  // const credentials = assumeRoleResponse.Credentials;

  // MOCK: Skip STS for local development
  const credentials = {
    AccessKeyId: 'MOCK_ACCESS_KEY',
    SecretAccessKey: 'MOCK_SECRET_KEY',
    SessionToken: 'MOCK_SESSION_TOKEN',
  };
  console.log('[chatHandler] MOCK: Using mock credentials');

  // ─── Step 2: Call Account B Lambda Function URL with streaming ──────────
  // REAL: Call the Lambda Function URL in Account B with streaming enabled
  // const functionUrl = process.env.ACCOUNT_B_FUNCTION_URL;
  // const response = await fetch(functionUrl, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${credentials.SessionToken}`,
  //   },
  //   body: JSON.stringify({ conversationId, content, model, dataSource, mode, attachments }),
  // });
  // const reader = response.body.getReader();

  // MOCK: Simulate streaming response
  const mockChunks: StreamChunk[] = [
    { type: 'text', content: 'I understand your question. ' },
    { type: 'text', content: 'Let me help you with that.\n\n' },
    { type: 'text', content: `Based on the **${dataSource}** data source, ` },
    { type: 'text', content: 'here is what I found...' },
    { type: 'done', content: '', messageId: `msg-${Date.now()}` },
  ];

  // ─── Step 3: Process chunks → write to DynamoDB (failsafe) ─────────────
  // REAL: As chunks arrive from the stream:
  // const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  // for await (const chunk of streamReader) {
  //   // Accumulate content
  //   // Periodically write to DynamoDB Messages table (every N chunks or on done)
  //   // await dynamoClient.send(new PutItemCommand({
  //   //   TableName: process.env.MESSAGES_TABLE,
  //   //   Item: { conversationId, messageId, content: accumulated, ... }
  //   // }));
  // }

  // MOCK: Simulate DynamoDB write
  const fullContent = mockChunks
    .filter((c) => c.type === 'text')
    .map((c) => c.content)
    .join('');
  console.log('[chatHandler] MOCK: Would write to DynamoDB:', {
    conversationId,
    contentLength: fullContent.length,
  });

  // ─── Step 4: Return chunks via AppSync subscription ────────────────────
  // REAL: Publish each chunk to AppSync subscription
  // for (const chunk of chunks) {
  //   await appsyncClient.mutate({
  //     mutation: PUBLISH_CHUNK_MUTATION,
  //     variables: { conversationId, chunk },
  //   });
  // }

  // MOCK: Return the full response
  return {
    statusCode: 200,
    body: JSON.stringify({
      conversationId,
      messageId: `msg-${Date.now()}`,
      content: fullContent,
      model,
      chunks: mockChunks,
    }),
  };
};
