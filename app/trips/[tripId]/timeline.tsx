import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { EmptyState, ErrorState, LoadingState, OfflineBanner } from '@/src/components/StateViews';
import {
  DEMO_BOOKINGS,
  DEMO_ITINERARY_ITEMS,
  DEMO_TRIP,
} from '@/src/features/demo/demoData';
import { BookingCard, ItineraryItemCard } from '@/src/features/timeline/TimelineCards';
import { useBookings } from '@/src/hooks/useBookings';
import { useItineraries } from '@/src/hooks/useItinerary';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useTrip } from '@/src/hooks/useTrips';
import { useUiStore } from '@/src/store/uiStore';
import { formatDayLabel } from '@/src/utils/dates';
import { groupTimelineEntries } from '@/src/utils/timeline';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing, typography } from '@/src/theme';

export default function TimelineScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const demoMode = useUiStore((s) => s.demoMode);
  const { isOnline } = useNetworkStatus();
  const { data: trip } = useTrip(tripId);
  const { data: bookings, isLoading, isError, error, refetch } = useBookings(tripId);
  const { data: itinerary } = useItineraries(tripId);

  const activeTrip = demoMode ? DEMO_TRIP : trip;
  const activeBookings = demoMode
    ? DEMO_BOOKINGS
    : (bookings?.filter((b) => b.status !== 'rejected') ?? []);
  const itineraryItems = demoMode ? DEMO_ITINERARY_ITEMS : (itinerary?.items ?? []);

  if (!demoMode && isLoading) return <LoadingState />;
  if (!demoMode && isError) {
    return (
      <ErrorState message={getNetworkErrorMessage(error)} onRetry={() => void refetch()} />
    );
  }
  if (!activeTrip) return <LoadingState />;

  const groups = groupTimelineEntries(
    activeBookings,
    itineraryItems,
    activeTrip.home_timezone,
  );

  return (
    <View style={styles.container}>
      {!isOnline ? <OfflineBanner /> : null}
      <FlatList
        data={groups}
        keyExtractor={(g) => g.dayKey}
        ListEmptyComponent={
          <EmptyState
            title="Nothing scheduled yet"
            description="Confirm bookings or apply an itinerary to see your timeline."
          />
        }
        renderItem={({ item: group }) => (
          <View style={styles.dayGroup}>
            <Text style={styles.dayLabel}>{formatDayLabel(group.dayKey)}</Text>
            {group.entries.map((entry) =>
              entry.kind === 'booking' ? (
                <BookingCard
                  key={entry.item.id}
                  booking={entry.item}
                  timezone={activeTrip.home_timezone}
                  onPress={() => router.push(`/trips/${tripId}/bookings`)}
                />
              ) : (
                <ItineraryItemCard key={entry.item.id} item={entry.item} />
              ),
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayGroup: {
    padding: spacing.md,
  },
  dayLabel: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
