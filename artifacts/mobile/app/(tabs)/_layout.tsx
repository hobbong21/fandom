import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, useColorScheme, View } from "react-native";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

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

function ClassicTabLayout() {
  const colors = useColors();
  const { t } = useLanguage();
  const { unreadCount } = useFandom();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  const webSidebarStyle = {
    width: 220,
    height: "100%" as const,
    backgroundColor: colors.tabBar,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    borderTopWidth: 0,
    paddingTop: 0,
    paddingBottom: 0,
  };

  const mobileSidebarStyle = {
    position: "absolute" as const,
    backgroundColor: isIOS ? "transparent" : colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 0,
    height: 84,
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarPosition: isWeb ? "left" : "bottom",
        tabBarLabelPosition: isWeb ? "beside-icon" : "below-icon",
        tabBarStyle: isWeb ? webSidebarStyle : mobileSidebarStyle,
        tabBarItemStyle: isWeb
          ? {
              justifyContent: "flex-start",
              paddingLeft: 20,
              height: 52,
              marginVertical: 2,
              borderRadius: 10,
              marginHorizontal: 8,
            }
          : {},
        tabBarLabelStyle: isWeb
          ? {
              fontSize: 15,
              fontWeight: "500",
              marginLeft: 4,
            }
          : {
              fontSize: 11,
            },
        tabBarBackground: () =>
          !isWeb && isIOS ? (
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
            isIOS && !isWeb ? (
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
            isIOS && !isWeb ? (
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
            isIOS && !isWeb ? (
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
            isIOS && !isWeb ? (
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
