import { router } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Card, FAB, List, Switch, Text } from 'react-native-paper';
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
import { colors, spacing } from '@/src/theme';
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
      <Card mode="elevated" style={styles.demoCard}>
        <List.Item
          title="Demo mode"
          description="Buenos Aires + Bariloche sample data"
          left={(props) => <List.Icon {...props} icon="test-tube" />}
          right={() => (
            <Switch
              value={demoMode}
              onValueChange={setDemoMode}
              accessibilityLabel="Toggle demo mode"
            />
          )}
        />
      </Card>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
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
          <Card
            mode="elevated"
            style={styles.tripCard}
            onPress={() => router.push(`/trips/${item.id}`)}
            accessibilityLabel={`Open trip ${item.name}`}
          >
            <Card.Content>
              <List.Item
                title={item.name}
                description={`${formatTripDate(item.start_date, item.home_timezone)} – ${formatTripDate(item.end_date, item.home_timezone)}`}
                left={(props) => <List.Icon {...props} icon="bag-suitcase" />}
                right={() =>
                  item.booking_count != null ? (
                    <Text variant="labelMedium" style={styles.bookingCount}>
                      {item.booking_count} bookings
                    </Text>
                  ) : null
                }
              />
            </Card.Content>
          </Card>
        )}
      />

      <FAB
        icon="plus"
        label="Create trip"
        style={styles.fab}
        onPress={() => router.push('/trips/create')}
        accessibilityLabel="Create trip"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  demoCard: {
    margin: spacing.md,
    marginBottom: 0,
    backgroundColor: colors.surface,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 96,
    gap: spacing.sm,
  },
  tripCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  bookingCount: {
    color: colors.primary,
    alignSelf: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    backgroundColor: colors.primary,
  },
});
