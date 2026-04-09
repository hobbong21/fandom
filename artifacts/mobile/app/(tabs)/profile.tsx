import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FandomCard } from "@/components/FandomCard";
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

type Tab = "posts" | "saved" | "fandoms";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { posts, savedPosts, followedFandomIds, fandoms } = useFandom();
  const { t, language, toggleLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const isWeb = Platform.OS === "web";

  const myPosts = posts.filter((p) => p.author === (user?.name ?? ""));
  const savedPostItems = posts.filter((p) => savedPosts.includes(p.id));
  const followedFandoms = fandoms.filter((f) => followedFandomIds.includes(f.id));

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(t.logoutConfirm)) {
        logout().then(() => router.replace("/login"));
      }
    } else {
      Alert.alert(t.logout, t.logoutConfirm, [
        { text: t.cancel, style: "cancel" },
        {
          text: t.logout,
          style: "destructive",
          onPress: () => logout().then(() => router.replace("/login")),
        },
      ]);
    }
  };

  const styles = makeStyles(colors);
  const profileTabs: { key: Tab; label: string }[] = [
    { key: "posts", label: t.posts },
    { key: "saved", label: t.saved },
    { key: "fandoms", label: t.fandoms },
  ];

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 12 }]}>
        <Text style={styles.title}>{t.profileTitle}</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.langToggle} onPress={toggleLanguage}>
            <Feather name="globe" size={14} color={colors.primary} />
            <Text style={styles.langToggleText}>{language === "ko" ? "EN" : "한국어"}</Text>
          </Pressable>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={16} color={colors.destructive} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: isWeb ? 34 : insets.bottom + 100 },
        ]}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <TextInput
                style={[styles.editInput, { color: colors.foreground }]}
                value={nickname}
                onChangeText={setNickname}
                placeholder={t.nicknamePlaceholder}
                placeholderTextColor={colors.mutedForeground}
              />
              <TextInput
                style={[styles.editInput, styles.editTextarea, { color: colors.foreground }]}
                value={bio}
                onChangeText={setBio}
                placeholder={t.bioPlaceholder}
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
              />
              <Pressable style={styles.saveBtn} onPress={() => setEditing(false)}>
                <Text style={styles.saveBtnText}>{t.saveProfile}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>{nickname || user?.name}</Text>
              {bio.length > 0 && (
                <Text style={styles.userBio}>{bio}</Text>
              )}
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Pressable style={styles.editBtn} onPress={() => setEditing(true)}>
                <Feather name="edit-2" size={14} color={colors.primary} />
                <Text style={styles.editBtnText}>
                  {language === "ko" ? "프로필 편집" : "Edit Profile"}
                </Text>
              </Pressable>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{myPosts.length}</Text>
              <Text style={styles.statLabel}>{t.posts}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{followedFandoms.length}</Text>
              <Text style={styles.statLabel}>{t.fandoms}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLabel}>{t.following}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabRow}>
          {profileTabs.map((tab) => (
            <Pressable
              key={tab.key}
              style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "posts" && (
          myPosts.length > 0
            ? myPosts.map((p) => <PostCard key={p.id} post={p} />)
            : <EmptyState icon="file-text" text={t.noPostsYet} colors={colors} />
        )}
        {activeTab === "saved" && (
          savedPostItems.length > 0
            ? savedPostItems.map((p) => <PostCard key={p.id} post={p} />)
            : <EmptyState icon="bookmark" text={t.noSavedPosts} colors={colors} />
        )}
        {activeTab === "fandoms" && (
          followedFandoms.length > 0
            ? followedFandoms.map((f) => <FandomCard key={f.id} fandom={f} />)
            : <EmptyState icon="users" text={t.noFandomsYet} colors={colors} />
        )}
      </ScrollView>
    </View>
  );
}

function EmptyState({ icon, text, colors }: { icon: any; text: string; colors: any }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 40, gap: 10 }}>
      <Feather name={icon} size={36} color={colors.mutedForeground} />
      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{text}</Text>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
    langToggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.muted,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    langToggleText: { fontSize: 13, fontWeight: "600" as const, color: colors.primary },
    logoutBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: { paddingHorizontal: 16 },
    avatarSection: { alignItems: "center", paddingVertical: 20, gap: 12 },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 28, fontWeight: "700" as const, color: colors.primaryForeground },
    userInfo: { alignItems: "center", gap: 4 },
    displayName: { fontSize: 20, fontWeight: "700" as const, color: colors.foreground },
    userBio: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", maxWidth: 260 },
    userEmail: { fontSize: 13, color: colors.mutedForeground },
    editBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 6,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.muted,
    },
    editBtnText: { fontSize: 13, fontWeight: "600" as const, color: colors.primary },
    editForm: { width: "100%", gap: 10 },
    editInput: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
    },
    editTextarea: { minHeight: 80, textAlignVertical: "top" },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    saveBtnText: { color: colors.primaryForeground, fontWeight: "700" as const, fontSize: 15 },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      width: "100%",
    },
    stat: { flex: 1, alignItems: "center", gap: 2 },
    statNum: { fontSize: 20, fontWeight: "700" as const, color: colors.foreground },
    statLabel: { fontSize: 12, color: colors.mutedForeground },
    statDivider: { width: 1, height: 30, backgroundColor: colors.border },
    tabRow: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: 14,
      padding: 4,
      marginBottom: 16,
    },
    tabBtn: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 10 },
    tabBtnActive: {
      backgroundColor: colors.background,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    tabText: { fontSize: 14, fontWeight: "500" as const, color: colors.mutedForeground },
    tabTextActive: { fontWeight: "700" as const, color: colors.foreground },
  });
