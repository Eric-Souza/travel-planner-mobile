import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Card, List, Text } from 'react-native-paper';
import { Screen } from '@/src/components/Screen';
import { colors, spacing } from '@/src/theme';

const MORE_ITEMS = [
  {
    title: 'Bookings',
    description: 'View and add reservations manually',
    icon: 'ticket-confirmation',
    route: 'bookings',
  },
  {
    title: 'Preferences',
    description: 'Budget, pace, interests, and walking limits',
    icon: 'tune-variant',
    route: 'preferences',
  },
  {
    title: 'Itinerary',
    description: 'Generate and apply AI day plans',
    icon: 'map-clock',
    route: 'itinerary',
  },
  {
    title: 'Places',
    description: 'Search, save, and view on the map',
    icon: 'map-marker-radius',
    route: 'places',
  },
] as const;

export default function MoreScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  return (
    <Screen title="More" subtitle="Bookings, preferences, itinerary, and places">
      <Card mode="elevated" style={styles.card}>
        {MORE_ITEMS.map((item, index) => (
          <List.Item
            key={item.route}
            title={item.title}
            description={item.description}
            left={(props) => <List.Icon {...props} icon={item.icon} />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push(`/trips/${tripId}/${item.route}`)}
            style={index < MORE_ITEMS.length - 1 ? styles.item : undefined}
          />
        ))}
      </Card>

      <Text variant="bodySmall" style={styles.hint}>
        Tip: use Overview for quick actions and Chat for grounded questions about your trip.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  hint: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
  },
});
