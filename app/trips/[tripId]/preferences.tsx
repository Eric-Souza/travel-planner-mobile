import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { SegmentedButtons, Text } from 'react-native-paper';
import { z } from 'zod';
import { PrimaryButton } from '@/src/components/Card';
import { FormField } from '@/src/components/FormField';
import { Screen } from '@/src/components/Screen';
import { ErrorState, LoadingState, OfflineBanner } from '@/src/components/StateViews';
import { DEMO_PREFERENCES } from '@/src/features/demo/demoData';
import { usePreferences, useUpdatePreferences } from '@/src/hooks/usePreferences';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useUiStore } from '@/src/store/uiStore';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing } from '@/src/theme';

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
        food_preferences: values.food_preferences
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
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

  const disabled = demoMode || !isOnline;

  return (
    <Screen
      title="Trip preferences"
      subtitle="These influence AI itinerary proposals. They do not override confirmed bookings."
      scroll
    >
      {!isOnline ? <OfflineBanner /> : null}

      <Text variant="labelLarge" style={styles.fieldLabel}>
        Budget
      </Text>
      <Controller
        control={control}
        name="budget_level"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            buttons={[
              { value: 'budget', label: 'Budget', disabled },
              { value: 'moderate', label: 'Moderate', disabled },
              { value: 'luxury', label: 'Luxury', disabled },
            ]}
            style={styles.segmented}
          />
        )}
      />

      <Text variant="labelLarge" style={styles.fieldLabel}>
        Pace
      </Text>
      <Controller
        control={control}
        name="pace"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            buttons={[
              { value: 'relaxed', label: 'Relaxed', disabled },
              { value: 'moderate', label: 'Moderate', disabled },
              { value: 'packed', label: 'Packed', disabled },
            ]}
            style={styles.segmented}
          />
        )}
      />

      <FormField
        control={control}
        name="interests"
        label="Interests"
        placeholder="museums, food, hiking"
        disabled={disabled}
      />
      <FormField
        control={control}
        name="food_preferences"
        label="Food preferences"
        placeholder="vegetarian, local cuisine"
        disabled={disabled}
      />
      <Controller
        control={control}
        name="max_walking_minutes"
        render={({ field: { onChange, value } }) => (
          <View style={styles.sliderBlock}>
            <Text variant="labelLarge" style={styles.fieldLabel}>
              Max walking: {value} min
            </Text>
            <Slider
              value={value}
              onValueChange={(v) => onChange(Math.round(v / 5) * 5)}
              minimumValue={5}
              maximumValue={120}
              step={5}
              disabled={disabled}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </View>
        )}
      />
      <FormField
        control={control}
        name="notes"
        label="Notes"
        multiline
        numberOfLines={3}
        disabled={disabled}
      />

      {!demoMode ? (
        <PrimaryButton
          label={updatePrefs.isPending ? 'Saving…' : 'Save preferences'}
          onPress={() => void onSubmit()}
          disabled={!isOnline || updatePrefs.isPending}
          loading={updatePrefs.isPending}
          icon="content-save"
        />
      ) : (
        <Text variant="bodySmall" style={styles.demo}>
          Demo mode — preferences shown read-only.
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    color: colors.text,
    marginTop: spacing.sm,
  },
  segmented: {
    marginBottom: spacing.sm,
  },
  sliderBlock: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  demo: {
    color: colors.extracted,
    marginTop: spacing.md,
  },
});
