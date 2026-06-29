import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as bookingsApi from '@/src/api/bookings';
import { cacheTripData, getCachedTripData } from '@/src/cache';
import type { CreateBookingInput, UpdateBookingInput } from '@/src/types/api';
import { queryKeys } from './queryKeys';
import { useNetworkStatus } from './useNetworkStatus';

export function useBookings(tripId: string, status?: string) {
  const { isOnline } = useNetworkStatus();

  return useQuery({
    queryKey: queryKeys.bookings(tripId, status),
    queryFn: async () => {
      try {
        const { data } = await bookingsApi.listBookings(tripId, status);
        return data;
      } catch (error) {
        if (!isOnline) {
          const cached = await getCachedTripData(tripId);
          if (cached) return cached.bookings;
        }
        throw error;
      }
    },
    enabled: !!tripId,
  });
}

export function useBookingCandidate(documentId: string | null) {
  return useQuery({
    queryKey: queryKeys.bookingCandidate(documentId ?? ''),
    queryFn: async () => {
      const { data } = await bookingsApi.getBookingCandidate(documentId!);
      return data;
    },
    enabled: !!documentId,
  });
}

export function useCreateBooking(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      const { data } = await bookingsApi.createBooking(tripId, input);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings(tripId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips });
    },
  });
}

export function useUpdateBooking(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      input,
    }: {
      bookingId: string;
      input: UpdateBookingInput;
    }) => {
      const { data } = await bookingsApi.updateBooking(bookingId, input);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings(tripId) });
    },
  });
}

export function useConfirmBooking(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await bookingsApi.confirmBooking(bookingId);
      return data;
    },
    onSuccess: async (booking) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings(tripId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.trips });
      const cached = await getCachedTripData(tripId);
      if (cached) {
        await cacheTripData(tripId, {
          ...cached,
          bookings: [...cached.bookings.filter((b) => b.id !== booking.id), booking],
        });
      }
    },
  });
}

export function useRejectBooking(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await bookingsApi.rejectBooking(bookingId);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings(tripId) });
    },
  });
}
