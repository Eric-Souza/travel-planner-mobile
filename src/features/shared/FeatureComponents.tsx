import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useUiStore } from '@/src/store/uiStore';
import type { SourceCitation, ToolResultCard } from '@/src/types/api';
import { colors, spacing, typography } from '@/src/theme';

type CitationListProps = {
  sources: SourceCitation[];
};

export function CitationList({ sources }: CitationListProps) {
  const setSelectedSource = useUiStore((s) => s.setSelectedSource);

  if (!sources.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sources</Text>
      {sources.map((source) => (
        <Pressable
          key={source.source_id}
          style={styles.citation}
          onPress={() => setSelectedSource(source)}
          accessibilityRole="button"
          accessibilityLabel={`Open source: ${source.title}`}
        >
          <Text style={styles.citationTitle}>{source.title}</Text>
          {source.page != null ? (
            <Text style={styles.citationMeta}>Page {source.page}</Text>
          ) : null}
          <Text style={styles.citationExcerpt} numberOfLines={2}>
            {source.excerpt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

type ToolResultListProps = {
  results: ToolResultCard[];
};

export function ToolResultList({ results }: ToolResultListProps) {
  if (!results.length) return null;

  return (
    <View style={styles.container}>
      {results.map((result, i) => (
        <View key={`${result.tool}-${i}`} style={styles.toolCard}>
          <Text style={styles.toolTitle}>{result.title}</Text>
          <Text style={styles.toolSummary}>{result.summary}</Text>
        </View>
      ))}
    </View>
  );
}

type TripMapProps = {
  places: { name: string; latitude: number; longitude: number }[];
  center?: { latitude: number; longitude: number };
};

export function TripMap({ places, center }: TripMapProps) {
  const lat = center?.latitude ?? places[0]?.latitude ?? -34.6;
  const lng = center?.longitude ?? places[0]?.longitude ?? -58.4;

  const markers = places
    .map(
      (p) =>
        `L.marker([${p.latitude}, ${p.longitude}]).addTo(map).bindPopup(${JSON.stringify(p.name)});`,
    )
    .join('\n');

  const html = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;height:100%;}</style>
</head><body>
<div id="map"></div>
<script>
var map = L.map('map').setView([${lat}, ${lng}], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
${markers}
</script></body></html>`;

  const openExternal = () => {
    if (places[0]) {
      const url = `https://www.openstreetmap.org/?mlat=${places[0].latitude}&mlon=${places[0].longitude}#map=14/${places[0].latitude}/${places[0].longitude}`;
      void Linking.openURL(url);
    }
  };

  return (
    <View style={styles.mapContainer}>
      <WebView
        source={{ html }}
        style={styles.map}
        originWhitelist={['*']}
        accessibilityLabel="Trip map showing saved places and itinerary pins"
      />
      <Pressable style={styles.mapLink} onPress={openExternal}>
        <Text style={styles.mapLinkText}>Open in maps</Text>
      </Pressable>
      <Text style={styles.attribution}>© OpenStreetMap contributors</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  heading: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  citation: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  citationTitle: {
    ...typography.label,
    color: colors.primary,
  },
  citationMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  citationExcerpt: {
    ...typography.caption,
    color: colors.text,
    marginTop: 2,
  },
  toolCard: {
    backgroundColor: '#EFF6FF',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  toolTitle: {
    ...typography.label,
    color: colors.suggested,
  },
  toolSummary: {
    ...typography.caption,
    color: colors.text,
    marginTop: 2,
  },
  mapContainer: {
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
  mapLink: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapLinkText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  attribution: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.xs,
    backgroundColor: colors.surface,
  },
});
