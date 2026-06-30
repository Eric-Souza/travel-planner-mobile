import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Card, Chip, Surface, Text } from 'react-native-paper';
import { PrimaryButton } from '@/src/components/Card';
import { Screen } from '@/src/components/Screen';
import { ErrorState, LoadingState } from '@/src/components/StateViews';
import {
  DEMO_BOOKINGS,
  DEMO_ITINERARY_ITEMS,
  DEMO_PREFERENCES,
  DEMO_TRIP,
} from '@/src/features/demo/demoData';
import { useBookings } from '@/src/hooks/useBookings';
import { useTrip } from '@/src/hooks/useTrips';
import { useUiStore } from '@/src/store/uiStore';
import { formatTripDate } from '@/src/utils/dates';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing } from '@/src/theme';

export default function TripDashboardScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const demoMode = useUiStore((s) => s.demoMode);
  const { data: trip, isLoading, isError, error, refetch } = useTrip(tripId);
  const { data: bookings } = useBookings(tripId);

  const activeTrip = demoMode ? DEMO_TRIP : trip;
  const bookingCount = demoMode ? DEMO_BOOKINGS.length : (bookings?.length ?? 0);
  const itineraryCount = demoMode ? DEMO_ITINERARY_ITEMS.length : 0;

  if (!demoMode && isLoading) return <LoadingState />;
  if (!demoMode && (isError || !activeTrip)) {
    return (
      <ErrorState message={getNetworkErrorMessage(error)} onRetry={() => void refetch()} />
    );
  }
  if (!activeTrip) return null;

  const nextActions = [
    {
      label: bookingCount === 0 ? 'Upload a reservation' : 'View timeline',
      route: bookingCount === 0 ? 'documents' : 'timeline',
      icon: bookingCount === 0 ? 'file-upload' : 'calendar-clock',
    },
    { label: 'Set preferences', route: 'preferences', icon: 'tune' },
    { label: 'Ask a question', route: 'chat', icon: 'chat-question' },
    { label: 'Explore places', route: 'places', icon: 'map-marker' },
  ] as const;

  return (
    <Screen scroll contentStyle={styles.content}>
      <Surface style={styles.headerCard} elevation={1}>
        <Text variant="headlineSmall" style={styles.name}>
          {activeTrip.name}
        </Text>
        <Text variant="bodyMedium" style={styles.dates}>
          {formatTripDate(activeTrip.start_date, activeTrip.home_timezone)} –{' '}
          {formatTripDate(activeTrip.end_date, activeTrip.home_timezone)}
        </Text>
        <View style={styles.chips}>
          <Chip icon="currency-usd" compact>
            {activeTrip.base_currency}
          </Chip>
          <Chip icon="clock-outline" compact>
            {activeTrip.home_timezone}
          </Chip>
        </View>
      </Surface>

      <View style={styles.stats}>
        <Surface style={styles.stat} elevation={1}>
          <Text variant="displaySmall" style={styles.statValue}>
            {bookingCount}
          </Text>
          <Text variant="labelLarge" style={styles.statLabel}>
            Bookings
          </Text>
        </Surface>
        <Surface style={styles.stat} elevation={1}>
          <Text variant="displaySmall" style={styles.statValue}>
            {itineraryCount}
          </Text>
          <Text variant="labelLarge" style={styles.statLabel}>
            Plan items
          </Text>
        </Surface>
      </View>

      <Text variant="titleMedium" style={styles.section}>
        Suggested next steps
      </Text>
      {nextActions.map((action) => (
        <PrimaryButton
          key={action.route}
          label={action.label}
          onPress={() => router.push(`/trips/${tripId}/${action.route}`)}
          variant="secondary"
          icon={action.icon}
        />
      ))}

      {demoMode ? (
        <Card mode="outlined" style={styles.demoNote}>
          <Card.Content>
            <Text variant="bodySmall" style={styles.demoText}>
              Demo mode — synthetic Buenos Aires + Bariloche data. Preferences:{' '}
              {DEMO_PREFERENCES.pace} pace, {DEMO_PREFERENCES.budget_level} budget.
            </Text>
          </Card.Content>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  headerCard: {
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  name: {
    color: colors.text,
    fontWeight: '700',
  },
  dates: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  statValue: {
    color: colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    color: colors.text,
    marginTop: spacing.sm,
  },
  demoNote: {
    borderColor: colors.extracted,
    backgroundColor: colors.surfaceElevated,
  },
  demoText: {
    color: colors.extracted,
    lineHeight: 20,
  },
});
