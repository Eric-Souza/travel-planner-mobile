import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as tripsApi from '@/src/api/trips';
import { cacheTripsList, getCachedTripsList } from '@/src/cache';
import type { CreateTripInput, UpdateTripInput } from '@/src/types/api';
import { useNetworkStatus } from './useNetworkStatus';

export function useTrips() {
  const { isOnline } = useNetworkStatus();

  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      try {
        const { data } = await tripsApi.listTrips();
        await cacheTripsList(data);
        return data;
      } catch (error) {
        if (!isOnline) {
          const cached = await getCachedTripsList();
          if (cached) return cached.trips;
        }
        throw error;
      }
    },
  });
}

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ['trips', tripId],
    queryFn: async () => {
      const { data } = await tripsApi.getTrip(tripId);
      return data;
    },
    enabled: !!tripId,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTripInput) => {
      const { data } = await tripsApi.createTrip(input);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateTripInput) => {
      const { data } = await tripsApi.updateTrip(tripId, input);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['trips'] });
      void queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
    },
  });
}
