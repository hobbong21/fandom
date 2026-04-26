import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FanTier, FAN_TIERS } from "@/constants/fanTiers";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  tier: FanTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function FanTierBadge({ tier, size = "md", showLabel = true }: Props) {
  const { language } = useLanguage();
  const info = FAN_TIERS.find((t) => t.tier === tier)!;

  const sizeStyles = {
    sm: { container: styles.containerSm, emoji: styles.emojiSm, text: styles.textSm },
    md: { container: styles.containerMd, emoji: styles.emojiMd, text: styles.textMd },
    lg: { container: styles.containerLg, emoji: styles.emojiLg, text: styles.textLg },
  }[size];

  return (
    <View style={[styles.container, sizeStyles.container, { backgroundColor: info.bgColor }]}>
      <Text style={sizeStyles.emoji}>{info.emoji}</Text>
      {showLabel && (
        <Text style={[sizeStyles.text, { color: info.color }]}>
          {language === "ko" ? info.label.ko : info.label.en}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
  },
  containerSm: { paddingHorizontal: 8, paddingVertical: 3, gap: 3 },
  containerMd: { paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  containerLg: { paddingHorizontal: 14, paddingVertical: 6, gap: 6 },
  emojiSm: { fontSize: 11 },
  emojiMd: { fontSize: 14 },
  emojiLg: { fontSize: 18 },
  textSm: { fontSize: 11, fontWeight: "600" as const },
  textMd: { fontSize: 13, fontWeight: "700" as const },
  textLg: { fontSize: 16, fontWeight: "700" as const },
});
