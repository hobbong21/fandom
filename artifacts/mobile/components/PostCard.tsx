import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
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
  const { likedPosts, savedPosts, toggleLike, toggleSave, fandoms } = useFandom();
  const { earnXP } = useXP();
  const isLiked = likedPosts.includes(post.id);
  const isSaved = savedPosts.includes(post.id);

  const fandom = fandoms.find((f) => f.id === post.fandomId);
  const artistColor = fandom?.color ?? colors.primary;
  const isArtist = post.isArtistPost === true;

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isLiked) earnXP("LIKE_POST");
    toggleLike(post.id);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSave(post.id);
  };

  return (
    <Pressable
      style={({ pressed }) => [{
        backgroundColor: colors.card,
        borderRadius: 18,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: isArtist ? 1.5 : 1,
        borderColor: isArtist ? artistColor + "55" : colors.border,
        opacity: pressed ? 0.93 : 1,
      }]}
      onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
    >
      {/* Artist accent stripe */}
      {isArtist && (
        <View style={{ height: 3, backgroundColor: artistColor }} />
      )}

      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <View style={[{
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
          }, isArtist
            ? { backgroundColor: artistColor, borderWidth: 2, borderColor: artistColor + "50" }
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

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }} numberOfLines={1}>
                {post.authorName}
              </Text>
              {isArtist && (
                <View style={{
                  backgroundColor: artistColor,
                  borderRadius: 6,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
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
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 3,
                }}>
                  <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#fff" }} />
                  <Text style={{ fontSize: 10, color: "#ffffff", fontWeight: "800" }}>LIVE</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
              {fandom && (
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: fandom.color,
                }} />
              )}
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{post.fandomName}</Text>
              <Text style={{ fontSize: 11, color: colors.border }}>·</Text>
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{post.timeAgo}</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={{
          fontSize: compact ? 14 : 16,
          fontWeight: "700",
          color: colors.foreground,
          lineHeight: 23,
          marginBottom: compact ? 0 : 7,
        }} numberOfLines={compact ? 2 : 3}>
          {post.title}
        </Text>

        {!compact && (
          <Text style={{
            fontSize: 14,
            color: colors.mutedForeground,
            lineHeight: 21,
            marginBottom: post.tags.length > 0 ? 10 : 12,
          }} numberOfLines={3}>
            {post.content}
          </Text>
        )}

        {/* Tags */}
        {!compact && post.tags.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {post.tags.map((tag) => (
              <View key={tag} style={{
                backgroundColor: isArtist ? artistColor + "12" : colors.muted,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                borderWidth: isArtist ? 1 : 0,
                borderColor: isArtist ? artistColor + "25" : "transparent",
              }}>
                <Text style={{
                  fontSize: 11,
                  color: isArtist ? artistColor : colors.mutedForeground,
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
          gap: 18,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 11,
          marginTop: compact ? 10 : 0,
          alignItems: "center",
        }}>
          <Pressable
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            onPress={handleLike}
          >
            <View style={[{
              width: 30,
              height: 30,
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
            }, isLiked
              ? { backgroundColor: "#f472b6" + "20" }
              : { backgroundColor: colors.muted }
            ]}>
              <Feather
                name="heart"
                size={14}
                color={isLiked ? "#f472b6" : colors.mutedForeground}
              />
            </View>
            <Text style={{
              fontSize: 13,
              fontWeight: "600",
              color: isLiked ? "#f472b6" : colors.mutedForeground,
            }}>
              {formatCount(post.likes + (isLiked ? 1 : 0))}
            </Text>
          </Pressable>

          <Pressable
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
          >
            <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.muted }}>
              <Feather name="message-circle" size={14} color={colors.mutedForeground} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>
              {formatCount(post.comments)}
            </Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          <Pressable onPress={handleSave}>
            <View style={[{
              width: 30,
              height: 30,
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
            }, isSaved
              ? { backgroundColor: colors.primary + "18" }
              : { backgroundColor: colors.muted }
            ]}>
              <Feather
                name={isSaved ? "bookmark" : "bookmark"}
                size={14}
                color={isSaved ? colors.primary : colors.mutedForeground}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
