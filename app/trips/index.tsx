import { router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Switch, Text, View } from 'react-native';
import { PrimaryButton } from '@/src/components/Card';
import { EmptyState, ErrorState, LoadingState } from '@/src/components/StateViews';
import {
  DEMO_BOOKINGS,
  DEMO_ITINERARY_ITEMS,
  DEMO_PLACES,
  DEMO_TRIP,
} from '@/src/features/demo/demoData';
import { useTrips } from '@/src/hooks/useTrips';
import { useUiStore } from '@/src/store/uiStore';
import { formatTripDate } from '@/src/utils/dates';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing, typography } from '@/src/theme';
import type { TripSummary } from '@/src/types/api';

export default function TripsListScreen() {
  const { data, isLoading, isError, error, refetch, isFetching } = useTrips();
  const demoMode = useUiStore((s) => s.demoMode);
  const setDemoMode = useUiStore((s) => s.setDemoMode);

  const trips: TripSummary[] = demoMode
    ? [{ ...DEMO_TRIP, booking_count: DEMO_BOOKINGS.length }]
    : (data ?? []);

  if (!demoMode && isLoading) return <LoadingState message="Loading trips…" />;
  if (!demoMode && isError) {
    return (
      <ErrorState message={getNetworkErrorMessage(error)} onRetry={() => void refetch()} />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.demoRow}>
        <Text style={styles.demoLabel}>Demo mode</Text>
        <Switch
          value={demoMode}
          onValueChange={setDemoMode}
          accessibilityLabel="Toggle demo mode with Buenos Aires and Bariloche sample data"
        />
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isFetching && !demoMode} onRefresh={() => void refetch()} />
        }
        ListEmptyComponent={
          <EmptyState
            title="No trips yet"
            description="Create your first trip to start planning."
            actionLabel="Create trip"
            onAction={() => router.push('/trips/create')}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.tripCard}
            onPress={() => router.push(`/trips/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open trip ${item.name}`}
          >
            <Text style={styles.tripName}>{item.name}</Text>
            <Text style={styles.tripDates}>
              {formatTripDate(item.start_date, item.home_timezone)} –{' '}
              {formatTripDate(item.end_date, item.home_timezone)}
            </Text>
            {item.booking_count != null ? (
              <Text style={styles.tripMeta}>{item.booking_count} bookings</Text>
            ) : null}
          </Pressable>
        )}
      />

      <PrimaryButton label="Create trip" onPress={() => router.push('/trips/create')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  demoLabel: {
    ...typography.label,
    color: colors.text,
  },
  tripCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tripName: {
    ...typography.subtitle,
    color: colors.text,
  },
  tripDates: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tripMeta: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
  },
});
