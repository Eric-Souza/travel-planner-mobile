import { apiRequest } from './client';
import {
  mapDocumentFromApi,
  mapPreferenceFromApi,
  mapPreferenceToApi,
  type DocumentApi,
  type PreferenceApi,
} from './mappers';
import type { TravelPreference } from '@/src/types/api';

export async function getPreferences(tripId: string) {
  const result = await apiRequest<PreferenceApi>(`/trips/${tripId}/preferences`);
  return { ...result, data: mapPreferenceFromApi(result.data) };
}

export async function updatePreferences(
  tripId: string,
  input: Partial<Omit<TravelPreference, 'trip_id'>>,
) {
  const result = await apiRequest<PreferenceApi>(`/trips/${tripId}/preferences`, {
    method: 'PATCH',
    body: mapPreferenceToApi(input),
  });
  return { ...result, data: mapPreferenceFromApi(result.data) };
}
