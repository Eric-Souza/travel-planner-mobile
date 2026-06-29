import { apiRequest } from './client';
import {
  mapBookingCandidateFromApi,
  mapBookingFromApi,
  type BookingApi,
  type BookingCandidateApi,
} from './mappers';
import type { CreateBookingInput, UpdateBookingInput } from '@/src/types/api';

export async function listBookings(tripId: string, status?: string) {
  const query = status ? `?status=${status}` : '';
  const result = await apiRequest<BookingApi[]>(`/trips/${tripId}/bookings${query}`);
  return { ...result, data: result.data.map(mapBookingFromApi) };
}

export async function createBooking(tripId: string, input: CreateBookingInput) {
  const result = await apiRequest<BookingApi>(`/trips/${tripId}/bookings`, {
    method: 'POST',
    body: { ...input, status: 'confirmed' },
  });
  return { ...result, data: mapBookingFromApi(result.data) };
}

export async function updateBooking(bookingId: string, input: UpdateBookingInput) {
  const result = await apiRequest<BookingApi>(`/bookings/${bookingId}`, {
    method: 'PATCH',
    body: input,
  });
  return { ...result, data: mapBookingFromApi(result.data) };
}

export async function confirmBooking(bookingId: string) {
  const result = await apiRequest<BookingApi>(`/bookings/${bookingId}/confirm`, {
    method: 'POST',
  });
  return { ...result, data: mapBookingFromApi(result.data) };
}

export async function rejectBooking(bookingId: string) {
  const result = await apiRequest<BookingApi>(`/bookings/${bookingId}/reject`, {
    method: 'POST',
  });
  return { ...result, data: mapBookingFromApi(result.data) };
}

export async function getBookingCandidate(documentId: string) {
  const result = await apiRequest<BookingCandidateApi>(
    `/documents/${documentId}/booking-candidate`,
  );
  const mapped = mapBookingCandidateFromApi(result.data);
  if (!mapped.booking?.id) {
    throw new Error('No booking candidate available for this document.');
  }
  return { ...result, data: mapped };
}
