import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as preferencesApi from '@/src/api/preferences';
import type { TravelPreference } from '@/src/types/api';
import { queryKeys } from './queryKeys';

export function usePreferences(tripId: string) {
  return useQuery({
    queryKey: queryKeys.preferences(tripId),
    queryFn: async () => {
      const { data } = await preferencesApi.getPreferences(tripId);
      return data;
    },
    enabled: !!tripId,
  });
}

export function useUpdatePreferences(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Omit<TravelPreference, 'trip_id'>>) => {
      const { data } = await preferencesApi.updatePreferences(tripId, input);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.preferences(tripId) });
    },
  });
}
