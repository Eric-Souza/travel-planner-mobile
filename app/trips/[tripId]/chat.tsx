import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { Chip, IconButton, Surface, Text, TextInput } from 'react-native-paper';
import { PrimaryButton } from '@/src/components/Card';
import { OfflineBanner } from '@/src/components/StateViews';
import { CitationList, ToolResultList } from '@/src/features/shared/FeatureComponents';
import { useChatStream } from '@/src/hooks/useChatStream';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useUiStore } from '@/src/store/uiStore';
import { colors, spacing } from '@/src/theme';

export default function ChatScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const demoMode = useUiStore((s) => s.demoMode);
  const { isOnline } = useNetworkStatus();
  const [input, setInput] = useState('');
  const { messages, isStreaming, error, suggestedPrompts, sendMessage, cancel, retry } =
    useChatStream(tripId);

  const handleSend = () => {
    if (!input.trim()) return;
    void sendMessage(input.trim());
    setInput('');
  };

  if (demoMode) {
    return (
      <View style={styles.container}>
        <Surface style={styles.demoCard} elevation={1}>
          <Text variant="bodyMedium" style={styles.demo}>
            Demo mode — connect to the API to ask grounded questions with streaming citations.
          </Text>
          <Chip icon="lightbulb-outline" style={styles.demoChip}>
            Try: &quot;What time is my check-in?&quot;
          </Chip>
        </Surface>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {!isOnline ? <OfflineBanner /> : null}

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <Surface
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
            elevation={item.role === 'user' ? 0 : 1}
          >
            {item.statusMessage ? (
              <Chip compact style={styles.statusChip} textStyle={styles.statusChipText}>
                {item.statusMessage}
              </Chip>
            ) : null}
            <Text
              variant="bodyMedium"
              style={item.role === 'user' ? styles.userText : styles.assistantText}
            >
              {item.content || (isStreaming ? '…' : '')}
            </Text>
            <ToolResultList results={item.toolResults} />
            <CitationList sources={item.sources} />
          </Surface>
        )}
        ListHeaderComponent={
          suggestedPrompts.length && messages.length === 0 ? (
            <View style={styles.prompts}>
              <Text variant="labelLarge" style={styles.promptsLabel}>
                Suggested
              </Text>
              <View style={styles.promptRow}>
                {suggestedPrompts.map((p) => (
                  <Chip
                    key={p}
                    mode="outlined"
                    onPress={() => void sendMessage(p)}
                    disabled={!isOnline || isStreaming}
                    style={styles.promptChip}
                    accessibilityLabel={`Suggested prompt: ${p}`}
                  >
                    {p}
                  </Chip>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      {error ? (
        <Surface style={styles.errorRow} elevation={0}>
          <Text variant="bodySmall" style={styles.errorText}>
            {error}
          </Text>
          <PrimaryButton label="Retry" onPress={retry} variant="secondary" />
        </Surface>
      ) : null}

      <Surface style={styles.inputRow} elevation={4}>
        <TextInput
          mode="outlined"
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your trip…"
          editable={isOnline && !isStreaming}
          multiline
          dense
          accessibilityLabel="Chat message input"
        />
        {isStreaming ? (
          <IconButton icon="stop-circle" iconColor={colors.error} onPress={cancel} accessibilityLabel="Stop" />
        ) : (
          <IconButton
            icon="send"
            iconColor={colors.primary}
            onPress={handleSend}
            disabled={!isOnline || !input.trim()}
            accessibilityLabel="Send message"
          />
        )}
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  demoCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  demo: { color: colors.textSecondary },
  demoChip: { alignSelf: 'flex-start' },
  messages: { padding: spacing.md, gap: spacing.sm },
  bubble: {
    padding: spacing.md,
    borderRadius: 16,
    maxWidth: '90%',
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
  },
  userText: { color: colors.onPrimary },
  assistantText: { color: colors.text },
  statusChip: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
    backgroundColor: colors.surfaceElevated,
  },
  statusChipText: { color: colors.suggested, fontStyle: 'italic' },
  prompts: { marginBottom: spacing.md, gap: spacing.sm },
  promptsLabel: { color: colors.textSecondary },
  promptRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  promptChip: { backgroundColor: colors.surface },
  inputRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.xs,
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.surface,
  },
  errorRow: {
    padding: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  errorText: { color: colors.error, flex: 1 },
});
