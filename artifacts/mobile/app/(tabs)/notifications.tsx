import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
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
  new_post: "music",
  artist_post: "star",
  live: "radio",
};

const NOTIF_COLORS: Record<Notification["type"], string> = {
  like: "#f472b6",
  comment: "#8b5cf6",
  follow: "#34d399",
  mention: "#f59e0b",
  new_post: "#60a5fa",
  artist_post: "#7c3aed",
  live: "#ef4444",
};

const NOTIF_LABELS: Record<Notification["type"], string> = {
  like: "좋아요",
  comment: "댓글",
  follow: "팔로우",
  mention: "멘션",
  new_post: "새 소식",
  artist_post: "아티스트",
  live: "LIVE",
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, markAllRead, markRead, unreadCount } = useFandom();
  const { t } = useLanguage();
  const isWeb = Platform.OS === "web";

  const renderItem = (item: Notification) => {
    const iconColor = NOTIF_COLORS[item.type] ?? colors.primary;
    const isArtistRelated = item.isArtist || item.type === "artist_post" || item.type === "live";

    return (
      <Pressable
        key={item.id}
        style={[{
          flexDirection: "row",
          alignItems: "flex-start",
          padding: 14,
          borderRadius: 16,
          marginBottom: 8,
          gap: 12,
          borderWidth: 1,
        }, item.isRead
          ? { backgroundColor: colors.card, borderColor: colors.border }
          : {
            backgroundColor: isArtistRelated ? colors.primary + "0d" : colors.card,
            borderColor: isArtistRelated ? colors.primary + "40" : colors.border,
            borderLeftWidth: 3,
            borderLeftColor: iconColor,
          }
        ]}
        onPress={() => markRead(item.id)}
      >
        {/* Avatar or icon */}
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: iconColor + "22",
          borderWidth: isArtistRelated ? 1.5 : 0,
          borderColor: iconColor + "50",
        }}>
          {item.avatar.length <= 2 ? (
            <Text style={{ fontSize: 15, fontWeight: "700", color: iconColor }}>
              {item.avatar}
            </Text>
          ) : (
            <Feather name={NOTIF_ICONS[item.type] as any} size={18} color={iconColor} />
          )}
        </View>

        <View style={{ flex: 1, gap: 3 }}>
          {/* Type badge for artist posts */}
          {isArtistRelated && (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginBottom: 2,
            }}>
              <View style={{
                backgroundColor: iconColor + "20",
                borderRadius: 6,
                paddingHorizontal: 7,
                paddingVertical: 2,
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
              }}>
                <Feather name={NOTIF_ICONS[item.type] as any} size={9} color={iconColor} />
                <Text style={{ fontSize: 10, color: iconColor, fontWeight: "700" }}>
                  {NOTIF_LABELS[item.type]}
                </Text>
              </View>
            </View>
          )}

          <Text style={{ fontSize: 14, fontWeight: item.isRead ? "500" : "700", color: colors.foreground, lineHeight: 20 }}>
            {item.title}
          </Text>
          {item.body.length > 0 && (
            <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 18 }} numberOfLines={2}>
              {item.body}
            </Text>
          )}
          <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 1 }}>{item.timeAgo}</Text>
        </View>

        {!item.isRead && (
          <View style={{ width: 9, height: 9, borderRadius: 4.5, backgroundColor: iconColor, marginTop: 6 }} />
        )}
      </Pressable>
    );
  };

  const headerSection = (padTop: number) => (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: padTop,
      paddingBottom: 16,
      backgroundColor: colors.background,
      paddingHorizontal: isWeb ? 0 : 16,
    }}>
      <View>
        <Text style={{ fontSize: 26, fontWeight: "900", color: colors.foreground, letterSpacing: -0.5 }}>
          {t.notificationsTitle}
        </Text>
        {unreadCount > 0 && (
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 1 }}>
            읽지 않은 알림 <Text style={{ color: colors.primary, fontWeight: "700" }}>{unreadCount}</Text>개
          </Text>
        )}
      </View>
      {unreadCount > 0 && (
        <Pressable
          style={{ backgroundColor: colors.primary + "18", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}
          onPress={markAllRead}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primary }}>{t.markAllRead}</Text>
        </Pressable>
      )}
    </View>
  );

  const emptyComponent = (
    <View style={{ alignItems: "center", paddingVertical: 80, gap: 12 }}>
      <Text style={{ fontSize: 52 }}>🔔</Text>
      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{t.allCaughtUp}</Text>
      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{t.noNewNotifs}</Text>
    </View>
  );

  if (isWeb) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, overflowY: "auto" as any }}>
          <View style={{ maxWidth: WEB_MAX_WIDTH, width: "100%", alignSelf: "center", paddingHorizontal: 20 }}>
            {headerSection(28)}
            {notifications.length === 0
              ? emptyComponent
              : notifications.map(renderItem)
            }
            <View style={{ height: 40 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
        ListHeaderComponent={headerSection(insets.top + 12)}
        renderItem={({ item }) => renderItem(item)}
        ListEmptyComponent={emptyComponent}
      />
    </View>
  );
}
