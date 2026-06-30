import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Card, Divider, List, Surface, Text } from 'react-native-paper';
import { getApiBaseUrl, getApiRootUrl } from '@/src/api/client';
import { PrimaryButton } from '@/src/components/Card';
import { Screen } from '@/src/components/Screen';
import { ErrorState, LoadingState } from '@/src/components/StateViews';
import { useHealth } from '@/src/hooks/useHealth';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing } from '@/src/theme';

export default function HomeScreen() {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealth();
  const healthy = !isLoading && !isFetching && !isError;

  return (
    <Screen
      title="Travel Planner AI"
      subtitle="Your local-first travel organizer with grounded AI assistance"
    >
      <Surface style={styles.hero} elevation={1}>
        <Text variant="titleLarge" style={styles.heroTitle}>
          Plan smarter trips
        </Text>
        <Text variant="bodyMedium" style={styles.heroBody}>
          Upload bookings, build timelines, chat with citations, and review AI suggestions —
          all synced with your backend.
        </Text>
      </Surface>

      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Connection
          </Text>
          <List.Item
            title="API root"
            description={getApiRootUrl()}
            left={(props) => <List.Icon {...props} icon="server-network" />}
            descriptionNumberOfLines={2}
            descriptionStyle={styles.mono}
          />
          <Divider />
          <List.Item
            title="API base (/v1)"
            description={getApiBaseUrl()}
            left={(props) => <List.Icon {...props} icon="api" />}
            descriptionNumberOfLines={2}
            descriptionStyle={styles.mono}
          />
        </Card.Content>
      </Card>

      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Backend health
          </Text>
          {isLoading || isFetching ? (
            <LoadingState message="Checking backend…" />
          ) : isError ? (
            <ErrorState
              message={getNetworkErrorMessage(error)}
              onRetry={() => void refetch()}
            />
          ) : (
            <View style={styles.healthRow}>
              <List.Icon
                icon={healthy ? 'check-circle' : 'alert-circle'}
                color={healthy ? colors.success : colors.warning}
              />
              <View style={styles.healthText}>
                <Text variant="titleMedium" style={{ color: healthy ? colors.success : colors.warning }}>
                  {data?.status ?? 'ok'}
                </Text>
                {data?.app_env ? (
                  <Text variant="bodySmall" style={styles.meta}>
                    Environment: {data.app_env}
                  </Text>
                ) : null}
                {data?.database ? (
                  <Text variant="bodySmall" style={styles.meta}>
                    Database: {data.database}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      <PrimaryButton
        label="View trips"
        onPress={() => router.push('/trips')}
        icon="airplane"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.heroGradient,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  heroBody: {
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sectionLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  mono: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  healthText: {
    flex: 1,
    gap: 2,
  },
  meta: {
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
});
