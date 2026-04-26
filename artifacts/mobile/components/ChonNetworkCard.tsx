import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getTierInfo } from "@/constants/fanTiers";
import { ChonConnection, useXP } from "@/context/XPContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { ChonNetworkGraph } from "@/components/ChonNetworkGraph";

interface Props {
  connections: ChonConnection[];
}

export function ChonNetworkCard({ connections }: Props) {
  const colors = useColors();
  const { language } = useLanguage();
  const { totalXP } = useXP();
  const { user } = useAuth();
  const [filter, setFilter] = useState<1 | 2 | null>(null);
  const [showGraph, setShowGraph] = useState(false);

  const userInitials = (user?.name ?? "나")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const firstDegree = connections.filter((c) => c.degree === 1);
  const secondDegree = connections.filter((c) => c.degree === 2);
  const displayed = filter === null ? connections : connections.filter((c) => c.degree === filter);

  const labels = {
    title: language === "ko" ? "촌수 네트워크" : "Fan Network",
    firstDegree: language === "ko" ? "1촌" : "1st",
    secondDegree: language === "ko" ? "2촌" : "2nd",
    all: language === "ko" ? "전체" : "All",
    connections: language === "ko" ? "명의 팬과 연결됨" : "fans connected",
    royalFans: language === "ko" ? "로열 팬" : "Royal fans",
  };

  const royalCount = connections.filter((c) => c.tier === "royal").length;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.networkIcon}>🔗</Text>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{labels.title}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={styles.summaryBadges}>
            <View style={[styles.badge, { backgroundColor: "#eff6ff" }]}>
              <Text style={[styles.badgeNum, { color: "#3b82f6" }]}>{firstDegree.length}</Text>
              <Text style={[styles.badgeLabel, { color: "#3b82f6" }]}>{labels.firstDegree}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "#f3f4f6" }]}>
              <Text style={[styles.badgeNum, { color: "#6b7280" }]}>{secondDegree.length}</Text>
              <Text style={[styles.badgeLabel, { color: "#6b7280" }]}>{labels.secondDegree}</Text>
            </View>
            {royalCount > 0 && (
              <View style={[styles.badge, { backgroundColor: "#fffbeb" }]}>
                <Text style={[styles.badgeNum, { color: "#f59e0b" }]}>👑 {royalCount}</Text>
              </View>
            )}
          </View>
          <Pressable
            style={({ pressed }) => [{
              flexDirection: "row", alignItems: "center", gap: 5,
              backgroundColor: pressed ? "#6d28d9" : "#7c3aed",
              paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
            }]}
            onPress={() => setShowGraph(true)}
          >
            <Feather name="share-2" size={12} color="#fff" />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>
              {language === "ko" ? "노드로 보기" : "View Graph"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.filterRow}>
        {[null, 1, 2].map((deg) => (
          <Pressable
            key={String(deg)}
            style={[
              styles.filterBtn,
              {
                backgroundColor:
                  filter === deg ? colors.primary : colors.muted,
              },
            ]}
            onPress={() => setFilter(deg as any)}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === deg ? colors.primaryForeground : colors.mutedForeground },
              ]}
            >
              {deg === null ? labels.all : deg === 1 ? labels.firstDegree : labels.secondDegree}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
        {displayed.map((conn) => {
          const tierInfo = getTierInfo(conn.xp);
          return (
            <View key={conn.id} style={styles.connItem}>
              <View
                style={[
                  styles.connAvatar,
                  { backgroundColor: tierInfo.color + "33", borderColor: tierInfo.color },
                ]}
              >
                <Text style={styles.connAvatarText}>{conn.avatar.charAt(0)}</Text>
                <View
                  style={[
                    styles.degreeBadge,
                    { backgroundColor: conn.degree === 1 ? "#3b82f6" : "#9ca3af" },
                  ]}
                >
                  <Text style={styles.degreeBadgeText}>{conn.degree}</Text>
                </View>
              </View>
              <Text style={[styles.connName, { color: colors.foreground }]} numberOfLines={1}>
                {conn.name}
              </Text>
              <Text style={styles.connTierEmoji}>{tierInfo.emoji}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Feather name="users" size={13} color={colors.mutedForeground} />
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          {connections.length} {labels.connections}
        </Text>
      </View>

      <ChonNetworkGraph
        visible={showGraph}
        onClose={() => setShowGraph(false)}
        connections={connections}
        userName={user?.name ?? "나"}
        userInitials={userInitials}
        totalXP={totalXP}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    paddingBottom: 10,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  networkIcon: { fontSize: 16 },
  cardTitle: { fontSize: 15, fontWeight: "700" as const },
  summaryBadges: { flexDirection: "row", gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeNum: { fontSize: 13, fontWeight: "700" as const },
  badgeLabel: { fontSize: 11, fontWeight: "600" as const },
  filterRow: { flexDirection: "row", gap: 6, paddingHorizontal: 14, marginBottom: 10 },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  filterText: { fontSize: 12, fontWeight: "600" as const },
  avatarScroll: { paddingLeft: 14 },
  connItem: { alignItems: "center", width: 64, marginRight: 10, marginBottom: 14 },
  connAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  connAvatarText: { fontSize: 18, fontWeight: "700" as const },
  degreeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  degreeBadgeText: { fontSize: 9, color: "#fff", fontWeight: "700" as const },
  connName: { fontSize: 11, fontWeight: "600" as const, marginTop: 4, textAlign: "center" },
  connTierEmoji: { fontSize: 12, marginTop: 1 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 10,
    paddingHorizontal: 14,
    borderTopWidth: 1,
  },
  footerText: { fontSize: 12 },
});
