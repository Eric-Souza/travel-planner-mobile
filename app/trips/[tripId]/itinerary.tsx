import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, StatusBadge } from '@/src/components/Card';
import { EmptyState, ErrorState, LoadingState, OfflineBanner } from '@/src/components/StateViews';
import { ItineraryItemCard } from '@/src/features/timeline/TimelineCards';
import {
  useApplyProposal,
  useGenerateProposal,
  useItineraries,
  useProposal,
} from '@/src/hooks/useItinerary';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useUiStore } from '@/src/store/uiStore';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing, typography } from '@/src/theme';

export default function ItineraryScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const demoMode = useUiStore((s) => s.demoMode);
  const { isOnline } = useNetworkStatus();
  const [proposalId, setProposalId] = useState<string | null>(null);

  const { data: itinerary, isLoading, isError, error, refetch } = useItineraries(tripId);
  const generate = useGenerateProposal(tripId);
  const apply = useApplyProposal(tripId);
  const { data: proposal } = useProposal(proposalId);

  const handleGenerate = async (mode: 'standard' | 'rainy_day') => {
    try {
      const result = await generate.mutateAsync({
        mode,
        target_date: mode === 'rainy_day' ? '2026-08-06' : undefined,
      });
      setProposalId(result.id);
    } catch (e) {
      Alert.alert('Generation failed', (e as Error).message);
    }
  };

  const handleApply = async () => {
    if (!proposalId) return;
    Alert.alert(
      'Apply itinerary?',
      'This will update your active plan. Confirmed bookings will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            try {
              await apply.mutateAsync(proposalId);
              setProposalId(null);
              Alert.alert('Applied', 'Itinerary updated.');
            } catch (e) {
              Alert.alert('Apply failed', (e as Error).message);
            }
          },
        },
      ],
    );
  };

  if (demoMode) {
    return (
      <View style={styles.container}>
        <Text style={styles.demo}>
          Demo mode — connect to the API to generate and apply itinerary proposals.
        </Text>
      </View>
    );
  }

  if (isLoading) return <LoadingState />;
  if (isError) {
    return (
      <ErrorState message={getNetworkErrorMessage(error)} onRetry={() => void refetch()} />
    );
  }

  const activeItems = itinerary?.items ?? [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!isOnline ? <OfflineBanner /> : null}

      <Text style={styles.section}>Current plan</Text>
      {activeItems.length === 0 ? (
        <EmptyState title="No itinerary yet" description="Generate a proposal to get started." />
      ) : (
        activeItems.map((item) => <ItineraryItemCard key={item.id} item={item} />)
      )}

      <Text style={styles.section}>Generate proposal</Text>
      <PrimaryButton
        label={generate.isPending ? 'Generating…' : 'Generate itinerary'}
        onPress={() => void handleGenerate('standard')}
        disabled={!isOnline || generate.isPending}
      />
      <PrimaryButton
        label="Rainy-day replan"
        onPress={() => void handleGenerate('rainy_day')}
        disabled={!isOnline || generate.isPending}
        variant="secondary"
      />

      {proposal ? (
        <View style={styles.proposal}>
          <Text style={styles.section}>
            {proposal.mode === 'rainy_day' ? 'Rainy-day proposal' : 'New proposal'}
          </Text>
          {proposal.warnings.map((w) => (
            <Text key={w} style={styles.warning}>
              ⚠ {w}
            </Text>
          ))}

          {proposal.mode === 'rainy_day' && proposal.before_items ? (
            <View>
              <Text style={styles.compareLabel}>Before</Text>
              {proposal.before_items.map((item) => (
                <ItineraryItemCard key={`before-${item.id}`} item={item} />
              ))}
              <Text style={styles.compareLabel}>After (proposal)</Text>
            </View>
          ) : null}

          {proposal.items.map((item) => (
            <View key={item.id} style={styles.proposalItem}>
              <ItineraryItemCard item={item} />
              {item.status === 'locked' || item.status === 'confirmed' ? (
                <StatusBadge status="confirmed" />
              ) : (
                <StatusBadge status="suggested" />
              )}
            </View>
          ))}

          <PrimaryButton
            label={apply.isPending ? 'Applying…' : 'Apply proposal'}
            onPress={() => void handleApply()}
            disabled={apply.isPending}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.sm },
  section: { ...typography.subtitle, color: colors.text, marginTop: spacing.md },
  demo: { ...typography.body, color: colors.textSecondary, padding: spacing.lg },
  proposal: { marginTop: spacing.md, gap: spacing.sm },
  proposalItem: { gap: spacing.xs },
  warning: { ...typography.caption, color: colors.warning },
  compareLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
});
