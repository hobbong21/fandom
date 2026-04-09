import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PostCard } from "@/components/PostCard";
import { useFandom } from "@/context/FandomContext";
import { useColors } from "@/hooks/useColors";

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

const CATEGORY_LABELS: Record<string, string> = {
  anime: "애니메이션",
  gaming: "게임",
  fantasy: "판타지",
  movies: "영화",
  tv: "TV 드라마",
  comics: "만화",
  music: "음악",
};

export default function FandomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { fandoms, posts, followedFandomIds, toggleFollow } = useFandom();
  const fandom = fandoms.find((f) => f.id === id);
  const fandomPosts = posts.filter((p) => p.fandomId === id);
  const isFollowing = followedFandomIds.includes(id ?? "");
  const isWeb = Platform.OS === "web";
  const styles = makeStyles(colors);

  if (!fandom) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.notFound}>팬덤을 찾을 수 없습니다</Text>
      </View>
    );
  }

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFollow(fandom.id);
  };

  return (
    <FlatList
      data={fandomPosts}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: isWeb ? 34 : insets.bottom + 100 }}
      ListHeaderComponent={
        <>
          <View style={styles.hero}>
            <Image source={fandom.coverImage} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay} />
            <Pressable
              style={[styles.backBtn, { top: isWeb ? 67 : insets.top + 12 }]}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={20} color="#ffffff" />
            </Pressable>
            <View style={[styles.heroContent, { bottom: 20 }]}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {CATEGORY_LABELS[fandom.category] ?? fandom.category}
                </Text>
              </View>
              <Text style={styles.heroName}>{fandom.name}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{formatCount(fandom.memberCount)}</Text>
                <Text style={styles.statLabel}>멤버</Text>
              </View>
              <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
                <Text style={styles.statValue}>{formatCount(fandom.postCount)}</Text>
                <Text style={styles.statLabel}>게시글</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{fandom.tags.length}</Text>
                <Text style={styles.statLabel}>태그</Text>
              </View>
            </View>

            <Text style={styles.description}>{fandom.description}</Text>

            <View style={styles.tags}>
              {fandom.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
              onPress={handleFollow}
            >
              <Feather
                name={isFollowing ? "check" : "plus"}
                size={16}
                color={isFollowing ? colors.mutedForeground : colors.primaryForeground}
              />
              <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                {isFollowing ? "팔로잉" : "커뮤니티 가입"}
              </Text>
            </Pressable>

            <Text style={styles.postsHeader}>
              게시글 ({formatCount(fandomPosts.length)})
            </Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.postWrap}>
          <PostCard post={item} />
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Feather name="file-text" size={36} color={colors.mutedForeground} />
          <Text style={styles.emptyText}>아직 게시글이 없습니다</Text>
        </View>
      }
    />
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    notFound: {
      color: colors.mutedForeground,
      fontSize: 16,
    },
    hero: {
      height: 220,
      position: "relative",
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    backBtn: {
      position: "absolute",
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.4)",
      alignItems: "center",
      justifyContent: "center",
    },
    heroContent: {
      position: "absolute",
      left: 20,
      right: 20,
    },
    categoryBadge: {
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 6,
      alignSelf: "flex-start",
      marginBottom: 6,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: "700" as const,
      color: "#ffffff",
      letterSpacing: 0.5,
    },
    heroName: {
      fontSize: 26,
      fontWeight: "800" as const,
      color: "#ffffff",
    },
    infoSection: {
      padding: 20,
    },
    statsRow: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 16,
    },
    statBox: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
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
    description: {
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 22,
      marginBottom: 14,
    },
    tags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    tag: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
    },
    tagText: {
      fontSize: 13,
      fontWeight: "500" as const,
      color: colors.primary,
    },
    followBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: 24,
      paddingVertical: 12,
      marginBottom: 20,
    },
    followingBtn: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    followBtnText: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: colors.primaryForeground,
    },
    followingBtnText: {
      color: colors.mutedForeground,
    },
    postsHeader: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    postWrap: {
      paddingHorizontal: 16,
    },
    empty: {
      alignItems: "center",
      paddingVertical: 60,
      gap: 10,
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
  });
