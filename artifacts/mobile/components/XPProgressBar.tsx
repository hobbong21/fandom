import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { getNextTierInfo, getProgressToNextTier, getTierInfo } from "@/constants/fanTiers";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  xp: number;
}

export function XPProgressBar({ xp }: Props) {
  const colors = useColors();
  const { language } = useLanguage();
  const tierInfo = getTierInfo(xp);
  const nextTier = getNextTierInfo(xp);
  const progress = getProgressToNextTier(xp);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animWidth, {
      toValue: progress,
      useNativeDriver: false,
      tension: 60,
      friction: 12,
    }).start();
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.xpText, { color: colors.foreground }]}>
          {xp.toLocaleString()} XP
        </Text>
        {nextTier ? (
          <Text style={[styles.nextText, { color: colors.mutedForeground }]}>
            {language === "ko"
              ? `다음 등급까지 ${(nextTier.minXP - xp).toLocaleString()} XP`
              : `${(nextTier.minXP - xp).toLocaleString()} XP to next tier`}
          </Text>
        ) : (
          <Text style={[styles.nextText, { color: tierInfo.color }]}>
            {language === "ko" ? "최고 등급 달성! 🎉" : "Max tier reached! 🎉"}
          </Text>
        )}
      </View>

      <View style={[styles.track, { backgroundColor: colors.muted }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: tierInfo.color,
              width: animWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      <View style={styles.tierLabels}>
        <Text style={[styles.tierLabel, { color: tierInfo.color }]}>
          {tierInfo.emoji} {language === "ko" ? tierInfo.label.ko : tierInfo.label.en}
        </Text>
        {nextTier && (
          <Text style={[styles.tierLabel, { color: colors.mutedForeground }]}>
            {nextTier.emoji} {language === "ko" ? nextTier.label.ko : nextTier.label.en}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6, width: "100%" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  xpText: { fontSize: 15, fontWeight: "700" as const },
  nextText: { fontSize: 12 },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  tierLabels: { flexDirection: "row", justifyContent: "space-between" },
  tierLabel: { fontSize: 12, fontWeight: "600" as const },
});
