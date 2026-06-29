import { apiRequest } from './client';
import type { GroundedAnswer, SourceCitation } from '@/src/types/api';

export type SearchDocumentsInput = {
  query: string;
  limit?: number;
};

export async function searchTripDocuments(tripId: string, input: SearchDocumentsInput) {
  return apiRequest<{
    query: string;
    chunks: {
      chunk_id: string;
      document_id: string;
      document_title: string;
      page_number?: number;
      section_title?: string;
      content: string;
      score: number;
      citation: SourceCitation;
    }[];
  }>(`/trips/${tripId}/search`, {
    method: 'POST',
    body: input,
  });
}

export async function askDocumentQuestion(
  tripId: string,
  question: string,
  documentId?: string,
) {
  return apiRequest<GroundedAnswer>(`/trips/${tripId}/ask-document-question`, {
    method: 'POST',
    body: { question, document_id: documentId ?? null },
  });
}
