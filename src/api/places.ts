import { apiRequest } from './client';
import {
  mapPlaceFromApi,
  mapPlaceSearchToCreate,
  type PlaceApi,
  type PlaceSearchResultApi,
} from './mappers';
import type { Place, PlaceCategory } from '@/src/types/api';

export async function listPlaces(tripId: string) {
  const result = await apiRequest<PlaceApi[]>(`/trips/${tripId}/places`);
  return { ...result, data: result.data.map(mapPlaceFromApi) };
}

export async function createPlace(
  tripId: string,
  input: {
    name: string;
    category: string;
    latitude: number;
    longitude: number;
    address?: string;
    user_saved?: boolean;
  },
) {
  const result = await apiRequest<PlaceApi>(`/trips/${tripId}/places`, {
    method: 'POST',
    body: input,
  });
  return { ...result, data: mapPlaceFromApi(result.data) };
}

export async function searchPlaces(
  tripId: string,
  query: string,
  category?: PlaceCategory,
  coordinates?: { latitude: number; longitude: number },
) {
  const result = await apiRequest<PlaceSearchResultApi[]>(`/trips/${tripId}/places/search`, {
    method: 'POST',
    body: {
      query,
      category,
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    },
  });
  return { ...result, data: result.data };
}

export async function saveSearchResult(
  tripId: string,
  result: PlaceSearchResultApi,
) {
  return createPlace(tripId, mapPlaceSearchToCreate(result));
}

export async function removePlace(tripId: string, placeId: string) {
  return apiRequest<{ deleted: string }>(`/trips/${tripId}/places/${placeId}`, {
    method: 'DELETE',
  });
}
