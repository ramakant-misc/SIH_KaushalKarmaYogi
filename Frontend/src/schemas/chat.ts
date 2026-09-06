import { z } from "zod";
import { IdSchema, IsoDateTimeSchema } from "./common";

/** A citation chip rendered under an assistant message. */
export const ChatCitationSchema = z.object({
  kind: z.enum(["course", "programme", "competency", "document"]),
  refId: z.string(),
  label: z.string(),
  /** In-app route the chip links to. */
  href: z.string(),
});
export type ChatCitation = z.infer<typeof ChatCitationSchema>;

export const ChatMessageSchema = z.object({
  id: IdSchema,
  threadId: IdSchema,
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().describe("Markdown"),
  citations: z.array(ChatCitationSchema),
  /** Set while the assistant message is still streaming. */
  isStreaming: z.boolean().optional(),
  feedback: z.enum(["up", "down"]).nullable(),
  createdAt: IsoDateTimeSchema,
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatThreadSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  title: z.string(),
  lastMessagePreview: z.string(),
  messageCount: z.number().int().nonnegative(),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
});
export type ChatThread = z.infer<typeof ChatThreadSchema>;

/**
 * Body for POST /api/v1/assistant/threads/:threadId/messages.
 * `context` grounds the answer in what the user is currently looking at.
 */
export const ChatSendInputSchema = z.object({
  content: z.string().min(1),
  context: z
    .object({
      courseId: IdSchema.optional(),
      competencyKey: z.string().optional(),
      assetId: IdSchema.optional(),
    })
    .optional(),
});
export type ChatSendInput = z.infer<typeof ChatSendInputSchema>;

/** Server-sent event payload while streaming a reply. */
export const ChatStreamChunkSchema = z.object({
  messageId: IdSchema,
  delta: z.string(),
  done: z.boolean(),
  citations: z.array(ChatCitationSchema).optional(),
});
export type ChatStreamChunk = z.infer<typeof ChatStreamChunkSchema>;
