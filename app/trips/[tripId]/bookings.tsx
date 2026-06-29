import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';
import { PrimaryButton, StatusBadge } from '@/src/components/Card';
import { EmptyState, ErrorState, LoadingState, OfflineBanner } from '@/src/components/StateViews';
import { DEMO_BOOKINGS, DEMO_TRIP } from '@/src/features/demo/demoData';
import { BookingCard } from '@/src/features/timeline/TimelineCards';
import { useBookings, useCreateBooking } from '@/src/hooks/useBookings';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useTrip } from '@/src/hooks/useTrips';
import { useUiStore } from '@/src/store/uiStore';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing, typography } from '@/src/theme';

const bookingSchema = z.object({
  type: z.enum(['flight', 'hotel', 'train', 'bus', 'activity', 'restaurant', 'custom']),
  title: z.string().min(1),
  provider: z.string().optional(),
  confirmation_code: z.string().optional(),
  start_at: z.string().min(1),
  end_at: z.string().min(1),
  timezone: z.string().min(1),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function BookingsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const demoMode = useUiStore((s) => s.demoMode);
  const { isOnline } = useNetworkStatus();
  const { data: trip } = useTrip(tripId);
  const { data, isLoading, isError, error, refetch } = useBookings(tripId);
  const createBooking = useCreateBooking(tripId);
  const [showForm, setShowForm] = useState(false);

  const activeTrip = demoMode ? DEMO_TRIP : trip;
  const bookings = demoMode ? DEMO_BOOKINGS : (data ?? []);

  const { control, handleSubmit, reset } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      type: 'hotel',
      title: '',
      timezone: activeTrip?.home_timezone ?? 'UTC',
      start_at: '',
      end_at: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createBooking.mutateAsync(values);
      reset();
      setShowForm(false);
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
    <View style={styles.container}>
      {!isOnline ? <OfflineBanner /> : null}

      {!demoMode ? (
        <PrimaryButton
          label="Add manual booking"
          onPress={() => setShowForm(true)}
          disabled={!isOnline}
        />
      ) : null}

      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        style={styles.list}
        ListEmptyComponent={
          <EmptyState title="No bookings" description="Add a booking or upload a reservation." />
        }
        renderItem={({ item }) => (
          <View>
            <BookingCard
              booking={item}
              timezone={activeTrip?.home_timezone ?? 'UTC'}
            />
            {item.source_excerpt ? (
              <Text style={styles.excerpt} numberOfLines={2}>
                Source: {item.source_excerpt}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Modal visible={showForm} animationType="slide">
        <ScrollView contentContainerStyle={styles.form}>
          <Text style={styles.formTitle}>Manual booking</Text>
          {(['type', 'title', 'provider', 'confirmation_code', 'start_at', 'end_at', 'timezone'] as const).map(
            (field) => (
              <View key={field} style={styles.field}>
                <Text style={styles.label}>{field.replace(/_/g, ' ')}</Text>
                <Controller
                  control={control}
                  name={field as keyof BookingForm}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      value={String(value ?? '')}
                      onChangeText={onChange}
                      placeholder={
                        field.includes('_at') ? 'ISO datetime' : undefined
                      }
                    />
                  )}
                />
              </View>
            ),
          )}
          <PrimaryButton label="Save booking" onPress={() => void onSubmit()} />
          <PrimaryButton
            label="Cancel"
            onPress={() => setShowForm(false)}
            variant="secondary"
          />
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  list: { marginTop: spacing.md },
  excerpt: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  form: { padding: spacing.lg, gap: spacing.sm },
  formTitle: { ...typography.title, color: colors.text },
  field: { gap: 4 },
  label: { ...typography.caption, color: colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
});
