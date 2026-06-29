import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';
import { PrimaryButton } from '@/src/components/Card';
import { useCreateTrip } from '@/src/hooks/useTrips';
import { colors, spacing, typography } from '@/src/theme';

const tripSchema = z
  .object({
    name: z.string().min(1, 'Trip name is required'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    base_currency: z.string().length(3, 'Use a 3-letter currency code'),
    home_timezone: z.string().min(1, 'Timezone is required'),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });

type TripForm = z.infer<typeof tripSchema>;

export default function CreateTripScreen() {
  const createTrip = useCreateTrip();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      base_currency: 'USD',
      home_timezone: 'America/New_York',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const trip = await createTrip.mutateAsync(values);
      router.replace(`/trips/${trip.id}`);
    } catch (e) {
      Alert.alert('Could not create trip', (e as Error).message);
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>New trip</Text>

      {(['name', 'start_date', 'end_date', 'base_currency', 'home_timezone'] as const).map(
        (field) => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>
              {field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Text>
            <Controller
              control={control}
              name={field}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={
                    field.includes('date')
                      ? 'YYYY-MM-DD'
                      : field === 'home_timezone'
                        ? 'America/New_York'
                        : undefined
                  }
                  autoCapitalize={field === 'name' ? 'words' : 'none'}
                />
              )}
            />
            {errors[field] ? (
              <Text style={styles.error}>{errors[field]?.message}</Text>
            ) : null}
          </View>
        ),
      )}

      <PrimaryButton
        label={createTrip.isPending ? 'Creating…' : 'Create trip'}
        onPress={() => void onSubmit()}
        disabled={createTrip.isPending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    ...typography.title,
    color: colors.text,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm + 4,
    backgroundColor: colors.surface,
    ...typography.body,
    color: colors.text,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
});
