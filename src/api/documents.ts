import { getTripDocuments, addTripDocument, updateTripDocument } from '@/src/cache/documents';
import { apiRequest } from './client';
import {
  mapBookingFromApi,
  mapDocumentFromApi,
  type BookingApi,
  type DocumentApi,
} from './mappers';
import type {
  DocumentProcessingStatusResponse,
  TravelDocument,
} from '@/src/types/api';

export type UploadDocumentParams = {
  tripId: string;
  file: { uri: string; name: string; mimeType: string };
};

/** Backend has no list route — reads locally tracked uploads for this trip. */
export async function listDocuments(tripId: string) {
  const docs = await getTripDocuments(tripId);
  return { data: docs };
}

export async function uploadDocument({ tripId, file }: UploadDocumentParams) {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  const result = await apiRequest<DocumentApi>(`/trips/${tripId}/documents`, {
    method: 'POST',
    body: form,
  });
  const mapped = mapDocumentFromApi(result.data);
  await addTripDocument(mapped);
  return { ...result, data: mapped };
}

export async function getDocument(documentId: string) {
  const result = await apiRequest<DocumentApi>(`/documents/${documentId}`);
  const mapped = mapDocumentFromApi(result.data);
  await updateTripDocument(mapped);
  return { ...result, data: mapped };
}

export async function getProcessingStatus(documentId: string) {
  return apiRequest<DocumentProcessingStatusResponse>(
    `/documents/${documentId}/processing-status`,
  );
}

export async function processDocument(documentId: string) {
  const result = await apiRequest<DocumentApi>(`/documents/${documentId}/process`, {
    method: 'POST',
  });
  const mapped = mapDocumentFromApi(result.data);
  await updateTripDocument(mapped);
  return { ...result, data: mapped };
}

export async function extractBooking(documentId: string) {
  const result = await apiRequest<BookingApi>(`/documents/${documentId}/extract-booking`, {
    method: 'POST',
  });
  return { ...result, data: mapBookingFromApi(result.data) };
}

export async function embedDocument(documentId: string) {
  return apiRequest<{ document_id: string; chunks_created: number }>(
    `/documents/${documentId}/embed`,
    { method: 'POST' },
  );
}
