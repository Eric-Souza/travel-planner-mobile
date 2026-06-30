import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { Banner, Text } from 'react-native-paper';
import { PrimaryButton, StatusBadge } from '@/src/components/Card';
import { FormDateTimeField } from '@/src/components/FormDateField';
import { FormField } from '@/src/components/FormField';
import { FormSelect } from '@/src/components/FormSelect';
import { Screen } from '@/src/components/Screen';
import { ErrorState, LoadingState } from '@/src/components/StateViews';
import { TIMEZONES } from '@/src/constants/formOptions';
import { DEMO_BOOKINGS } from '@/src/features/demo/demoData';
import {
  useBookingCandidate,
  useConfirmBooking,
  useRejectBooking,
  useUpdateBooking,
} from '@/src/hooks/useBookings';
import { useUiStore } from '@/src/store/uiStore';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing } from '@/src/theme';

type ReviewForm = {
  title: string;
  provider: string;
  confirmation_code: string;
  start_at: string;
  end_at: string;
  timezone: string;
};

export default function BookingReviewScreen() {
  const { tripId, documentId } = useLocalSearchParams<{
    tripId: string;
    documentId: string;
  }>();
  const demoMode = useUiStore((s) => s.demoMode);
  const isDemoDoc = documentId === 'demo-doc-1';
  const readOnly = demoMode || isDemoDoc;

  const { data, isLoading, isError, error } = useBookingCandidate(
    demoMode || isDemoDoc ? null : documentId,
  );
  const confirm = useConfirmBooking(tripId);
  const reject = useRejectBooking(tripId);
  const update = useUpdateBooking(tripId);

  const candidate = demoMode || isDemoDoc
    ? { booking: DEMO_BOOKINGS[0], source_document_title: 'Hotel Reservation.pdf' }
    : data;

  const { control, reset, handleSubmit } = useForm<ReviewForm>();

  useEffect(() => {
    if (candidate?.booking) {
      reset({
        title: candidate.booking.title,
        provider: candidate.booking.provider ?? '',
        confirmation_code: candidate.booking.confirmation_code ?? '',
        start_at: candidate.booking.start_at,
        end_at: candidate.booking.end_at,
        timezone: candidate.booking.timezone,
      });
    }
  }, [candidate, reset]);

  if (!demoMode && !isDemoDoc && isLoading) return <LoadingState />;
  if (!demoMode && !isDemoDoc && isError) {
    return <ErrorState message={getNetworkErrorMessage(error)} />;
  }
  if (!candidate) return <ErrorState message="No booking candidate found." />;

  const { booking, source_document_title, is_duplicate } = candidate;
  const reviewStatus = booking.status === 'conflict' ? 'conflict' : 'extracted';

  const onConfirm = handleSubmit(async (values) => {
    if (readOnly) {
      Alert.alert('Demo mode', 'Connect to the API to confirm extractions.');
      return;
    }
    try {
      await update.mutateAsync({ bookingId: booking.id, input: values });
      await confirm.mutateAsync(booking.id);
      Alert.alert('Confirmed', 'Booking added to your trip.');
      router.replace(`/trips/${tripId}/timeline`);
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  });

  const onReject = async () => {
    if (readOnly) {
      router.back();
      return;
    }
    try {
      await reject.mutateAsync(booking.id);
      router.back();
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    }
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Review extraction
        </Text>
        <StatusBadge status={reviewStatus} />
      </View>

      <Banner visible icon="robot" style={styles.bannerExtracted}>
        AI extracted — review and confirm before this becomes a confirmed booking.
      </Banner>

      {is_duplicate ? (
        <Banner visible icon="alert" style={styles.bannerDuplicate}>
          Possible duplicate — review carefully before confirming.
        </Banner>
      ) : null}

      {source_document_title ? (
        <Text variant="bodySmall" style={styles.meta}>
          Source: {source_document_title}
        </Text>
      ) : null}
      {booking.source_excerpt ? (
        <Text variant="bodyMedium" style={styles.excerpt}>
          &quot;{booking.source_excerpt}&quot;
        </Text>
      ) : null}
      {booking.confidence != null ? (
        <Text variant="bodySmall" style={styles.meta}>
          Confidence: {Math.round(booking.confidence * 100)}%
        </Text>
      ) : null}
      {booking.uncertainty_notes?.map((note) => (
        <Text key={note} variant="bodySmall" style={styles.uncertainty}>
          ? {note}
        </Text>
      ))}

      <FormField control={control} name="title" label="Title" disabled={readOnly} />
      <FormField control={control} name="provider" label="Provider" disabled={readOnly} />
      <FormField
        control={control}
        name="confirmation_code"
        label="Confirmation code"
        disabled={readOnly}
        autoCapitalize="characters"
      />
      <FormDateTimeField
        control={control}
        name="start_at"
        label="Starts"
        disabled={readOnly}
      />
      <FormDateTimeField
        control={control}
        name="end_at"
        label="Ends"
        disabled={readOnly}
      />
      <FormSelect
        control={control}
        name="timezone"
        label="Timezone"
        options={TIMEZONES}
        searchable
        disabled={readOnly}
      />

      <PrimaryButton
        label="Confirm booking"
        onPress={() => void onConfirm()}
        disabled={confirm.isPending}
        loading={confirm.isPending}
        icon="check-circle"
      />
      <PrimaryButton
        label="Reject"
        onPress={() => void onReject()}
        variant="danger"
        icon="close-circle"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: { color: colors.text, fontWeight: '700' },
  bannerExtracted: {
    backgroundColor: '#312E81',
    marginBottom: spacing.sm,
  },
  bannerDuplicate: {
    backgroundColor: '#7F1D1D',
    marginBottom: spacing.sm,
  },
  meta: { color: colors.textSecondary },
  excerpt: {
    color: colors.text,
    fontStyle: 'italic',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.sm,
    borderRadius: 8,
    marginVertical: spacing.xs,
  },
  uncertainty: { color: colors.warning, marginTop: spacing.xs },
});
