import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * ChatQA Data Schema
 *
 * Defines DynamoDB tables for conversations, messages, and user prompts
 * with owner-based authorization via Cognito User Pools.
 */
const schema = a.schema({
  /**
   * Conversation model
   * PK: userId | SK: id (auto-generated identifier)
   */
  Conversation: a
    .model({
      userId: a.string().required(),
      title: a.string().required(),
      model: a.enum(['claude_3_haiku_20240307', 'claude_3_5_sonnet_20241022']),
      dataSource: a.enum(['records', 'insights', 'both']),
      mode: a.enum(['assistant', 'developer']),
      status: a.enum(['active', 'archived']),
      messageCount: a.integer().default(0),
      lastMessageAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      index('userId').sortKeys(['lastMessageAt']).name('byUserLastMessage'),
      index('userId').sortKeys(['createdAt']).name('byUserCreatedAt'),
    ])
    .authorization((allow) => [allow.owner()]),

  /**
   * Message model
   * PK: conversationId | SK: id (auto-generated identifier)
   */
  Message: a
    .model({
      conversationId: a.string().required(),
      role: a.enum(['user', 'assistant', 'system']),
      content: a.string().required(),
      attachments: a.json(),
      model: a.enum(['claude_3_haiku_20240307', 'claude_3_5_sonnet_20241022']),
      dataSource: a.enum(['records', 'insights', 'both']),
      tokensUsed: a.integer(),
      latencyMs: a.integer(),
      isComplete: a.boolean().default(true),
    })
    .secondaryIndexes((index) => [
      index('conversationId').sortKeys(['createdAt']).name('byConversationCreatedAt'),
    ])
    .authorization((allow) => [allow.owner()]),

  /**
   * UserPrompt model
   * PK: userId | SK: id (auto-generated identifier)
   */
  UserPrompt: a
    .model({
      userId: a.string().required(),
      title: a.string().required(),
      description: a.string().required(),
      content: a.string().required(),
      icon: a.string().required(),
      category: a.string().required(),
      isPinned: a.boolean().default(false),
      usageCount: a.integer().default(0),
    })
    .secondaryIndexes((index) => [
      index('userId').sortKeys(['createdAt']).name('byUserCreatedAt'),
      index('userId').sortKeys(['usageCount']).name('byUserUsageCount'),
    ])
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export default defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
