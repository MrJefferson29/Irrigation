import { StyleSheet, Text, View } from "react-native";

import { AppTheme } from "@/constants/theme";

type ChatBubbleProps = {
  role: "user" | "assistant";
  text: string;
  timestamp?: Date;
  pending?: boolean;
};

export function ChatBubble({ role, text, timestamp, pending }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser ? (
        <View style={styles.avatarAssistant}>
          <Text style={styles.avatarLabel}>AI</Text>
        </View>
      ) : null}

      <View style={[styles.column, isUser && styles.columnUser]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant, pending && styles.bubblePending]}>
          <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>{text}</Text>
        </View>
        {timestamp ? (
          <Text style={[styles.time, isUser && styles.timeUser]}>
            {timestamp.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </Text>
        ) : null}
      </View>

      {isUser ? (
        <View style={styles.avatarUser}>
          <Text style={styles.avatarLabel}>You</Text>
        </View>
      ) : null}
    </View>
  );
}

export function TypingIndicator() {
  return (
    <View style={styles.row}>
      <View style={styles.avatarAssistant}>
        <Text style={styles.avatarLabel}>AI</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
        <Text style={styles.typingText}>Thinking…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 4,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  column: {
    maxWidth: "76%",
    gap: 4,
  },
  columnUser: {
    alignItems: "flex-end",
  },
  avatarAssistant: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(20, 184, 166, 0.35)",
    borderWidth: 1,
    borderColor: AppTheme.accent.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarUser: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(99, 102, 241, 0.35)",
    borderWidth: 1,
    borderColor: AppTheme.accent.indigo,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: AppTheme.text.primary,
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  bubbleUser: {
    backgroundColor: AppTheme.accent.teal,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: AppTheme.glass.borderStrong,
    borderBottomLeftRadius: 4,
  },
  bubblePending: {
    opacity: 0.85,
  },
  text: {
    fontSize: 16,
    lineHeight: 23,
  },
  textUser: {
    color: "#fff",
  },
  textAssistant: {
    color: AppTheme.text.primary,
  },
  time: {
    fontSize: 11,
    color: AppTheme.text.muted,
    marginLeft: 4,
  },
  timeUser: {
    marginRight: 4,
    marginLeft: 0,
  },
  typingBubble: {
    paddingVertical: 10,
  },
  typingText: {
    color: AppTheme.text.secondary,
    fontSize: 15,
    fontStyle: "italic",
  },
});
