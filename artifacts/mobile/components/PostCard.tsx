import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFandom } from "@/context/FandomContext";
import { useXP } from "@/context/XPContext";
import { useColors } from "@/hooks/useColors";
import type { Post } from "@/constants/data";

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "만";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function PostCard({ post, compact = false }: PostCardProps) {
  const colors = useColors();
  const { likedPosts, savedPosts, toggleLike, toggleSave } = useFandom();
  const { earnXP } = useXP();
  const isLiked = likedPosts.includes(post.id);
  const isSaved = savedPosts.includes(post.id);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isLiked) earnXP("LIKE_POST");
    toggleLike(post.id);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSave(post.id);
  };

  const isArtist = post.isArtistPost === true;

  return (
    <Pressable
      style={({ pressed }) => [{
        backgroundColor: colors.card,
        borderRadius: 18,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: isArtist ? 1.5 : 1,
        borderColor: isArtist ? colors.primary + "60" : colors.border,
        opacity: pressed ? 0.92 : 1,
      }]}
      onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
    >
      {/* Artist accent stripe */}
      {isArtist && (
        <View style={{ height: 3, backgroundColor: colors.primary }} />
      )}

      <View style={{ padding: 16 }}>
        {/* Header row */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* Avatar */}
            <View style={[{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
            }, isArtist
              ? { backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.primary + "40" }
              : { backgroundColor: colors.muted }
            ]}>
              <Text style={{
                fontSize: 14,
                fontWeight: "800",
                color: isArtist ? "#ffffff" : colors.foreground,
              }}>
                {post.authorAvatar.slice(0, 2)}
              </Text>
            </View>

            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>
                  {post.authorName}
                </Text>
                {isArtist && (
                  <View style={{
                    backgroundColor: colors.primary,
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3,
                  }}>
                    <Feather name="check" size={9} color="#ffffff" />
                    <Text style={{ fontSize: 10, color: "#ffffff", fontWeight: "700" }}>아티스트</Text>
                  </View>
                )}
                {post.isLive && (
                  <View style={{
                    backgroundColor: "#ef4444",
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                  }}>
                    <Text style={{ fontSize: 10, color: "#ffffff", fontWeight: "800" }}>🔴 LIVE</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{post.fandomName}</Text>
                <Text style={{ fontSize: 11, color: colors.border }}>·</Text>
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{post.timeAgo}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <Text style={{
          fontSize: compact ? 15 : 16,
          fontWeight: "700",
          color: colors.foreground,
          lineHeight: 23,
          marginBottom: compact ? 0 : 8,
        }} numberOfLines={compact ? 2 : 3}>
          {post.title}
        </Text>

        {!compact && (
          <Text style={{
            fontSize: 14,
            color: colors.mutedForeground,
            lineHeight: 21,
            marginBottom: 12,
          }} numberOfLines={3}>
            {post.content}
          </Text>
        )}

        {/* Tags */}
        {!compact && post.tags.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {post.tags.map((tag) => (
              <View key={tag} style={{
                backgroundColor: isArtist ? colors.primary + "15" : colors.muted,
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 8,
              }}>
                <Text style={{
                  fontSize: 11,
                  color: isArtist ? colors.primary : colors.mutedForeground,
                  fontWeight: "500",
                }}>
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={{
          flexDirection: "row",
          gap: 20,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 12,
          marginTop: compact ? 10 : 0,
        }}>
          <Pressable
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            onPress={handleLike}
          >
            <View style={[{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
            }, isLiked ? { backgroundColor: colors.accent + "20" } : { backgroundColor: colors.muted }]}>
              <Feather
                name="heart"
                size={15}
                color={isLiked ? colors.accent : colors.mutedForeground}
              />
            </View>
            <Text style={{
              fontSize: 13,
              fontWeight: "600",
              color: isLiked ? colors.accent : colors.mutedForeground,
            }}>
              {formatCount(post.likes + (isLiked ? 1 : 0))}
            </Text>
          </Pressable>

          <Pressable
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
          >
            <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.muted }}>
              <Feather name="message-circle" size={15} color={colors.mutedForeground} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>
              {formatCount(post.comments)}
            </Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          <Pressable
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            onPress={handleSave}
          >
            <View style={[{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
            }, isSaved ? { backgroundColor: colors.primary + "20" } : { backgroundColor: colors.muted }]}>
              <Feather
                name="bookmark"
                size={15}
                color={isSaved ? colors.primary : colors.mutedForeground}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
