import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '@/src/components/Card';
import { OfflineBanner } from '@/src/components/StateViews';
import { CitationList, ToolResultList } from '@/src/features/shared/FeatureComponents';
import { useChatStream } from '@/src/hooks/useChatStream';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useUiStore } from '@/src/store/uiStore';
import { colors, spacing, typography } from '@/src/theme';

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
        <Text style={styles.demo}>
          Demo mode — connect to the API to ask grounded questions with streaming citations.
        </Text>
        <Text style={styles.prompt}>Try: "What time is my check-in?"</Text>
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
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            {item.statusMessage ? (
              <Text style={styles.statusChip}>{item.statusMessage}</Text>
            ) : null}
            <Text style={styles.messageText}>{item.content || (isStreaming ? '…' : '')}</Text>
            <ToolResultList results={item.toolResults} />
            <CitationList sources={item.sources} />
          </View>
        )}
        ListHeaderComponent={
          suggestedPrompts.length && messages.length === 0 ? (
            <View style={styles.prompts}>
              <Text style={styles.promptsLabel}>Suggested</Text>
              {suggestedPrompts.map((p) => (
                <Pressable
                  key={p}
                  style={styles.promptChip}
                  onPress={() => void sendMessage(p)}
                  disabled={!isOnline || isStreaming}
                  accessibilityLabel={`Suggested prompt: ${p}`}
                >
                  <Text style={styles.promptText}>{p}</Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
      />

      {error ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{error}</Text>
          <PrimaryButton label="Retry" onPress={retry} variant="secondary" />
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your trip…"
          editable={isOnline && !isStreaming}
          multiline
          accessibilityLabel="Chat message input"
        />
        {isStreaming ? (
          <PrimaryButton label="Stop" onPress={cancel} variant="danger" />
        ) : (
          <PrimaryButton
            label="Send"
            onPress={handleSend}
            disabled={!isOnline || !input.trim()}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  demo: { ...typography.body, color: colors.textSecondary, padding: spacing.lg },
  prompt: { ...typography.caption, color: colors.primary, paddingHorizontal: spacing.lg },
  messages: { padding: spacing.md, gap: spacing.sm },
  bubble: {
    padding: spacing.md,
    borderRadius: 12,
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    ...typography.body,
    color: colors.text,
  },
  statusChip: {
    ...typography.caption,
    color: colors.suggested,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  prompts: { marginBottom: spacing.md, gap: spacing.xs },
  promptsLabel: { ...typography.caption, color: colors.textSecondary },
  promptChip: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptText: { ...typography.caption, color: colors.primary },
  inputRow: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    maxHeight: 100,
    ...typography.body,
    color: colors.text,
  },
  errorRow: {
    padding: spacing.sm,
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: { ...typography.caption, color: colors.error, flex: 1 },
});
