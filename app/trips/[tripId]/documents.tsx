import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, StatusBadge } from '@/src/components/Card';
import { EmptyState, ErrorState, LoadingState, OfflineBanner } from '@/src/components/StateViews';
import {
  useDocumentProcessing,
  useDocuments,
  useExtractBooking,
  useProcessDocument,
  useUploadDocument,
} from '@/src/hooks/useDocuments';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useUiStore } from '@/src/store/uiStore';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing, typography } from '@/src/theme';
import type { TravelDocument } from '@/src/types/api';

export default function DocumentsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const demoMode = useUiStore((s) => s.demoMode);
  const { isOnline } = useNetworkStatus();
  const uploadDocumentId = useUiStore((s) => s.uploadDocumentId);
  const { data, isLoading, isError, error, refetch } = useDocuments(tripId);
  const upload = useUploadDocument(tripId);
  const process = useProcessDocument(tripId);
  const extract = useExtractBooking(tripId);
  const { data: processing } = useDocumentProcessing(uploadDocumentId);

  const pickAndUpload = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Uploads are disabled while offline.');
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/plain', 'message/rfc822', '*/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    try {
      const doc = await upload.mutateAsync({
        file: {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/octet-stream',
        },
      });
      await process.mutateAsync(doc.id);
      await extract.mutateAsync(doc.id);
      router.push(`/trips/${tripId}/review/${doc.id}`);
    } catch (e) {
      Alert.alert('Upload failed', (e as Error).message);
    }
  };

  if (demoMode) {
    return (
      <View style={styles.container}>
        <Text style={styles.demo}>
          Demo mode — connect to the API to upload PDF, TXT, or EML reservation files.
        </Text>
        <PrimaryButton
          label="Review sample extraction"
          onPress={() => router.push(`/trips/${tripId}/review/demo-doc-1`)}
        />
      </View>
    );
  }

  if (isLoading) return <LoadingState />;
  if (isError) {
    return (
      <ErrorState message={getNetworkErrorMessage(error)} onRetry={() => void refetch()} />
    );
  }

  return (
    <View style={styles.container}>
      {!isOnline ? <OfflineBanner /> : null}

      {processing ? (
        <View style={styles.processing}>
          <Text style={styles.processingText}>
            Processing: {processing.processing_status}
            {processing.stage ? ` (${processing.stage})` : ''}
          </Text>
        </View>
      ) : null}

      <PrimaryButton
        label={upload.isPending ? 'Uploading…' : 'Upload document'}
        onPress={() => void pickAndUpload()}
        disabled={!isOnline || upload.isPending}
      />

      <FlatList
        data={data ?? []}
        keyExtractor={(d) => d.id}
        style={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No documents"
            description="Upload a hotel PDF, flight email, or travel note."
          />
        }
        renderItem={({ item }) => (
          <DocumentRow
            doc={item}
            onReview={() => router.push(`/trips/${tripId}/review/${item.id}`)}
            onRetry={async () => {
              await process.mutateAsync(item.id);
              if (item.processing_status === 'parsed') {
                await extract.mutateAsync(item.id);
              }
            }}
          />
        )}
      />
    </View>
  );
}

function DocumentRow({
  doc,
  onReview,
  onRetry,
}: {
  doc: TravelDocument;
  onReview: () => void;
  onRetry: () => void;
}) {
  const status =
    doc.processing_status === 'failed'
      ? 'failed'
      : doc.processing_status === 'extracted' || doc.processing_status === 'ready'
        ? 'extracted'
        : 'suggested';

  return (
    <View style={styles.row}>
      <Text style={styles.fileName}>{doc.file_name}</Text>
      <StatusBadge status={status} />
      {doc.error_message ? (
        <Text style={styles.error}>{doc.error_message}</Text>
      ) : null}
      {doc.processing_status === 'extracted' || doc.processing_status === 'ready' ? (
        <PrimaryButton label="Review extraction" onPress={onReview} variant="secondary" />
      ) : doc.processing_status === 'failed' ? (
        <PrimaryButton label="Retry processing" onPress={onRetry} variant="secondary" />
      ) : (
        <Text style={styles.meta}>Status: {doc.processing_status}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  demo: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  processing: {
    backgroundColor: '#DBEAFE',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  processingText: {
    ...typography.caption,
    color: colors.suggested,
  },
  list: {
    marginTop: spacing.md,
  },
  row: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  fileName: {
    ...typography.label,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
});
