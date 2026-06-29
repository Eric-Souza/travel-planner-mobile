import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '@/src/components/Card';
import { EmptyState, ErrorState, LoadingState, OfflineBanner } from '@/src/components/StateViews';
import { TripMap } from '@/src/features/shared/FeatureComponents';
import { DEMO_PLACES, DEMO_TRIP } from '@/src/features/demo/demoData';
import { usePlaces, useRemovePlace, useSavePlace, useSearchPlaces } from '@/src/hooks/usePlaces';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useUiStore } from '@/src/store/uiStore';
import { getNetworkErrorMessage } from '@/src/utils/errors';
import { colors, spacing, typography } from '@/src/theme';
import type { Place, PlaceCategory, PlaceSearchResult } from '@/src/types/api';

const CATEGORIES: PlaceCategory[] = [
  'food',
  'hotel',
  'attraction',
  'ski',
  'nightlife',
  'transport',
];

export default function PlacesScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const demoMode = useUiStore((s) => s.demoMode);
  const { isOnline } = useNetworkStatus();
  const [category, setCategory] = useState<PlaceCategory | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[] | null>(null);

  const { data, isLoading, isError, error, refetch } = usePlaces(tripId, category);
  const searchPlaces = useSearchPlaces(tripId);
  const savePlace = useSavePlace(tripId);
  const removePlace = useRemovePlace(tripId);

  const places: Place[] = demoMode ? DEMO_PLACES : (data ?? []);
  const displayPlaces: Array<Place | PlaceSearchResult> = searchResults ?? places;

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const results = await searchPlaces.mutateAsync({ query: searchQuery, category });
    setSearchResults(
      results.map((r) => ({
        ...r,
        address: r.address ?? undefined,
      })),
    );
  };

  const handleSaveSearchResult = async (result: PlaceSearchResult) => {
    await savePlace.mutateAsync(result);
    setSearchResults(null);
    setSearchQuery('');
  };

  if (!demoMode && isLoading) return <LoadingState />;
  if (!demoMode && isError) {
    return (
      <ErrorState message={getNetworkErrorMessage(error)} onRetry={() => void refetch()} />
    );
  }

  const mapPlaces = displayPlaces.map((p) => ({
    name: p.name,
    latitude: p.latitude,
    longitude: p.longitude,
  }));

  return (
    <View style={styles.container}>
      {!isOnline ? <OfflineBanner /> : null}

      <TripMap
        places={mapPlaces}
        center={
          demoMode
            ? { latitude: DEMO_TRIP.home_timezone ? -34.6 : -34.6, longitude: -58.4 }
            : undefined
        }
      />

      <View style={styles.filters}>
        <Pressable
          style={[styles.chip, !category && styles.chipActive]}
          onPress={() => setCategory(undefined)}
        >
          <Text style={styles.chipText}>All</Text>
        </Pressable>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={styles.chipText}>{cat}</Text>
          </Pressable>
        ))}
      </View>

      {!demoMode ? (
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search places…"
            editable={isOnline}
          />
          <PrimaryButton
            label="Search"
            onPress={() => void handleSearch()}
            disabled={!isOnline}
          />
        </View>
      ) : null}

      <FlatList
        data={displayPlaces}
        keyExtractor={(item, index) =>
          'id' in item ? item.id : `${item.name}-${index}`
        }
        ListEmptyComponent={
          <EmptyState title="No places saved" description="Search and save places for your trip." />
        }
        renderItem={({ item }) => {
          const savedPlace = 'id' in item ? item : null;
          const searchResult = 'id' in item ? null : item;
          return (
            <View style={styles.placeRow}>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{item.name}</Text>
                <Text style={styles.placeMeta}>
                  {item.category} · {item.address ?? `${item.latitude}, ${item.longitude}`}
                </Text>
              </View>
              {!demoMode && isOnline && searchResult ? (
                <PrimaryButton
                  label="Save"
                  onPress={() => void handleSaveSearchResult(searchResult)}
                  variant="secondary"
                />
              ) : null}
              {!demoMode && isOnline && savedPlace ? (
                <PrimaryButton
                  label="Remove"
                  onPress={() => void removePlace.mutateAsync(savedPlace.id)}
                  variant="secondary"
                />
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  searchRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeInfo: { flex: 1 },
  placeName: { ...typography.label, color: colors.text },
  placeMeta: { ...typography.caption, color: colors.textSecondary },
});
