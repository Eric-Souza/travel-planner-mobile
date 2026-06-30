import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { layout } from '@/src/theme/paperTheme';
import { colors, spacing } from '@/src/theme';

type ScreenProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export function Screen({
  children,
  title,
  subtitle,
  scroll = false,
  style,
  contentStyle,
}: ScreenProps) {
  const header =
    title || subtitle ? (
      <View style={styles.header}>
        {title ? (
          <Text variant="headlineSmall" style={styles.title}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="bodyMedium" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    ) : null;

  if (scroll) {
    return (
      <ScrollView
        style={[styles.screen, style]}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {header}
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.screen, styles.content, style, contentStyle]}>
      {header}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: layout.screenPadding,
    gap: spacing.sm,
  },
  scrollContent: {
    padding: layout.screenPadding,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
  },
});
