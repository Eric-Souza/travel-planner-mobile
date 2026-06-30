import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { useUiStore } from '@/src/store/uiStore';
import { colors, spacing } from '@/src/theme';

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
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          {selectedSource.title}
        </Text>
        {selectedSource.page != null ? (
          <Text variant="labelMedium" style={styles.meta}>
            Page {selectedSource.page}
          </Text>
        ) : null}
        <Divider style={styles.divider} />
        <Text variant="bodyMedium" style={styles.excerpt}>
          {selectedSource.excerpt}
        </Text>
        {selectedSource.fetched_at ? (
          <Text variant="bodySmall" style={styles.meta}>
            Fetched {new Date(selectedSource.fetched_at).toLocaleString()}
          </Text>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    backgroundColor: colors.border,
    width: 40,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  excerpt: {
    color: colors.text,
    lineHeight: 24,
  },
});
