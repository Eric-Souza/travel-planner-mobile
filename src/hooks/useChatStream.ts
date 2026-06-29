import { useCallback, useEffect, useRef, useState } from 'react';
import { listConversations, listMessages, streamChat, type ChatStreamEvent } from '@/src/api/chat';
import type { ChatMessage, SourceCitation, ToolResultCard } from '@/src/types/api';
import { queryKeys } from './queryKeys';
import { useQuery } from '@tanstack/react-query';

export type StreamMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: SourceCitation[];
  toolResults: ToolResultCard[];
  status: ChatMessage['status'];
  statusMessage?: string;
};

const SUGGESTED_PROMPTS = [
  'What is booked for Tuesday?',
  'What time is my check-in?',
  'What is the cancellation policy?',
  'What does the hotel policy say about check-in?',
];

export function useChatStream(tripId: string) {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string>('');
  const conversationIdRef = useRef<string | null>(null);

  const { data: conversations } = useQuery({
    queryKey: queryKeys.conversations(tripId),
    queryFn: async () => {
      const { data } = await listConversations(tripId);
      return data;
    },
    enabled: !!tripId,
  });

  useEffect(() => {
    if (conversations?.length && !conversationIdRef.current) {
      conversationIdRef.current = conversations[0].id;
    }
  }, [conversations]);

  const loadHistory = useCallback(async () => {
    if (!conversationIdRef.current) return;
    const { data } = await listMessages(conversationIdRef.current);
    setMessages(
      data.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sources: m.sources ?? [],
        toolResults: [],
        status: m.status,
      })),
    );
  }, []);

  const updateAssistant = useCallback((updater: (msg: StreamMessage) => StreamMessage) => {
    setMessages((prev) => {
      const copy = [...prev];
      let idx = -1;
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === 'assistant') {
          idx = i;
          break;
        }
      }
      if (idx === -1) return prev;
      copy[idx] = updater(copy[idx]);
      return copy;
    });
  }, []);

  const handleEvent = useCallback(
    (event: ChatStreamEvent) => {
      switch (event.event) {
        case 'status':
          updateAssistant((m) => ({ ...m, statusMessage: event.data.message }));
          break;
        case 'sources':
          updateAssistant((m) => ({ ...m, sources: event.data.sources }));
          break;
        case 'token':
          updateAssistant((m) => ({
            ...m,
            content: m.content + event.data.text,
            statusMessage: undefined,
          }));
          break;
        case 'tool_result':
          updateAssistant((m) => ({
            ...m,
            toolResults: [...m.toolResults, event.data],
          }));
          break;
        case 'error':
          setError(event.data.message);
          updateAssistant((m) => ({ ...m, status: 'error' }));
          break;
        case 'done':
          if (event.data.message_id) {
            conversationIdRef.current =
              conversationIdRef.current ?? event.data.message_id.split('-')[0] ?? null;
          }
          updateAssistant((m) => ({
            ...m,
            id: event.data.message_id || m.id,
            status: 'complete',
            sources: event.data.sources ?? m.sources,
            statusMessage: undefined,
          }));
          break;
      }
    },
    [updateAssistant],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      setError(null);
      lastUserMessageRef.current = text;
      const userMsg: StreamMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        sources: [],
        toolResults: [],
        status: 'complete',
      };
      const assistantMsg: StreamMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        sources: [],
        toolResults: [],
        status: 'streaming',
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      abortRef.current = new AbortController();
      try {
        await streamChat({
          tripId,
          message: text,
          conversationId: conversationIdRef.current,
          signal: abortRef.current.signal,
          onEvent: handleEvent,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [tripId, isStreaming, handleEvent],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const retry = useCallback(() => {
    if (lastUserMessageRef.current) {
      setMessages((prev) => prev.slice(0, -2));
      void sendMessage(lastUserMessageRef.current);
    }
  }, [sendMessage]);

  return {
    messages,
    isStreaming,
    error,
    suggestedPrompts: SUGGESTED_PROMPTS,
    sendMessage,
    cancel,
    retry,
    loadHistory,
    conversationId: conversationIdRef.current,
  };
}
