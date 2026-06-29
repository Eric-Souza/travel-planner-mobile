import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { PrimaryButton } from '@/src/components/Card';
import { ErrorState, LoadingState, OfflineBanner } from '@/src/components/StateViews';
import { DEMO_PREFERENCES } from '@/src/features/demo/demoData';
import { usePreferences, useUpdatePreferences } from '@/src/hooks/usePreferences';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useUiStore } from '@/src/store/uiStore';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing, typography } from '@/src/theme';

const prefsSchema = z.object({
  budget_level: z.enum(['budget', 'moderate', 'luxury']),
  pace: z.enum(['relaxed', 'moderate', 'packed']),
  interests: z.string(),
  food_preferences: z.string(),
  max_walking_minutes: z.number().min(5).max(120),
  notes: z.string().optional(),
});

type PrefsForm = z.infer<typeof prefsSchema>;

export default function PreferencesScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const demoMode = useUiStore((s) => s.demoMode);
  const { isOnline } = useNetworkStatus();
  const { data, isLoading, isError, error, refetch } = usePreferences(tripId);
  const updatePrefs = useUpdatePreferences(tripId);

  const prefs = demoMode ? DEMO_PREFERENCES : data;

  const { control, handleSubmit } = useForm<PrefsForm>({
    resolver: zodResolver(prefsSchema),
    values: prefs
      ? {
          budget_level: prefs.budget_level,
          pace: prefs.pace,
          interests: prefs.interests.join(', '),
          food_preferences: prefs.food_preferences.join(', '),
          max_walking_minutes: prefs.max_walking_minutes,
          notes: prefs.notes ?? '',
        }
      : undefined,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updatePrefs.mutateAsync({
        budget_level: values.budget_level,
        pace: values.pace,
        interests: values.interests.split(',').map((s: string) => s.trim()).filter(Boolean),
        food_preferences: values.food_preferences.split(',').map((s: string) => s.trim()).filter(Boolean),
        max_walking_minutes: values.max_walking_minutes,
        notes: values.notes,
      });
      Alert.alert('Saved', 'Preferences updated. These shape itinerary suggestions.');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  });

  if (!demoMode && isLoading) return <LoadingState />;
  if (!demoMode && isError) {
    return (
      <ErrorState message={getNetworkErrorMessage(error)} onRetry={() => void refetch()} />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!isOnline ? <OfflineBanner /> : null}
      <Text style={styles.help}>
        These preferences influence AI itinerary proposals. They do not override confirmed
        bookings.
      </Text>

      {(['budget_level', 'pace', 'interests', 'food_preferences', 'max_walking_minutes', 'notes'] as const).map(
        (field) => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>
              {field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Text>
            <Controller
              control={control}
              name={field}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={String(value ?? '')}
                  onChangeText={(text) =>
                    onChange(
                      field === 'max_walking_minutes' ? Number(text) || 0 : text,
                    )
                  }
                  editable={!demoMode && isOnline}
                  multiline={field === 'notes'}
                />
              )}
            />
          </View>
        ),
      )}

      {!demoMode ? (
        <PrimaryButton
          label={updatePrefs.isPending ? 'Saving…' : 'Save preferences'}
          onPress={() => void onSubmit()}
          disabled={!isOnline || updatePrefs.isPending}
        />
      ) : (
        <Text style={styles.demo}>Demo mode — preferences shown read-only.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md },
  help: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  field: { gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm + 4,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.text,
  },
  demo: { ...typography.caption, color: colors.extracted },
});
