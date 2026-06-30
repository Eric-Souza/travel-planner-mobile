import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Card, StatusBadge } from '@/src/components/Card';
import type { Booking, ItineraryItem } from '@/src/types/api';
import { formatBookingTime } from '@/src/utils/dates';
import { colors, spacing } from '@/src/theme';

type BookingCardProps = {
  booking: Booking;
  timezone: string;
  onPress?: () => void;
};

export function BookingCard({ booking, timezone, onPress }: BookingCardProps) {
  const status =
    booking.status === 'extracted'
      ? 'extracted'
      : booking.status === 'conflict'
        ? 'conflict'
        : booking.status === 'rejected'
          ? 'rejected'
          : 'confirmed';

  return (
    <Card onPress={onPress} accessibilityLabel={`Booking: ${booking.title}`}>
      <View style={styles.header}>
        <Text variant="labelSmall" style={styles.type}>
          {booking.type.toUpperCase()}
        </Text>
        <StatusBadge status={status} />
      </View>
      <Text variant="titleSmall" style={styles.title}>
        {booking.title}
      </Text>
      {booking.provider ? (
        <Text variant="bodySmall" style={styles.meta}>
          {booking.provider}
        </Text>
      ) : null}
      <Text variant="bodySmall" style={styles.meta}>
        {formatBookingTime(booking.start_at, booking.timezone || timezone)}
      </Text>
      {booking.confirmation_code ? (
        <Text variant="bodySmall" style={styles.code}>
          Ref: {booking.confirmation_code}
        </Text>
      ) : null}
    </Card>
  );
}

type ItineraryItemCardProps = {
  item: ItineraryItem;
  onPress?: () => void;
};

export function ItineraryItemCard({ item, onPress }: ItineraryItemCardProps) {
  const status = item.status === 'locked' ? 'confirmed' : item.status;
  return (
    <Card onPress={onPress} accessibilityLabel={`Itinerary item: ${item.title}`}>
      <View style={styles.header}>
        <Text variant="labelSmall" style={styles.type}>
          ITINERARY
        </Text>
        <StatusBadge status={status} />
      </View>
      <Text variant="titleSmall" style={styles.title}>
        {item.title}
      </Text>
      {item.start_time ? (
        <Text variant="bodySmall" style={styles.meta}>
          {item.start_time}
          {item.end_time ? ` – ${item.end_time}` : ''}
        </Text>
      ) : null}
      {item.weather_note ? (
        <Text variant="bodySmall" style={styles.weather}>
          {item.weather_note}
        </Text>
      ) : null}
      {item.warnings?.map((w) => (
        <Text key={w} variant="bodySmall" style={styles.warning}>
          ⚠ {w}
        </Text>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  type: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    marginBottom: spacing.xs,
  },
  meta: {
    color: colors.textSecondary,
  },
  code: {
    color: colors.primary,
    marginTop: spacing.xs,
  },
  weather: {
    color: colors.suggested,
    marginTop: spacing.xs,
  },
  warning: {
    color: colors.warning,
    marginTop: spacing.xs,
  },
});
