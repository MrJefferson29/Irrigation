import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatBubble, TypingIndicator } from "@/components/chat/chat-bubble";
import { ChatPrompts } from "@/components/chat/chat-prompts";
import { GlassCard } from "@/components/ui/glass-card";
import { ScreenBackground } from "@/components/ui/screen-background";
import { AppTheme } from "@/constants/theme";
import { api, HealthStatus } from "@/lib/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: Date;
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello — I'm your agronomy assistant. Ask about irrigation schedules, soil moisture, pests, or fertilizer plans.",
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useFocusEffect(
    useCallback(() => {
      api
        .getHealth()
        .then(setHealth)
        .catch(() => setHealth(null));
    }, []),
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) {
        return;
      }

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setError(null);
      setSending(true);

      try {
        const { reply } = await api.chat(trimmed);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: reply,
            createdAt: new Date(),
          },
        ]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not get a reply.";
        setError(message);
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            text: `⚠ ${message}`,
            createdAt: new Date(),
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [sending],
  );

  const showPrompts = messages.length <= 1 && !sending;

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "ios" ? 8 : 16) }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.heading}>Agronomy Assistant</Text>
              <Text style={styles.subHeading}>Smart irrigation & crop guidance</Text>
            </View>
            <View style={[styles.aiBadge, health?.openAiConfigured ? styles.aiBadgeLive : styles.aiBadgeBasic]}>
              <View
                style={[
                  styles.aiDot,
                  { backgroundColor: health?.openAiConfigured ? "#22c55e" : "#fbbf24" },
                ]}
              />
              <Text style={styles.aiBadgeText}>{health?.openAiConfigured ? "AI live" : "Basic mode"}</Text>
            </View>
          </View>

          <GlassCard contentStyle={styles.connectionCard}>
            <Text style={styles.connectionLabel}>Backend</Text>
            <Text style={styles.connectionValue} numberOfLines={1}>
              {health?.ok ? api.baseUrl : "Not connected"}
            </Text>
            {!health?.ok ? (
              <Text style={styles.connectionHint}>
                Set EXPO_PUBLIC_API_URL in frontend/.env to your PC IP, then restart Expo.
              </Text>
            ) : null}
          </GlassCard>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={sending ? <TypingIndicator /> : null}
          renderItem={({ item }) => (
            <ChatBubble role={item.role} text={item.text} timestamp={item.createdAt} />
          )}
        />

        {showPrompts ? <ChatPrompts onSelect={(prompt) => sendMessage(prompt)} disabled={sending} /> : null}

        {Platform.OS === "ios" ? (
          <BlurView intensity={75} tint="dark" style={styles.composer}>
            <ComposerInner
              input={input}
              setInput={setInput}
              sending={sending}
              onSend={() => sendMessage(input)}
              bottomInset={insets.bottom}
            />
          </BlurView>
        ) : (
          <View style={[styles.composer, styles.composerAndroid]}>
            <ComposerInner
              input={input}
              setInput={setInput}
              sending={sending}
              onSend={() => sendMessage(input)}
              bottomInset={insets.bottom}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

function ComposerInner({
  input,
  setInput,
  sending,
  onSend,
  bottomInset,
}: {
  input: string;
  setInput: (v: string) => void;
  sending: boolean;
  onSend: () => void;
  bottomInset: number;
}) {
  return (
    <View style={[styles.composerInner, { paddingBottom: Math.max(bottomInset, 12) }]}>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Message your agronomy assistant…"
        placeholderTextColor={AppTheme.text.muted}
        multiline
        maxLength={2000}
        editable={!sending}
        blurOnSubmit={false}
      />
      <Pressable
        style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!input.trim() || sending}>
        {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendLabel}>↑</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: AppTheme.text.primary,
    letterSpacing: -0.5,
  },
  subHeading: {
    fontSize: 14,
    color: AppTheme.text.secondary,
    marginTop: 2,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  aiBadgeLive: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    borderColor: "rgba(34, 197, 94, 0.5)",
  },
  aiBadgeBasic: {
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    borderColor: "rgba(251, 191, 36, 0.45)",
  },
  aiDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: AppTheme.text.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  connectionCard: {
    paddingVertical: 10,
    gap: 2,
  },
  connectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: AppTheme.text.muted,
  },
  connectionValue: {
    fontSize: 12,
    color: AppTheme.text.secondary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  connectionHint: {
    fontSize: 12,
    color: AppTheme.status.error,
    marginTop: 4,
    lineHeight: 17,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: AppTheme.status.errorBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
  },
  errorText: {
    color: AppTheme.status.error,
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 4,
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: AppTheme.glass.border,
    overflow: "hidden",
  },
  composerAndroid: {
    backgroundColor: "rgba(12, 25, 41, 0.96)",
  },
  composerInner: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: AppTheme.glass.borderStrong,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    fontSize: 16,
    color: AppTheme.text.primary,
    backgroundColor: "rgba(0, 0, 0, 0.28)",
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: AppTheme.accent.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendLabel: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 22,
    marginTop: -2,
  },
});
