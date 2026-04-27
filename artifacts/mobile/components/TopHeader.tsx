import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

interface TopHeaderProps {
  title: string;
}

export function TopHeader({ title }: TopHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { unreadCount } = useFandom();
  const { language, toggleLanguage } = useLanguage();

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: insets.top,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.inner}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.actions}>
          {/* Language toggle */}
          <Pressable
            onPress={toggleLanguage}
            hitSlop={8}
            style={({ pressed }) => [
              styles.langBtn,
              {
                backgroundColor: pressed ? colors.muted + "cc" : colors.muted,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="globe" size={13} color={colors.mutedForeground} />
            <Text style={[styles.langText, { color: colors.foreground }]}>
              {language === "ko" ? "KO" : "EN"}
            </Text>
          </Pressable>

          {/* Notifications bell */}
          <Pressable
            onPress={() => router.push("/notifications")}
            hitSlop={8}
            style={({ pressed }) => [
              styles.bellBtn,
              {
                backgroundColor: pressed ? colors.muted : "transparent",
              },
            ]}
          >
            <Feather name="bell" size={22} color={colors.foreground} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    minHeight: 50,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  langText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    color: "#ffffff",
    fontWeight: "800",
  },
});
