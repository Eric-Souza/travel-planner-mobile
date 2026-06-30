/** Dark-first design tokens — used across StyleSheets and Paper theme. */
export const colors = {
  primary: '#38BDF8',
  primaryDark: '#0EA5E9',
  background: '#0B1220',
  surface: '#151F32',
  surfaceElevated: '#1E293B',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  border: '#334155',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  extracted: '#A78BFA',
  suggested: '#60A5FA',
  confirmed: '#34D399',
  conflict: '#F87171',
  offline: '#64748B',
  onPrimary: '#0B1220',
  heroGradient: '#0C4A6E',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  title: { fontSize: 24, fontWeight: '700' as const },
  subtitle: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  label: { fontSize: 14, fontWeight: '600' as const },
} as const;
