import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useUiStore } from '@/src/store/uiStore';
import { colors, spacing, typography } from '@/src/theme';

export function SourceBottomSheet() {
  const sheetRef = useRef<BottomSheet>(null);
  const selectedSource = useUiStore((s) => s.selectedSource);
  const setSelectedSource = useUiStore((s) => s.setSelectedSource);
  const snapPoints = useMemo(() => ['40%', '70%'], []);

  const handleClose = useCallback(() => {
    setSelectedSource(null);
    sheetRef.current?.close();
  }, [setSelectedSource]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    [],
  );

  if (!selectedSource) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{selectedSource.title}</Text>
        {selectedSource.page != null ? (
          <Text style={styles.meta}>Page {selectedSource.page}</Text>
        ) : null}
        <Text style={styles.excerpt}>{selectedSource.excerpt}</Text>
        {selectedSource.fetched_at ? (
          <Text style={styles.meta}>
            Fetched {new Date(selectedSource.fetched_at).toLocaleString()}
          </Text>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  excerpt: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
});
