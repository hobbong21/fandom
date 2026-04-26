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
  StyleSheet,
  Text,
  View,
  useColorScheme,
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
            <Text style={styles.brandIconText}>★</Text>
          </View>
          <Text style={[styles.brandName, { color: colors.primary }]}>{t.appName}</Text>
        </View>

        {/* User card */}
        {user && (
          <View style={[styles.userCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.userAvatar, { backgroundColor: tierInfo.color + "33", borderColor: tierInfo.color }]}>
              <Text style={[styles.userAvatarText, { color: tierInfo.color }]}>
                {user.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userCardInfo}>
              <Text style={[styles.userCardName, { color: colors.foreground }]} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={[styles.userCardTier, { color: tierInfo.color }]}>
                {tierInfo.emoji} {totalXP.toLocaleString()} XP
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Nav items */}
      <View style={styles.navItems}>
        {navItems.map((item) => {
          const active = isActive(item.name);
          return (
            <Pressable
              key={item.name}
              style={[
                styles.navItem,
                active && { backgroundColor: colors.primary + "18" },
              ]}
              onPress={() => router.push(item.name === "index" ? "/" : `/${item.name}`)}
            >
              <View style={styles.navIconWrap}>
                <Feather
                  name={item.icon as any}
                  size={20}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                {item.badge != null && item.badge > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.notification }]}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.navLabel, { color: active ? colors.primary : colors.mutedForeground, fontWeight: active ? "700" : "500" }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Footer CTA */}
      <View style={[styles.sidebarFooter, { borderTopColor: colors.border }]}>
        <Pressable
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/explore")}
        >
          <Feather name="compass" size={16} color={colors.primaryForeground} />
          <Text style={[styles.ctaBtnText, { color: colors.primaryForeground }]}>
            {t.exploreFandoms}
          </Text>
        </Pressable>
      </View>
    </View>
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
          height: 84,
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
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house" tintColor={color} size={24} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t.explore,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="safari" tintColor={color} size={24} />
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
          tabBarBadgeStyle: { backgroundColor: colors.notification },
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="bell" tintColor={color} size={24} />
            ) : (
              <Feather name="bell" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t.profile,
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.circle" tintColor={color} size={24} />
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
    width: 240,
    borderRightWidth: 1,
    flexDirection: "column",
  },
  sidebarTop: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  sidebarBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  brandIconText: {
    fontSize: 18,
    color: "#ffffff",
  },
  brandName: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  userCardInfo: {
    flex: 1,
    gap: 2,
  },
  userCardName: {
    fontSize: 14,
    fontWeight: "600",
  },
  userCardTier: {
    fontSize: 12,
    fontWeight: "500",
  },
  navItems: {
    flex: 1,
    padding: 8,
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  navIconWrap: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "700",
  },
  navLabel: {
    fontSize: 15,
  },
  sidebarFooter: {
    padding: 12,
    borderTopWidth: 1,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  webContent: {
    flex: 1,
    overflow: "hidden",
  },
});
