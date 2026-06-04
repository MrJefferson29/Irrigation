import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppTheme } from "@/constants/theme";

const PROMPTS = [
  "When should I irrigate tomatoes?",
  "Signs of over-watering?",
  "Best time to fertilize maize?",
  "How to read soil moisture %?",
];

type ChatPromptsProps = {
  onSelect: (text: string) => void;
  disabled?: boolean;
};

export function ChatPrompts({ onSelect, disabled }: ChatPromptsProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Suggested questions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {PROMPTS.map((prompt) => (
          <Pressable
            key={prompt}
            style={[styles.chip, disabled && styles.chipDisabled]}
            onPress={() => onSelect(prompt)}
            disabled={disabled}>
            <Text style={styles.chipText}>{prompt}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: AppTheme.text.muted,
  },
  row: {
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: AppTheme.glass.border,
    maxWidth: 260,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: AppTheme.text.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
