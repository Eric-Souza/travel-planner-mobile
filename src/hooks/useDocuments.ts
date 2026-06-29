import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as documentsApi from '@/src/api/documents';
import type { UploadDocumentParams } from '@/src/api/documents';
import { useUiStore } from '@/src/store/uiStore';
import { queryKeys } from './queryKeys';

const POLL_INTERVAL_MS = 2000;
const TERMINAL_STATUSES = new Set(['ready', 'failed', 'extracted']);

export function useDocuments(tripId: string) {
  return useQuery({
    queryKey: queryKeys.documents(tripId),
    queryFn: async () => {
      const { data } = await documentsApi.listDocuments(tripId);
      return data;
    },
    enabled: !!tripId,
  });
}

export function useDocumentProcessing(documentId: string | null) {
  const setUploadDocumentId = useUiStore((s) => s.setUploadDocumentId);

  return useQuery({
    queryKey: queryKeys.documentStatus(documentId ?? ''),
    queryFn: async () => {
      const { data } = await documentsApi.getProcessingStatus(documentId!);
      if (TERMINAL_STATUSES.has(data.processing_status)) {
        setUploadDocumentId(null);
      }
      return data;
    },
    enabled: !!documentId,
    refetchInterval: (query) => {
      const status = query.state.data?.processing_status;
      if (!status || TERMINAL_STATUSES.has(status)) return false;
      return POLL_INTERVAL_MS;
    },
  });
}

export function useUploadDocument(tripId: string) {
  const queryClient = useQueryClient();
  const setUploadDocumentId = useUiStore((s) => s.setUploadDocumentId);

  return useMutation({
    mutationFn: async (params: Omit<UploadDocumentParams, 'tripId'>) => {
      const { data } = await documentsApi.uploadDocument({ tripId, ...params });
      return data;
    },
    onSuccess: (doc) => {
      setUploadDocumentId(doc.id);
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents(tripId) });
    },
  });
}

export function useProcessDocument(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { data } = await documentsApi.processDocument(documentId);
      return data;
    },
    onSuccess: (doc) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents(tripId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documentStatus(doc.id) });
    },
  });
}

export function useExtractBooking(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { data } = await documentsApi.extractBooking(documentId);
      return data;
    },
    onSuccess: (_, documentId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents(tripId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookingCandidate(documentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings(tripId) });
    },
  });
}
