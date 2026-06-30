import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Button, Card as PaperCard, Chip, type ButtonProps } from 'react-native-paper';
import { spacing } from '@/src/theme';
import { colors } from '@/src/theme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({ children, style, onPress, accessibilityLabel }: CardProps) {
  if (onPress) {
    return (
      <PaperCard
        mode="elevated"
        style={[styles.card, style]}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
      >
        <PaperCard.Content style={styles.content}>{children}</PaperCard.Content>
      </PaperCard>
    );
  }

  return (
    <PaperCard mode="elevated" style={[styles.card, style]}>
      <PaperCard.Content style={styles.content}>{children}</PaperCard.Content>
    </PaperCard>
  );
}

type StatusBadgeProps = {
  status: 'confirmed' | 'extracted' | 'suggested' | 'conflict' | 'rejected' | 'failed';
};

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: colors.confirmed },
  extracted: { label: 'AI extracted', color: colors.extracted },
  suggested: { label: 'Suggested', color: colors.suggested },
  conflict: { label: 'Conflict', color: colors.conflict },
  rejected: { label: 'Rejected', color: colors.textSecondary },
  failed: { label: 'Failed', color: colors.error },
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Chip
      compact
      mode="flat"
      textStyle={[styles.chipText, { color: config.color }]}
      style={[styles.chip, { backgroundColor: `${config.color}33` }]}
      accessibilityLabel={config.label}
    >
      {config.label}
    </Chip>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: ButtonProps['icon'];
  loading?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
  icon,
  loading,
  style,
}: PrimaryButtonProps) {
  const mode: ButtonProps['mode'] =
    variant === 'secondary' ? 'outlined' : variant === 'danger' ? 'contained' : 'contained';

  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      icon={icon}
      buttonColor={variant === 'danger' ? colors.error : undefined}
      textColor={variant === 'secondary' ? colors.primary : undefined}
      style={[styles.button, style]}
      contentStyle={styles.buttonContent}
      accessibilityLabel={label}
    >
      {label}
    </Button>
  );
}

export function ButtonRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.buttonRow, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  content: {
    paddingVertical: spacing.sm,
  },
  chip: {
    alignSelf: 'flex-start',
    height: 26,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 0,
  },
  button: {
    borderRadius: 10,
    marginTop: spacing.xs,
  },
  buttonContent: {
    paddingVertical: 4,
  },
  buttonRow: {
    gap: spacing.sm,
  },
});
