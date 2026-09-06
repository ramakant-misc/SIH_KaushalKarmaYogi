import { USE_MOCKS, API_BASE_URL } from "./config";
import { request } from "./http";
import { mock } from "./mock";
import { DEMO_USER_IDS, buildChatMessages, buildChatThreads } from "@/mocks";
import type { ChatMessage, ChatSendInput, ChatStreamChunk, ChatThread } from "@/schemas";

const currentUserId = () => DEMO_USER_IDS.employee;

// @replace_with_real_API "GET /api/v1/assistant/threads"
export async function listThreads(token?: string | null): Promise<ChatThread[]> {
  if (USE_MOCKS) return mock(buildChatThreads(currentUserId()));
  return request<ChatThread[]>("/api/v1/assistant/threads", { token });
}

// @replace_with_real_API "POST /api/v1/assistant/threads"
export async function createThread(title?: string, token?: string | null): Promise<ChatThread> {
  if (USE_MOCKS)
    return mock({
      id: `thread_new_${Date.now()}`,
      userId: currentUserId(),
      title: title ?? "New conversation",
      lastMessagePreview: "",
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  return request<ChatThread>("/api/v1/assistant/threads", { method: "POST", body: { title }, token });
}

// @replace_with_real_API "GET /api/v1/assistant/threads/:threadId"
export async function getThread(
  threadId: string,
  token?: string | null,
): Promise<{ thread: ChatThread; messages: ChatMessage[] }> {
  if (USE_MOCKS) {
    const thread = buildChatThreads(currentUserId()).find((t) => t.id === threadId);
    if (!thread)
      return mock({
        thread: {
          id: threadId, userId: currentUserId(), title: "New conversation",
          lastMessagePreview: "", messageCount: 0,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
        messages: [],
      });
    return mock({ thread, messages: buildChatMessages(threadId, currentUserId()) });
  }
  return request(`/api/v1/assistant/threads/${threadId}`, { token });
}

// @replace_with_real_API "PATCH /api/v1/assistant/threads/:threadId"
export async function renameThread(
  threadId: string,
  title: string,
  token?: string | null,
): Promise<ChatThread> {
  if (USE_MOCKS) {
    const thread = buildChatThreads(currentUserId()).find((t) => t.id === threadId);
    return mock({ ...thread!, title, updatedAt: new Date().toISOString() });
  }
  return request<ChatThread>(`/api/v1/assistant/threads/${threadId}`, { method: "PATCH", body: { title }, token });
}

// @replace_with_real_API "DELETE /api/v1/assistant/threads/:threadId"
export async function deleteThread(threadId: string, token?: string | null): Promise<void> {
  if (USE_MOCKS) return mock(undefined);
  return request<void>(`/api/v1/assistant/threads/${threadId}`, { method: "DELETE", token });
}

const MOCK_REPLY = `That is a good question, and your competency profile gives a clear answer.

**Where you are now.** Your current level in this area sits below what your role requires, and the evidence behind it is largely self-declared — which is why the confidence score is low.

**What I would do, in order:**

1. **Take the foundational course first.** It is the shortest route from your current level to the required one, and it is available in both English and Hindi.
2. **Sit the competency assessment immediately after.** This converts self-declared evidence into assessed evidence and raises your confidence score.
3. **Apply it on your current assignment.** Practical application is what actually moves you from Working to Practitioner — the course alone will not.

Would you like me to add these to your learning pathway?`;

/**
 * Streams an assistant reply.
 *
 * The mock emits chunks on a timer so the typing animation, the stop button and
 * the scroll behaviour are all exercised for real. Swapping to the live SSE
 * endpoint replaces the body of the mock branch only.
 */
// @replace_with_real_API "POST /api/v1/assistant/threads/:threadId/messages"
export async function* sendMessage(
  threadId: string,
  input: ChatSendInput,
  opts: { token?: string | null; signal?: AbortSignal } = {},
): AsyncGenerator<ChatStreamChunk> {
  const messageId = `msg_new_${Date.now()}`;

  if (USE_MOCKS) {
    const words = MOCK_REPLY.split(/(\s+)/);
    for (let i = 0; i < words.length; i += 2) {
      if (opts.signal?.aborted) return;
      await new Promise((r) => setTimeout(r, 18));
      yield { messageId, delta: words.slice(i, i + 2).join(""), done: false };
    }
    yield {
      messageId,
      delta: "",
      done: true,
      citations: [
        { kind: "course", refId: "course_013", label: "Python for Official Statistics", href: "/courses/course_013" },
        { kind: "competency", refId: "python", label: "Python", href: "/competency" },
      ],
    };
    return;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/assistant/threads/${threadId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: JSON.stringify(input),
    signal: opts.signal,
  });
  if (!response.ok || !response.body) throw new Error("Assistant request failed");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const data = line.replace(/^data:\s*/, "").trim();
      if (data) yield JSON.parse(data) as ChatStreamChunk;
    }
  }
}

// @replace_with_real_API "POST /api/v1/assistant/messages/:messageId/feedback"
export async function sendMessageFeedback(
  messageId: string,
  feedback: "up" | "down",
  token?: string | null,
): Promise<void> {
  if (USE_MOCKS) return mock(undefined, 80);
  return request<void>(`/api/v1/assistant/messages/${messageId}/feedback`, {
    method: "POST", body: { feedback }, token,
  });
}
