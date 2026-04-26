import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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
import { PostCard } from "@/components/PostCard";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useXP } from "@/context/XPContext";
import { useColors } from "@/hooks/useColors";

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "만";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function FandomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { fandoms, posts, followedFandomIds, toggleFollow } = useFandom();
  const { t } = useLanguage();
  const { earnXP } = useXP();
  const fandom = fandoms.find((f) => f.id === id);
  const fandomPosts = posts.filter((p) => p.fandomId === id);
  const isFollowing = followedFandomIds.includes(id ?? "");
  const isWeb = Platform.OS === "web";

  if (!fandom) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>{t.fandomNotFound}</Text>
      </View>
    );
  }

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isFollowing) earnXP("JOIN_FANDOM");
    toggleFollow(fandom.id);
  };

  const genreLabel = t.categories[fandom.genre] ?? fandom.genre;
  const genreEmoji = (t as any).categoryEmojis?.[fandom.genre] ?? "🎵";
  const artistPosts = fandomPosts.filter((p) => p.isArtistPost);
  const fanPosts = fandomPosts.filter((p) => !p.isArtistPost);

  return (
    <FlatList
      data={fandomPosts}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: isWeb ? 24 : insets.bottom + 100 }}
      ListHeaderComponent={
        <>
          {/* Hero section */}
          <View style={{ backgroundColor: fandom.color, position: "relative", overflow: "hidden" }}>
            {/* Pattern */}
            <View style={[StyleSheet.absoluteFillObject, { opacity: 0.1 }]}>
              {[...Array(20)].map((_, i) => (
                <View key={i} style={{
                  position: "absolute",
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#ffffff",
                  top: (i % 5) * 50 + 20,
                  left: Math.floor(i / 5) * 90 + 20,
                }} />
              ))}
            </View>

            {/* Back button */}
            <Pressable
              style={{
                position: "absolute",
                top: isWeb ? 20 : insets.top + 14,
                left: 16,
                zIndex: 10,
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "rgba(0,0,0,0.3)",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={20} color="#ffffff" />
            </Pressable>

            {/* Hero content */}
            <View style={{ paddingTop: isWeb ? 60 : insets.top + 60, paddingBottom: 30, paddingHorizontal: 20, alignItems: "center" }}>
              <View style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: "rgba(255,255,255,0.25)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.5)",
              }}>
                <Text style={{ fontSize: 46 }}>{fandom.emoji}</Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 26, fontWeight: "900", color: "#ffffff" }}>
                  {fandom.artistName}
                </Text>
                {fandom.isVerified && (
                  <View style={{ backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 12, padding: 4 }}>
                    <Feather name="check" size={13} color="#ffffff" />
                  </View>
                )}
              </View>

              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "rgba(0,0,0,0.25)",
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 5,
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 13 }}>{genreEmoji}</Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>{genreLabel}</Text>
              </View>

              {/* Stats row */}
              <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: "#ffffff" }}>{formatCount(fandom.memberCount)}</Text>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{t.members}</Text>
                </View>
                <View style={{ width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.3)" }} />
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: "#ffffff" }}>{formatCount(fandom.postCount)}</Text>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{t.posts}</Text>
                </View>
                <View style={{ width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.3)" }} />
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: "#ffffff" }}>{artistPosts.length}</Text>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>아티스트 글</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info section */}
          <View style={{ padding: 20 }}>
            {/* Description */}
            <Text style={{ fontSize: 14, color: colors.mutedForeground, lineHeight: 22, marginBottom: 14 }}>
              {fandom.description}
            </Text>

            {/* Tags */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {fandom.tags.map((tag) => (
                <View key={tag} style={{
                  backgroundColor: fandom.color + "18",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: fandom.color + "30",
                }}>
                  <Text style={{ fontSize: 13, fontWeight: "500", color: fandom.color }}>#{tag}</Text>
                </View>
              ))}
            </View>

            {/* Recent activity */}
            {fandom.recentActivity && (
              <View style={{
                backgroundColor: fandom.color + "12",
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                borderWidth: 1,
                borderColor: fandom.color + "25",
              }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: fandom.color }} />
                <Text style={{ fontSize: 13, color: fandom.color, fontWeight: "500", flex: 1 }}>
                  {fandom.recentActivity}
                </Text>
              </View>
            )}

            {/* Follow button */}
            <Pressable
              style={[{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 28,
                paddingVertical: 15,
                marginBottom: 24,
              }, isFollowing
                ? { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.border }
                : { backgroundColor: fandom.color }
              ]}
              onPress={handleFollow}
            >
              <Feather
                name={isFollowing ? "check" : "user-plus"}
                size={16}
                color={isFollowing ? colors.mutedForeground : "#ffffff"}
              />
              <Text style={{
                fontSize: 15,
                fontWeight: "700",
                color: isFollowing ? colors.mutedForeground : "#ffffff",
              }}>
                {isFollowing ? "✓ 팔로잉" : t.joinCommunity}
              </Text>
            </Pressable>

            {/* Section header */}
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.foreground }}>
              💬 소통 ({fandomPosts.length})
            </Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 16 }}>
          <PostCard post={item} />
        </View>
      )}
      ListEmptyComponent={
        <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
          <Text style={{ fontSize: 48 }}>💌</Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{t.noPostsInFandom}</Text>
        </View>
      }
    />
  );
}
