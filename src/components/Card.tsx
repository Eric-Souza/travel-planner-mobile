import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/src/theme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({ children, style, onPress, accessibilityLabel }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        style={[styles.card, style]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

type StatusBadgeProps = {
  status: 'confirmed' | 'extracted' | 'suggested' | 'conflict' | 'rejected' | 'failed';
};

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: colors.confirmed, bg: '#D1FAE5' },
  extracted: { label: 'AI extracted', color: colors.extracted, bg: '#EDE9FE' },
  suggested: { label: 'Suggested', color: colors.suggested, bg: '#DBEAFE' },
  conflict: { label: 'Conflict', color: colors.conflict, bg: '#FEE2E2' },
  rejected: { label: 'Rejected', color: colors.textSecondary, bg: colors.border },
  failed: { label: 'Failed', color: colors.error, bg: '#FEE2E2' },
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]} accessibilityLabel={config.label}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
}: PrimaryButtonProps) {
  const bg =
    variant === 'danger' ? colors.error : variant === 'secondary' ? colors.border : colors.primary;
  const textColor = variant === 'secondary' ? colors.text : '#fff';

  return (
    <Pressable
      style={[styles.button, { backgroundColor: bg }, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  button: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.label,
  },
  disabled: {
    opacity: 0.5,
  },
});
