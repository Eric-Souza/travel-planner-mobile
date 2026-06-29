import { StyleSheet, Text, View } from 'react-native';
import { Card, StatusBadge } from '@/src/components/Card';
import type { Booking, ItineraryItem } from '@/src/types/api';
import { formatBookingTime } from '@/src/utils/dates';
import { colors, spacing, typography } from '@/src/theme';

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
        <Text style={styles.type}>{booking.type.toUpperCase()}</Text>
        <StatusBadge status={status} />
      </View>
      <Text style={styles.title}>{booking.title}</Text>
      {booking.provider ? <Text style={styles.meta}>{booking.provider}</Text> : null}
      <Text style={styles.meta}>
        {formatBookingTime(booking.start_at, booking.timezone || timezone)}
      </Text>
      {booking.confirmation_code ? (
        <Text style={styles.code}>Ref: {booking.confirmation_code}</Text>
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
        <Text style={styles.type}>ITINERARY</Text>
        <StatusBadge status={status} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      {item.start_time ? (
        <Text style={styles.meta}>
          {item.start_time}
          {item.end_time ? ` – ${item.end_time}` : ''}
        </Text>
      ) : null}
      {item.weather_note ? <Text style={styles.weather}>{item.weather_note}</Text> : null}
      {item.warnings?.map((w) => (
        <Text key={w} style={styles.warning}>
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
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  title: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  code: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  weather: {
    ...typography.caption,
    color: colors.suggested,
    marginTop: spacing.xs,
  },
  warning: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.xs,
  },
});
