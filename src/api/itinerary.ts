import { apiRequest } from './client';
import {
  mapItineraryProposalFromApi,
  mapItineraryVersionFromApi,
  type ItineraryProposalApi,
  type ItineraryVersionApi,
} from './mappers';
import type { ItineraryProposal, ItineraryVersion } from '@/src/types/api';

export type GenerateProposalInput = {
  mode?: 'standard' | 'rainy_day';
  target_date?: string;
};

export async function getActiveItinerary(tripId: string) {
  const result = await apiRequest<ItineraryVersionApi | null>(`/trips/${tripId}/itineraries`);
  return {
    ...result,
    data: result.data ? mapItineraryVersionFromApi(result.data) : null,
  };
}

/** @deprecated use getActiveItinerary — backend returns single version or null */
export async function listItineraries(tripId: string) {
  const { data, requestId } = await getActiveItinerary(tripId);
  return { data: data ? [data] : [], requestId };
}

export async function generateProposal(tripId: string, input: GenerateProposalInput = {}) {
  const body: GenerateProposalInput = { mode: input.mode ?? 'standard' };
  if (input.target_date) {
    body.target_date = input.target_date.includes('T')
      ? input.target_date
      : `${input.target_date}T00:00:00Z`;
  }
  const result = await apiRequest<ItineraryProposalApi>(
    `/trips/${tripId}/itinerary-proposals`,
    { method: 'POST', body },
  );
  return { ...result, data: mapItineraryProposalFromApi(result.data) };
}

export async function getProposal(proposalId: string) {
  const result = await apiRequest<ItineraryProposalApi>(`/itinerary-proposals/${proposalId}`);
  return { ...result, data: mapItineraryProposalFromApi(result.data) };
}

export async function applyProposal(proposalId: string) {
  const result = await apiRequest<ItineraryVersionApi>(
    `/itinerary-proposals/${proposalId}/apply`,
    { method: 'POST' },
  );
  return { ...result, data: mapItineraryVersionFromApi(result.data) };
}
