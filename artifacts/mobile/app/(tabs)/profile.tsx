import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
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
import { useFandom } from "@/context/FandomContext";
import { useColors } from "@/hooks/useColors";

const PROFILE_TABS = ["Posts", "Saved", "Fandoms"];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts, fandoms, followedFandomIds, savedPosts, userProfile, updateProfile } = useFandom();
  const [activeTab, setActiveTab] = useState("Posts");
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editBio, setEditBio] = useState(userProfile.bio);
  const isWeb = Platform.OS === "web";

  const myPosts = posts.slice(0, 2);
  const mySaved = posts.filter((p) => savedPosts.includes(p.id));
  const myFandoms = fandoms.filter((f) => followedFandomIds.includes(f.id));

  const styles = makeStyles(colors);

  const handleSaveProfile = () => {
    updateProfile({ name: editName, bio: editBio });
    setEditing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 : insets.bottom + 100 }}
    >
      <View
        style={[
          styles.header,
          { paddingTop: isWeb ? 67 : insets.top + 12 },
        ]}
      >
        <Text style={styles.title}>Profile</Text>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => setEditing((e) => !e)}
        >
          <Feather name={editing ? "x" : "edit-2"} size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={styles.profileSection}>
        <View style={[styles.avatarLarge, { backgroundColor: colors.primary + "33" }]}>
          <Text style={[styles.avatarLargeText, { color: colors.primary }]}>
            {userProfile.avatar}
          </Text>
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <TextInput
              style={[styles.editInput, { color: colors.foreground, borderColor: colors.border }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Display name"
              placeholderTextColor={colors.mutedForeground}
            />
            <TextInput
              style={[styles.editInput, styles.editBio, { color: colors.foreground, borderColor: colors.border }]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Bio"
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
            <Pressable style={styles.saveBtn} onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileUsername}>@{userProfile.username}</Text>
            <Text style={styles.profileBio}>{userProfile.bio}</Text>
          </>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userProfile.postCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxBorder]}>
            <Text style={styles.statValue}>{userProfile.followerCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{userProfile.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {PROFILE_TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.tabContent}>
        {activeTab === "Posts" && (
          myPosts.length > 0 ? (
            myPosts.map((p) => <PostCard key={p.id} post={p} compact />)
          ) : (
            <View style={styles.empty}>
              <Feather name="file-text" size={36} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          )
        )}

        {activeTab === "Saved" && (
          mySaved.length > 0 ? (
            mySaved.map((p) => <PostCard key={p.id} post={p} compact />)
          ) : (
            <View style={styles.empty}>
              <Feather name="bookmark" size={36} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>No saved posts</Text>
            </View>
          )
        )}

        {activeTab === "Fandoms" && (
          myFandoms.length > 0 ? (
            myFandoms.map((f) => <FandomCard key={f.id} fandom={f} />)
          ) : (
            <View style={styles.empty}>
              <Feather name="star" size={36} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>No fandoms followed yet</Text>
            </View>
          )
        )}
      </View>
    </ScrollView>
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
    },
    title: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    settingsBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    profileSection: {
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    avatarLarge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    avatarLargeText: {
      fontSize: 32,
      fontWeight: "700" as const,
    },
    profileName: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 2,
    },
    profileUsername: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    profileBio: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 280,
      marginBottom: 20,
    },
    editForm: {
      width: "100%",
      gap: 10,
      marginBottom: 20,
    },
    editInput: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
    },
    editBio: {
      height: 80,
      textAlignVertical: "top",
    },
    saveBtn: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingVertical: 10,
      alignItems: "center",
    },
    saveBtnText: {
      color: colors.primaryForeground,
      fontWeight: "600" as const,
      fontSize: 15,
    },
    statsRow: {
      flexDirection: "row",
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: 16,
    },
    statBox: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
    },
    statBoxBorder: {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    tabsRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 12,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
    },
    tabBtnActive: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500" as const,
      color: colors.mutedForeground,
    },
    tabTextActive: {
      color: colors.primary,
      fontWeight: "600" as const,
    },
    tabContent: {
      paddingHorizontal: 16,
    },
    empty: {
      alignItems: "center",
      paddingVertical: 50,
      gap: 10,
    },
    emptyText: {
      fontSize: 15,
      color: colors.mutedForeground,
    },
  });
