import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton, StatusBadge } from '@/src/components/Card';
import { ErrorState, LoadingState } from '@/src/components/StateViews';
import { DEMO_BOOKINGS } from '@/src/features/demo/demoData';
import {
  useBookingCandidate,
  useConfirmBooking,
  useRejectBooking,
  useUpdateBooking,
} from '@/src/hooks/useBookings';
import { useUiStore } from '@/src/store/uiStore';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing, typography } from '@/src/theme';

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
    if (demoMode || isDemoDoc) {
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
    if (demoMode || isDemoDoc) {
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Review extraction</Text>
        <StatusBadge status={reviewStatus} />
      </View>

      <Text style={styles.warning}>
        AI extracted — review and confirm before this becomes a confirmed booking.
      </Text>

      {is_duplicate ? (
        <Text style={styles.duplicate}>
          Possible duplicate — review carefully before confirming.
        </Text>
      ) : null}

      {source_document_title ? (
        <Text style={styles.source}>Source: {source_document_title}</Text>
      ) : null}
      {booking.source_excerpt ? (
        <Text style={styles.excerpt}>"{booking.source_excerpt}"</Text>
      ) : null}
      {booking.confidence != null ? (
        <Text style={styles.meta}>
          Confidence: {Math.round(booking.confidence * 100)}%
        </Text>
      ) : null}
      {booking.uncertainty_notes?.map((note) => (
        <Text key={note} style={styles.uncertainty}>
          ? {note}
        </Text>
      ))}

      {(['title', 'provider', 'confirmation_code', 'start_at', 'end_at', 'timezone'] as const).map(
        (field) => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{field.replace(/_/g, ' ')}</Text>
            <Controller
              control={control}
              name={field}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  editable={!demoMode && !isDemoDoc}
                />
              )}
            />
          </View>
        ),
      )}

      <PrimaryButton
        label="Confirm booking"
        onPress={() => void onConfirm()}
        disabled={confirm.isPending}
      />
      <PrimaryButton
        label="Reject"
        onPress={() => void onReject()}
        variant="danger"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.sm },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...typography.title, color: colors.text },
  warning: {
    ...typography.caption,
    color: colors.extracted,
    backgroundColor: '#EDE9FE',
    padding: spacing.sm,
    borderRadius: 8,
  },
  source: { ...typography.caption, color: colors.textSecondary },
  excerpt: {
    ...typography.body,
    color: colors.text,
    fontStyle: 'italic',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
  },
  meta: { ...typography.caption, color: colors.textSecondary },
  uncertainty: { ...typography.caption, color: colors.warning },
  duplicate: {
    ...typography.caption,
    color: colors.conflict,
    backgroundColor: '#FEE2E2',
    padding: spacing.sm,
    borderRadius: 8,
  },
  field: { gap: 4, marginTop: spacing.sm },
  label: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
});
