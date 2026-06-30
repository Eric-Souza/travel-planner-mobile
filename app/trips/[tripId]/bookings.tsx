import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';
import { z } from 'zod';
import { PrimaryButton } from '@/src/components/Card';
import { FormDateTimeField } from '@/src/components/FormDateField';
import { FormField } from '@/src/components/FormField';
import { FormSelect } from '@/src/components/FormSelect';
import { Screen } from '@/src/components/Screen';
import { EmptyState, ErrorState, LoadingState, OfflineBanner } from '@/src/components/StateViews';
import { BOOKING_TYPES, TIMEZONES } from '@/src/constants/formOptions';
import { DEMO_BOOKINGS, DEMO_TRIP } from '@/src/features/demo/demoData';
import { BookingCard } from '@/src/features/timeline/TimelineCards';
import { useBookings, useCreateBooking } from '@/src/hooks/useBookings';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useTrip } from '@/src/hooks/useTrips';
import { useUiStore } from '@/src/store/uiStore';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing } from '@/src/theme';

const bookingSchema = z.object({
  type: z.enum(['flight', 'hotel', 'train', 'bus', 'activity', 'restaurant', 'custom']),
  title: z.string().min(1, 'Title is required'),
  provider: z.string().optional(),
  confirmation_code: z.string().optional(),
  start_at: z.string().min(1, 'Start date & time required'),
  end_at: z.string().min(1, 'End date & time required'),
  timezone: z.string().min(1, 'Select a timezone'),
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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      type: 'hotel',
      title: '',
      timezone: activeTrip?.home_timezone ?? 'UTC',
      start_at: '',
      end_at: '',
    },
  });

  const closeForm = () => {
    setShowForm(false);
    reset();
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createBooking.mutateAsync(values);
      closeForm();
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
    <Screen contentStyle={styles.container}>
      {!isOnline ? <OfflineBanner /> : null}

      {!demoMode ? (
        <PrimaryButton
          label="Add manual booking"
          onPress={() => setShowForm(true)}
          disabled={!isOnline}
          icon="plus"
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
              <Text variant="bodySmall" style={styles.excerpt} numberOfLines={2}>
                Source: {item.source_excerpt}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Portal>
        <Modal
          visible={showForm}
          onDismiss={closeForm}
          contentContainerStyle={styles.modal}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text variant="titleLarge" style={styles.formTitle}>
              Manual booking
            </Text>

          <FormSelect
            control={control}
            name="type"
            label="Booking type"
            options={BOOKING_TYPES}
            error={errors.type?.message}
          />
          <FormField
            control={control}
            name="title"
            label="Title"
            error={errors.title?.message}
          />
          <FormField
            control={control}
            name="provider"
            label="Provider (optional)"
          />
          <FormField
            control={control}
            name="confirmation_code"
            label="Confirmation code (optional)"
            autoCapitalize="characters"
          />
          <FormDateTimeField
            control={control}
            name="start_at"
            label="Starts"
            error={errors.start_at?.message}
          />
          <FormDateTimeField
            control={control}
            name="end_at"
            label="Ends"
            error={errors.end_at?.message}
          />
          <FormSelect
            control={control}
            name="timezone"
            label="Timezone"
            options={TIMEZONES}
            searchable
            error={errors.timezone?.message}
          />

          <PrimaryButton
            label="Save booking"
            onPress={() => void onSubmit()}
            loading={createBooking.isPending}
            icon="content-save"
          />
          <PrimaryButton label="Cancel" onPress={closeForm} variant="secondary" />
          </ScrollView>
        </Modal>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  list: { marginTop: spacing.md },
  excerpt: {
    color: colors.textSecondary,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  modal: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    maxHeight: '90%',
  },
  formTitle: {
    color: colors.text,
    marginBottom: spacing.md,
    fontWeight: '700',
  },
});
