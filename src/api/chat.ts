import { getApiBaseUrl } from './client';
import { normalizeChatStreamEvent } from './mappers';
import type { ChatMessage, Conversation, SourceCitation, ToolResultCard } from '@/src/types/api';

export type ChatStreamEvent =
  | { event: 'status'; data: { message: string } }
  | { event: 'sources'; data: { sources: SourceCitation[] } }
  | { event: 'token'; data: { text: string } }
  | { event: 'tool_result'; data: ToolResultCard }
  | { event: 'error'; data: { message: string } }
  | { event: 'done'; data: { message_id: string; sources?: SourceCitation[] } };

export function parseSseChunk(buffer: string): {
  events: ChatStreamEvent[];
  remainder: string;
} {
  const events: ChatStreamEvent[] = [];
  const blocks = buffer.split('\n\n');
  const remainder = blocks.pop() ?? '';

  for (const block of blocks) {
    const lines = block.split('\n');
    let eventType = 'message';
    let dataLine = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLine = line.slice(5).trim();
      }
    }

    if (!dataLine) continue;

    try {
      const raw = JSON.parse(dataLine) as Record<string, unknown>;
      const normalized = normalizeChatStreamEvent(eventType, raw);
      if (normalized) events.push(normalized);
    } catch {
      // skip malformed events
    }
  }

  return { events, remainder };
}

export async function listConversations(tripId: string) {
  const { apiRequest } = await import('./client');
  return apiRequest<Conversation[]>(`/trips/${tripId}/conversations`);
}

export async function listMessages(conversationId: string) {
  const { apiRequest } = await import('./client');
  return apiRequest<ChatMessage[]>(`/conversations/${conversationId}/messages`);
}

export type StreamChatOptions = {
  tripId: string;
  message: string;
  conversationId?: string | null;
  signal?: AbortSignal;
  onEvent: (event: ChatStreamEvent) => void;
};

export async function streamChat({
  tripId,
  message,
  conversationId,
  signal,
  onEvent,
}: StreamChatOptions): Promise<void> {
  const url = `${getApiBaseUrl()}/trips/${tripId}/chat/stream`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId ?? null,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    let messageText = `Chat request failed (${response.status}).`;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      if (parsed.error?.message) messageText = parsed.error.message;
    } catch {
      // use default
    }
    onEvent({ event: 'error', data: { message: messageText } });
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onEvent({ event: 'error', data: { message: 'Streaming is not supported.' } });
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const { events, remainder } = parseSseChunk(buffer);
    buffer = remainder;
    events.forEach(onEvent);
  }

  if (buffer.trim()) {
    const { events } = parseSseChunk(`${buffer}\n\n`);
    events.forEach(onEvent);
  }
}
