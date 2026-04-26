import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs, router, usePathname } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useXP } from "@/context/XPContext";
import { getTierInfo } from "@/constants/fanTiers";

function NativeTabLayout() {
  const { t } = useLanguage();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>{t.home}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Icon sf={{ default: "safari", selected: "safari.fill" }} />
        <Label>{t.explore}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notifications">
        <Icon sf={{ default: "bell", selected: "bell.fill" }} />
        <Label>{t.notifications}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
        <Label>{t.profile}</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

type NavItem = { name: string; icon: string; label: string; badge?: number };

function WebSidebar({ navItems }: { navItems: NavItem[] }) {
  const colors = useColors();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { totalXP } = useXP();
  const pathname = usePathname();
  const tierInfo = getTierInfo(totalXP);

  const isActive = (name: string) => {
    if (name === "index") return pathname === "/" || pathname === "/(tabs)";
    return pathname.includes(name);
  };

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
      {/* Branding */}
      <View style={[styles.sidebarTop, { borderBottomColor: colors.border }]}>
        <View style={styles.sidebarBrand}>
          <View style={[styles.brandIcon, { backgroundColor: colors.primary }]}>
            <Text style={{ fontSize: 20 }}>🎤</Text>
          </View>
          <View>
            <Text style={[styles.brandName, { color: colors.primary }]}>{t.appName}</Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 0 }}>
              {(t as any).appTagline}
            </Text>
          </View>
        </View>

        {user && (
          <Pressable
            style={[styles.userCard, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => router.push("/profile")}
          >
            <View style={[styles.userAvatar, { backgroundColor: tierInfo.color + "22", borderColor: tierInfo.color }]}>
              <Text style={[styles.userAvatarText, { color: tierInfo.color }]}>
                {user.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.userCardName, { color: colors.foreground }]} numberOfLines={1}>
                {user.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={{ fontSize: 11 }}>{tierInfo.emoji}</Text>
                <Text style={{ fontSize: 11, color: tierInfo.color, fontWeight: "600" }}>
                  {tierInfo.name}
                </Text>
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                  · {totalXP.toLocaleString()} XP
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* Nav items */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.navItems}>
          {navItems.map((item) => {
            const active = isActive(item.name);
            return (
              <Pressable
                key={item.name}
                style={[
                  styles.navItem,
                  active
                    ? { backgroundColor: colors.primary + "15" }
                    : {},
                ]}
                onPress={() => router.push(item.name === "index" ? "/" : `/${item.name}`)}
              >
                <View style={[styles.navIconWrap, {
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: active ? colors.primary + "20" : colors.muted,
                }]}>
                  <Feather
                    name={item.icon as any}
                    size={18}
                    color={active ? colors.primary : colors.mutedForeground}
                  />
                  {item.badge != null && item.badge > 0 && (
                    <View style={[styles.badge, { backgroundColor: "#ef4444" }]}>
                      <Text style={styles.badgeText}>{item.badge > 9 ? "9+" : item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.navLabel, {
                  color: active ? colors.foreground : colors.mutedForeground,
                  fontWeight: active ? "700" : "400",
                }]}>
                  {item.label}
                </Text>
                {active && (
                  <View style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.sidebarFooter, { borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/explore")}
        >
          <Feather name="compass" size={15} color="#ffffff" />
          <Text style={{ fontSize: 14, fontWeight: "700", color: "#ffffff" }}>
            {t.exploreFandoms}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function WebRightPanel() {
  const colors = useColors();
  const { fandoms, followedFandomIds, posts } = useFandom();

  const livePosts = posts.filter((p) => p.isLive);
  const followedArtists = fandoms.filter((f) => followedFandomIds.includes(f.id));
  const suggestedArtists = fandoms.filter((f) => !followedFandomIds.includes(f.id)).slice(0, 3);
  const upcomingEvents = followedArtists
    .filter((f) => f.profile.upcomingEvent)
    .slice(0, 2);

  function formatCount(n: number): string {
    if (n >= 10000) return (n / 10000).toFixed(1) + "만";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  }

  return (
    <ScrollView
      style={[styles.rightPanel, { borderLeftColor: colors.border }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
    >
      {/* LIVE NOW */}
      {livePosts.length > 0 && (
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" }} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }}>지금 LIVE</Text>
          </View>
          {livePosts.map((p) => (
            <Pressable
              key={p.id}
              style={{
                backgroundColor: "#ef4444" + "10",
                borderRadius: 14,
                padding: 12,
                borderWidth: 1,
                borderColor: "#ef4444" + "30",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
              onPress={() => router.push({ pathname: "/post/[id]", params: { id: p.id } })}
            >
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#ef4444" + "22",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#ef4444" }}>
                  {p.authorAvatar.slice(0, 1)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#ef4444", marginBottom: 1 }}>
                  🔴 {p.authorName}
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }} numberOfLines={1}>
                  {p.title}
                </Text>
              </View>
              <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <Feather name="calendar" size={13} color={colors.foreground} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }}>예정된 이벤트</Text>
          </View>
          {upcomingEvents.map((f) => (
            <Pressable
              key={f.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 8,
                borderLeftWidth: 3,
                borderLeftColor: f.color,
              }}
              onPress={() => router.push({ pathname: "/fandom/[id]", params: { id: f.id } })}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 5 }}>
                <Text style={{ fontSize: 14 }}>{f.emoji}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }}>{f.artistName}</Text>
              </View>
              <Text style={{ fontSize: 12, color: colors.foreground, fontWeight: "600", marginBottom: 3 }} numberOfLines={1}>
                {f.profile.upcomingEvent!.title}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                <Text style={{ fontSize: 11, color: colors.mutedForeground }} numberOfLines={1}>
                  {f.profile.upcomingEvent!.date}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Suggested Artists */}
      {suggestedArtists.length > 0 && (
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <Feather name="users" size={13} color={colors.foreground} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }}>추천 아티스트</Text>
          </View>
          {suggestedArtists.map((f) => (
            <Pressable
              key={f.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                padding: 12,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
              onPress={() => router.push({ pathname: "/fandom/[id]", params: { id: f.id } })}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: f.color + "22",
                borderWidth: 1.5,
                borderColor: f.color + "44",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{ fontSize: 18 }}>{f.emoji}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }} numberOfLines={1}>
                  {f.artistName}
                </Text>
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                  팬 {formatCount(f.memberCount)}명
                </Text>
              </View>
              <View style={{ backgroundColor: f.color, borderRadius: 16, paddingHorizontal: 11, paddingVertical: 5 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>팔로우</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* App info footer */}
      <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Text style={{ fontSize: 11, color: colors.mutedForeground, lineHeight: 18 }}>
          스타링 · 아티스트와 팬이 직접 소통하는 공간
        </Text>
        <Text style={{ fontSize: 10, color: colors.mutedForeground + "88", marginTop: 4 }}>
          © 2025 Starling
        </Text>
      </View>
    </ScrollView>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const { t } = useLanguage();
  const { unreadCount } = useFandom();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const { width } = useWindowDimensions();
  const showRightPanel = width > 1120;

  const navItems: NavItem[] = [
    { name: "index", icon: "home", label: t.home },
    { name: "explore", icon: "compass", label: t.explore },
    { name: "notifications", icon: "bell", label: t.notifications, badge: unreadCount },
    { name: "profile", icon: "user", label: t.profile },
  ];

  if (isWeb) {
    return (
      <View style={styles.webRoot}>
        <WebSidebar navItems={navItems} />
        <View style={styles.webContent}>
          <Tabs
            screenOptions={{
              tabBarStyle: { display: "none" },
              headerShown: false,
            }}
          >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="explore" />
            <Tabs.Screen name="notifications" />
            <Tabs.Screen name="profile" />
          </Tabs>
        </View>
        {showRightPanel && <WebRightPanel />}
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: 82,
          paddingBottom: 10,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "house.fill" : "house"} tintColor={color} size={24} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t.explore,
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "safari.fill" : "safari"} tintColor={color} size={24} />
            ) : (
              <Feather name="compass" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: t.notifications,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: "#ef4444", fontSize: 10 },
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "bell.fill" : "bell"} tintColor={color} size={24} />
            ) : (
              <Feather name="bell" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "person.circle.fill" : "person.circle"} tintColor={color} size={24} />
            ) : (
              <Feather name="user" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  webRoot: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    flexDirection: "column",
  },
  sidebarTop: {
    padding: 18,
    borderBottomWidth: 1,
    gap: 14,
  },
  sidebarBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: "800",
  },
  navItems: {
    padding: 10,
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  navIconWrap: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "800",
  },
  navLabel: {
    fontSize: 14,
  },
  sidebarFooter: {
    padding: 14,
    borderTopWidth: 1,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  webContent: {
    flex: 1,
    overflow: "hidden",
  },
  rightPanel: {
    width: 300,
    borderLeftWidth: 1,
  },
});
