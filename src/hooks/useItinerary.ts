import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as itineraryApi from '@/src/api/itinerary';
import type { GenerateProposalInput } from '@/src/api/itinerary';
import { queryKeys } from './queryKeys';

export function useItineraries(tripId: string) {
  return useQuery({
    queryKey: queryKeys.itineraries(tripId),
    queryFn: async () => {
      const { data } = await itineraryApi.getActiveItinerary(tripId);
      return data;
    },
    enabled: !!tripId,
  });
}

export function useProposal(proposalId: string | null) {
  return useQuery({
    queryKey: queryKeys.proposal(proposalId ?? ''),
    queryFn: async () => {
      const { data } = await itineraryApi.getProposal(proposalId!);
      return data;
    },
    enabled: !!proposalId,
  });
}

export function useGenerateProposal(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: GenerateProposalInput) => {
      const { data } = await itineraryApi.generateProposal(tripId, input);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.itineraries(tripId) });
    },
  });
}

export function useApplyProposal(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proposalId: string) => {
      const { data } = await itineraryApi.applyProposal(proposalId);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.itineraries(tripId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings(tripId) });
    },
  });
}
