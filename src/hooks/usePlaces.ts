import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as placesApi from '@/src/api/places';
import type { PlaceCategory, PlaceSearchResult } from '@/src/types/api';
import { queryKeys } from './queryKeys';

export function usePlaces(tripId: string, category?: PlaceCategory) {
  return useQuery({
    queryKey: queryKeys.places(tripId, category),
    queryFn: async () => {
      const { data } = await placesApi.listPlaces(tripId);
      if (!category) return data;
      return data.filter((p) => p.category === category);
    },
    enabled: !!tripId,
  });
}

export function useSearchPlaces(tripId: string) {
  return useMutation({
    mutationFn: async ({
      query,
      category,
      latitude,
      longitude,
    }: {
      query: string;
      category?: PlaceCategory;
      latitude?: number;
      longitude?: number;
    }) => {
      const { data } = await placesApi.searchPlaces(tripId, query, category, {
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
      });
      return data;
    },
  });
}

export function useSavePlace(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (searchResult: PlaceSearchResult) => {
      const { data } = await placesApi.saveSearchResult(tripId, searchResult);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'places'] });
    },
  });
}

export function useRemovePlace(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (placeId: string) => {
      await placesApi.removePlace(tripId, placeId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'places'] });
    },
  });
}
