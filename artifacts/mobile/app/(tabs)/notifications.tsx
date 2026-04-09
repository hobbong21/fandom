import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFandom } from "@/context/FandomContext";
import { useColors } from "@/hooks/useColors";
import type { Notification } from "@/constants/data";

const NOTIF_ICONS: Record<Notification["type"], string> = {
  like: "heart",
  comment: "message-circle",
  follow: "user-plus",
  mention: "at-sign",
  new_post: "bell",
};

const NOTIF_COLORS: Record<Notification["type"], string> = {
  like: "#f472b6",
  comment: "#8b5cf6",
  follow: "#34d399",
  mention: "#f59e0b",
  new_post: "#60a5fa",
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, markAllRead, markRead, unreadCount } = useFandom();
  const isWeb = Platform.OS === "web";

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: isWeb ? 67 : insets.top + 12 },
        ]}
      >
        <Text style={styles.title}>알림</Text>
        {unreadCount > 0 && (
          <Pressable style={styles.markAllBtn} onPress={markAllRead}>
            <Text style={styles.markAllText}>전체 읽음 처리</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: isWeb ? 34 : insets.bottom + 100 },
        ]}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.item, !item.isRead && styles.itemUnread]}
            onPress={() => markRead(item.id)}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: NOTIF_COLORS[item.type] + "22" },
              ]}
            >
              <Feather
                name={NOTIF_ICONS[item.type] as any}
                size={18}
                color={NOTIF_COLORS[item.type]}
              />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {item.body.length > 0 && (
                <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
              )}
              <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            </View>
            {!item.isRead && <View style={styles.dot} />}
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell" size={40} color={colors.mutedForeground} />
            <Text style={styles.emptyTitle}>모두 읽었습니다!</Text>
            <Text style={styles.emptyText}>새로운 알림이 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 14,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    markAllBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.muted,
    },
    markAllText: {
      fontSize: 13,
      fontWeight: "500" as const,
      color: colors.primary,
    },
    list: {
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    item: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 14,
      borderRadius: 16,
      marginBottom: 8,
      backgroundColor: colors.card,
      gap: 12,
    },
    itemUnread: {
      backgroundColor: colors.primary + "11",
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    itemContent: {
      flex: 1,
      gap: 3,
    },
    itemTitle: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.foreground,
      lineHeight: 19,
    },
    itemBody: {
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    timeAgo: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 6,
    },
    empty: {
      alignItems: "center",
      paddingVertical: 80,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
  });
