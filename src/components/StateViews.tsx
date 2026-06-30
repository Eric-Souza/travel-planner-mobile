import { StyleSheet, View, type ViewStyle } from 'react-native';
import { ActivityIndicator, Banner, Button, Text } from 'react-native-paper';
import { colors, spacing } from '@/src/theme';

type LoadingStateProps = {
  message?: string;
  style?: ViewStyle;
};

export function LoadingState({ message = 'Loading…', style }: LoadingStateProps) {
  return (
    <View style={[styles.centered, style]} accessibilityRole="progressbar">
      <ActivityIndicator size="large" animating />
      <Text variant="bodyLarge" style={styles.muted}>
        {message}
      </Text>
    </View>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.centered, style]}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodyMedium" style={styles.muted}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button mode="contained" onPress={onAction} style={styles.action}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
};

export function ErrorState({ message, onRetry, style }: ErrorStateProps) {
  return (
    <View style={[styles.centered, style]}>
      <Text variant="titleMedium" style={styles.errorTitle}>
        Something went wrong
      </Text>
      <Text variant="bodyMedium" style={styles.muted}>
        {message}
      </Text>
      {onRetry ? (
        <Button mode="contained" onPress={onRetry} style={styles.action} icon="refresh">
          Retry
        </Button>
      ) : null}
    </View>
  );
}

type OfflineBannerProps = {
  syncedAt?: string;
};

export function OfflineBanner({ syncedAt }: OfflineBannerProps) {
  return (
    <Banner
      visible
      icon="wifi-off"
      style={styles.offlineBanner}
      accessibilityLabel="Offline mode"
    >
      Offline — showing last synced data
      {syncedAt ? ` (${new Date(syncedAt).toLocaleString()})` : ''}
    </Banner>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.error,
    textAlign: 'center',
  },
  muted: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
  },
  offlineBanner: {
    backgroundColor: colors.offline,
  },
});
