import { apiRequest } from './client';
import { toTripDatetime } from './mappers';
import type { CreateTripInput, Trip, TripSummary, UpdateTripInput } from '@/src/types/api';

export async function listTrips() {
  return apiRequest<TripSummary[]>('/trips');
}

export async function getTrip(tripId: string) {
  return apiRequest<Trip>(`/trips/${tripId}`);
}

export async function createTrip(input: CreateTripInput) {
  return apiRequest<Trip>('/trips', {
    method: 'POST',
    body: {
      ...input,
      start_date: toTripDatetime(input.start_date),
      end_date: toTripDatetime(input.end_date),
    },
  });
}

export async function updateTrip(tripId: string, input: UpdateTripInput) {
  const body: UpdateTripInput = { ...input };
  if (body.start_date) body.start_date = toTripDatetime(body.start_date);
  if (body.end_date) body.end_date = toTripDatetime(body.end_date);
  return apiRequest<Trip>(`/trips/${tripId}`, { method: 'PATCH', body });
}
