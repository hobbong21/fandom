import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";
import type { Notification } from "@/constants/data";

const WEB_MAX_WIDTH = 680;

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
  const { t } = useLanguage();
  const isWeb = Platform.OS === "web";
  const styles = makeStyles(colors);

  const renderItem = (item: Notification) => (
    <Pressable
      key={item.id}
      style={[styles.item, !item.isRead && styles.itemUnread]}
      onPress={() => markRead(item.id)}
    >
      <View style={[styles.iconWrap, { backgroundColor: NOTIF_COLORS[item.type] + "22" }]}>
        <Feather name={NOTIF_ICONS[item.type] as any} size={18} color={NOTIF_COLORS[item.type]} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.foreground }]}>{item.title}</Text>
        {item.body.length > 0 && (
          <Text style={[styles.itemBody, { color: colors.mutedForeground }]} numberOfLines={2}>
            {item.body}
          </Text>
        )}
        <Text style={[styles.timeAgo, { color: colors.mutedForeground }]}>{item.timeAgo}</Text>
      </View>
      {!item.isRead && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
    </Pressable>
  );

  if (isWeb) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.webScroll}>
          <View style={styles.webInner}>
            <View style={[styles.header, { paddingTop: 28 }]}>
              <Text style={[styles.title, { color: colors.foreground }]}>{t.notificationsTitle}</Text>
              {unreadCount > 0 && (
                <Pressable style={[styles.markAllBtn, { backgroundColor: colors.muted }]} onPress={markAllRead}>
                  <Text style={[styles.markAllText, { color: colors.primary }]}>{t.markAllRead}</Text>
                </Pressable>
              )}
            </View>

            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="bell" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t.allCaughtUp}</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noNewNotifs}</Text>
              </View>
            ) : (
              notifications.map(renderItem)
            )}
            <View style={{ height: 40 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>{t.notificationsTitle}</Text>
        {unreadCount > 0 && (
          <Pressable style={[styles.markAllBtn, { backgroundColor: colors.muted }]} onPress={markAllRead}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>{t.markAllRead}</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        renderItem={({ item }) => renderItem(item)}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t.allCaughtUp}</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noNewNotifs}</Text>
          </View>
        }
      />
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1 },
    webScroll: {
      flex: 1,
      overflowY: "auto" as any,
    },
    webInner: {
      maxWidth: WEB_MAX_WIDTH,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 14,
      backgroundColor: colors.background,
    },
    title: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5 },
    markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    markAllText: { fontSize: 13, fontWeight: "500" as const },
    list: { paddingHorizontal: 16, paddingTop: 8 },
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
    iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    itemContent: { flex: 1, gap: 3 },
    itemTitle: { fontSize: 14, fontWeight: "600" as const, lineHeight: 19 },
    itemBody: { fontSize: 13, lineHeight: 18 },
    timeAgo: { fontSize: 12, marginTop: 2 },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
    empty: { alignItems: "center", paddingVertical: 80, gap: 10 },
    emptyTitle: { fontSize: 18, fontWeight: "700" as const },
    emptyText: { fontSize: 14 },
  });
