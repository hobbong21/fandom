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
import { ChonNetworkCard } from "@/components/ChonNetworkCard";
import { FandomCard } from "@/components/FandomCard";
import { FanTierBadge } from "@/components/FanTierBadge";
import { PostCard } from "@/components/PostCard";
import { XPProgressBar } from "@/components/XPProgressBar";
import { getTierInfo } from "@/constants/fanTiers";
import { useAuth } from "@/context/AuthContext";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useXP } from "@/context/XPContext";
import { useColors } from "@/hooks/useColors";
import { useIsDesktop } from "@/hooks/useIsDesktop";

type Tab = "posts" | "saved" | "fandoms" | "network";

const WEB_MAX_WIDTH = 680;

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { posts, savedPosts, followedFandomIds, fandoms } = useFandom();
  const { t, language, toggleLanguage } = useLanguage();
  const { totalXP, chonConnections } = useXP();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const isWeb = useIsDesktop();

  const tierInfo = getTierInfo(totalXP);

  const myPosts = posts.filter((p) => p.authorName === (user?.name ?? ""));
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
  const profileTabs: { key: Tab; label: string; icon: string }[] = [
    { key: "posts", label: t.posts, icon: "file-text" },
    { key: "saved", label: t.saved, icon: "bookmark" },
    { key: "fandoms", label: t.fandoms, icon: "users" },
    { key: "network", label: language === "ko" ? "촌수" : "Network", icon: "share-2" },
  ];

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const content = (
    <>
      <View style={[styles.header, { paddingTop: isWeb ? 28 : 8 }]}>
        <Text style={styles.title}>{t.profileTitle}</Text>
        <View style={styles.headerActions}>
          {isWeb && (
            <Pressable style={styles.langToggle} onPress={toggleLanguage}>
              <Feather name="globe" size={14} color={colors.primary} />
              <Text style={styles.langToggleText}>{language === "ko" ? "EN" : "한국어"}</Text>
            </Pressable>
          )}
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={16} color={colors.destructive} />
          </Pressable>
        </View>
      </View>

      <View style={styles.avatarSection}>
        <View style={[styles.avatarWrapper, { borderColor: tierInfo.color }]}>
          <View style={[styles.avatar, { backgroundColor: tierInfo.color }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.tierBadgeFloating}>
            <FanTierBadge tier={tierInfo.tier} size="sm" showLabel={false} />
          </View>
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
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{nickname || user?.name}</Text>
              <FanTierBadge tier={tierInfo.tier} size="sm" />
            </View>
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

        <View style={[styles.xpCard, { backgroundColor: colors.card, borderColor: tierInfo.color + "40" }]}>
          <Text style={[styles.xpCardTitle, { color: colors.foreground }]}>
            {language === "ko" ? "🎮 내 팬 등급" : "🎮 My Fan Tier"}
          </Text>
          <XPProgressBar xp={totalXP} />
          <View style={styles.xpHints}>
            {[
              { icon: "✏️", text: t.xpForPost },
              { icon: "💬", text: t.xpForComment },
              { icon: "❤️", text: t.xpForLike },
              { icon: "🏠", text: t.xpForJoin },
            ].map((hint) => (
              <View key={hint.text} style={styles.xpHintRow}>
                <Text style={styles.xpHintIcon}>{hint.icon}</Text>
                <Text style={[styles.xpHintText, { color: colors.mutedForeground }]}>{hint.text}</Text>
              </View>
            ))}
          </View>
        </View>

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
            <Text style={styles.statNum}>{chonConnections.filter((c) => c.degree === 1).length}</Text>
            <Text style={styles.statLabel}>{language === "ko" ? "1촌" : "1st"}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: tierInfo.color }]}>{totalXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>XP</Text>
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
            <Feather
              name={tab.icon as any}
              size={14}
              color={activeTab === tab.key ? colors.foreground : colors.mutedForeground}
            />
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
      {activeTab === "network" && (
        <ChonNetworkCard connections={chonConnections} />
      )}
      <View style={{ height: 40 }} />
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isWeb ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.webScrollOuter}
        >
          <View style={styles.webInner}>
            {content}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        >
          {content}
        </ScrollView>
      )}
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
    webScrollOuter: {
      flexGrow: 1,
    },
    webInner: {
      maxWidth: WEB_MAX_WIDTH,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    scroll: { paddingHorizontal: 16 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    avatarSection: { alignItems: "center", paddingVertical: 20, gap: 12 },
    avatarWrapper: {
      position: "relative",
      width: 84,
      height: 84,
      borderRadius: 42,
      borderWidth: 3,
      alignItems: "center",
      justifyContent: "center",
    },
    avatar: {
      width: 76,
      height: 76,
      borderRadius: 38,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 28, fontWeight: "700" as const, color: "#fff" },
    tierBadgeFloating: {
      position: "absolute",
      bottom: -2,
      right: -4,
    },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" },
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
    xpCard: {
      width: "100%",
      borderRadius: 16,
      borderWidth: 1.5,
      padding: 16,
      gap: 10,
    },
    xpCardTitle: { fontSize: 15, fontWeight: "700" as const },
    xpHints: { gap: 4, marginTop: 4 },
    xpHintRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    xpHintIcon: { fontSize: 13, width: 20 },
    xpHintText: { fontSize: 12 },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      width: "100%",
    },
    stat: { flex: 1, alignItems: "center", gap: 2 },
    statNum: { fontSize: 18, fontWeight: "700" as const, color: colors.foreground },
    statLabel: { fontSize: 11, color: colors.mutedForeground },
    statDivider: { width: 1, height: 30, backgroundColor: colors.border },
    tabRow: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: 14,
      padding: 4,
      marginBottom: 16,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center",
      borderRadius: 10,
      flexDirection: "row",
      justifyContent: "center",
      gap: 4,
    },
    tabBtnActive: {
      backgroundColor: colors.background,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
    tabText: { fontSize: 12, fontWeight: "500" as const, color: colors.mutedForeground },
    tabTextActive: { fontWeight: "700" as const, color: colors.foreground },
  });
