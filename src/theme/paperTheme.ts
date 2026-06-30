import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { colors, spacing } from './tokens';

const fontConfig = configureFonts({
  config: {
    fontFamily: 'System',
  },
});

export const paperTheme: MD3Theme = {
  ...MD3DarkTheme,
  dark: true,
  roundness: 12,
  fonts: fontConfig,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primaryContainer: '#0C4A6E',
    onPrimaryContainer: '#BAE6FD',
    secondary: colors.suggested,
    onSecondary: colors.onPrimary,
    secondaryContainer: '#1E3A5F',
    onSecondaryContainer: '#BFDBFE',
    tertiary: colors.extracted,
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#312E81',
    onTertiaryContainer: '#DDD6FE',
    error: colors.error,
    onError: '#450A0A',
    errorContainer: '#7F1D1D',
    onErrorContainer: '#FECACA',
    background: colors.background,
    onBackground: colors.text,
    surface: colors.surface,
    onSurface: colors.text,
    surfaceVariant: colors.surfaceElevated,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    outlineVariant: '#475569',
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surfaceElevated,
      level3: colors.surfaceElevated,
      level4: '#243044',
      level5: '#2D3B52',
    },
  },
};

export const layout = {
  screenPadding: spacing.lg,
  cardGap: spacing.sm,
  sectionGap: spacing.md,
} as const;
