import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '@/src/theme';

type LoadingStateProps = {
  message?: string;
  style?: ViewStyle;
};

export function LoadingState({ message = 'Loading…', style }: LoadingStateProps) {
  return (
    <View style={[styles.centered, style]} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
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
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          style={styles.button}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
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
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.description}>{message}</Text>
      {onRetry ? (
        <Pressable
          style={styles.button}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type OfflineBannerProps = {
  syncedAt?: string;
};

export function OfflineBanner({ syncedAt }: OfflineBannerProps) {
  return (
    <View style={styles.offlineBanner} accessibilityLiveRegion="polite">
      <Text style={styles.offlineText}>
        Offline — showing last synced data
        {syncedAt ? ` (${new Date(syncedAt).toLocaleString()})` : ''}
      </Text>
    </View>
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
    ...typography.subtitle,
    color: colors.text,
    textAlign: 'center',
  },
  errorTitle: {
    ...typography.subtitle,
    color: colors.error,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    ...typography.label,
  },
  offlineBanner: {
    backgroundColor: colors.offline,
    padding: spacing.sm,
  },
  offlineText: {
    color: '#fff',
    ...typography.caption,
    textAlign: 'center',
  },
});
