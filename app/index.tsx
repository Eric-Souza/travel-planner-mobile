import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { getApiBaseUrl, getApiRootUrl } from '@/src/api/client';
import { PrimaryButton } from '@/src/components/Card';
import { ErrorState, LoadingState } from '@/src/components/StateViews';
import { useHealth } from '@/src/hooks/useHealth';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing, typography } from '@/src/theme';

export default function HomeScreen() {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealth();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Travel Planner AI</Text>
      <Text style={styles.subheading}>Local-first mobile travel organizer</Text>

      <View style={styles.card}>
        <Text style={styles.label}>API root</Text>
        <Text style={styles.value}>{getApiRootUrl()}</Text>
        <Text style={styles.label}>API base (/v1)</Text>
        <Text style={styles.value}>{getApiBaseUrl()}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Backend health</Text>
        {isLoading || isFetching ? (
          <LoadingState message="Checking backend…" />
        ) : isError ? (
          <ErrorState
            message={getNetworkErrorMessage(error)}
            onRetry={() => void refetch()}
          />
        ) : (
          <View>
            <Text style={styles.statusOk} accessibilityLabel="Backend is healthy">
              ● {data?.status ?? 'ok'}
            </Text>
            {data?.app_env ? (
              <Text style={styles.meta}>Environment: {data.app_env}</Text>
            ) : null}
            {data?.database ? (
              <Text style={styles.meta}>Database: {data.database}</Text>
            ) : null}
          </View>
        )}
      </View>

      <PrimaryButton
        label="View trips"
        onPress={() => router.push('/trips')}
        variant="primary"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    ...typography.title,
    color: colors.text,
  },
  subheading: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
    fontFamily: 'SpaceMono',
    fontSize: 13,
  },
  statusOk: {
    ...typography.subtitle,
    color: colors.success,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
