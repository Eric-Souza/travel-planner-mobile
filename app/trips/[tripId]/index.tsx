import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/src/components/Card';
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
import { colors, spacing, typography } from '@/src/theme';

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
    bookingCount === 0
      ? { label: 'Upload a reservation', route: 'documents' as const }
      : { label: 'View timeline', route: 'timeline' as const },
    { label: 'Set preferences', route: 'preferences' as const },
    { label: 'Ask a question', route: 'chat' as const },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{activeTrip.name}</Text>
      <Text style={styles.dates}>
        {formatTripDate(activeTrip.start_date, activeTrip.home_timezone)} –{' '}
        {formatTripDate(activeTrip.end_date, activeTrip.home_timezone)}
      </Text>
      <Text style={styles.meta}>
        {activeTrip.base_currency} · {activeTrip.home_timezone}
      </Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{bookingCount}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{itineraryCount}</Text>
          <Text style={styles.statLabel}>Plan items</Text>
        </View>
      </View>

      <Text style={styles.section}>Suggested next steps</Text>
      {nextActions.map((action) => (
        <PrimaryButton
          key={action.route}
          label={action.label}
          onPress={() => router.push(`/trips/${tripId}/${action.route}`)}
          variant="secondary"
        />
      ))}

      {demoMode ? (
        <Text style={styles.demoNote}>
          Demo mode — showing synthetic Buenos Aires + Bariloche data. Preferences:{' '}
          {DEMO_PREFERENCES.pace} pace, {DEMO_PREFERENCES.budget_level} budget.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  name: {
    ...typography.title,
    color: colors.text,
  },
  dates: {
    ...typography.body,
    color: colors.textSecondary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.title,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    ...typography.subtitle,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  demoNote: {
    ...typography.caption,
    color: colors.extracted,
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});
