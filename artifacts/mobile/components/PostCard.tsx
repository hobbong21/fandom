import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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

const TIER_STYLES: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  꽃밭: { emoji: "🌺", label: "꽃밭", color: "#ec4899", bg: "#fce7f3" },
  한송이: { emoji: "🌸", label: "한송이", color: "#f472b6", bg: "#fdf2f8" },
  새싹: { emoji: "🌱", label: "새싹", color: "#10b981", bg: "#ecfdf5" },
};

function deriveAuthorTier(authorName: string): keyof typeof TIER_STYLES {
  const code = authorName.charCodeAt(authorName.length - 1);
  if (code % 3 === 0) return "꽃밭";
  if (code % 3 === 1) return "한송이";
  return "새싹";
}

function deriveAuthorLevel(authorName: string): number {
  let hash = 0;
  for (let i = 0; i < authorName.length; i++) hash += authorName.charCodeAt(i);
  return (hash % 80) + 10;
}

export function PostCard({ post, compact = false }: PostCardProps) {
  const colors = useColors();
  const { likedPosts, savedPosts, toggleLike, toggleSave, fandoms } = useFandom();
  const { earnXP } = useXP();
  const isLiked = likedPosts.includes(post.id);
  const isSaved = savedPosts.includes(post.id);
  const [songSent, setSongSent] = useState(false);

  const fandom = fandoms.find((f) => f.id === post.fandomId);
  const artistColor = fandom?.color ?? colors.primary;
  const isArtist = post.isArtistPost === true;

  const authorTier = deriveAuthorTier(post.authorName);
  const authorLevel = deriveAuthorLevel(post.authorName);
  const tierStyle = TIER_STYLES[authorTier];
  const isDark = colors.background === "#09090b" || colors.background.startsWith("#0");

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isLiked) earnXP("LIKE_POST");
    toggleLike(post.id);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSave(post.id);
  };

  const handleSong = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSongSent((v) => !v);
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
          {/* Avatar with tier ring */}
          <View style={{ position: "relative" }}>
            <View style={[{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
            }, isArtist
              ? { backgroundColor: artistColor, borderWidth: 2.5, borderColor: artistColor + "60" }
              : { backgroundColor: isDark ? tierStyle.color + "22" : tierStyle.bg, borderWidth: 2, borderColor: tierStyle.color + "50" }
            ]}>
              <Text style={{
                fontSize: 15,
                fontWeight: "800",
                color: isArtist ? "#ffffff" : tierStyle.color,
              }}>
                {post.authorAvatar.slice(0, 2)}
              </Text>
            </View>
            {/* Tier mini-badge */}
            {!isArtist && (
              <View style={{
                position: "absolute", bottom: -3, right: -3,
                backgroundColor: isDark ? "#1e1e2e" : "#ffffff",
                borderRadius: 8, width: 16, height: 16,
                alignItems: "center", justifyContent: "center",
                borderWidth: 1, borderColor: colors.border,
              }}>
                <Text style={{ fontSize: 9 }}>{tierStyle.emoji}</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }} numberOfLines={1}>
                {post.authorName}
              </Text>

              {/* OFFICIAL badge for artists */}
              {isArtist && (
                <View style={{
                  backgroundColor: artistColor,
                  borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2,
                  flexDirection: "row", alignItems: "center", gap: 3,
                }}>
                  <Feather name="check" size={9} color="#ffffff" />
                  <Text style={{ fontSize: 10, color: "#ffffff", fontWeight: "800", letterSpacing: 0.3 }}>OFFICIAL</Text>
                </View>
              )}

              {/* Fan tier badge (non-artist) */}
              {!isArtist && (
                <View style={{
                  backgroundColor: isDark ? tierStyle.color + "22" : tierStyle.bg,
                  borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1,
                  flexDirection: "row", alignItems: "center", gap: 2,
                  borderWidth: 1, borderColor: tierStyle.color + "30",
                }}>
                  <Text style={{ fontSize: 9 }}>{tierStyle.emoji}</Text>
                  <Text style={{ fontSize: 10, color: tierStyle.color, fontWeight: "700" }}>{tierStyle.label}</Text>
                </View>
              )}

              {post.isLive && (
                <View style={{
                  backgroundColor: "#ef4444", borderRadius: 6,
                  paddingHorizontal: 7, paddingVertical: 2,
                  flexDirection: "row", alignItems: "center", gap: 3,
                }}>
                  <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#fff" }} />
                  <Text style={{ fontSize: 10, color: "#ffffff", fontWeight: "800" }}>LIVE</Text>
                </View>
              )}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
              {/* Level badge */}
              {!isArtist && (
                <View style={{
                  backgroundColor: colors.muted, borderRadius: 5,
                  paddingHorizontal: 5, paddingVertical: 1,
                }}>
                  <Text style={{ fontSize: 9, color: colors.mutedForeground, fontWeight: "600" }}>
                    Lv.{authorLevel}
                  </Text>
                </View>
              )}
              {fandom && (
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: fandom.color }} />
              )}
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{post.fandomName}</Text>
              <Text style={{ fontSize: 11, color: colors.border }}>·</Text>
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{post.timeAgo}</Text>
            </View>
          </View>

          {/* Category chip */}
          {post.tags.length > 0 && (
            <View style={{
              backgroundColor: colors.muted, borderRadius: 8,
              paddingHorizontal: 8, paddingVertical: 4,
            }}>
              <Text style={{ fontSize: 10, color: colors.mutedForeground, fontWeight: "600" }}>
                {post.tags[0]}
              </Text>
            </View>
          )}
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
            marginBottom: post.tags.length > 1 ? 10 : 12,
          }} numberOfLines={3}>
            {post.content}
          </Text>
        )}

        {/* Secondary tags */}
        {!compact && post.tags.length > 1 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {post.tags.slice(1).map((tag) => (
              <View key={tag} style={{
                backgroundColor: isArtist ? artistColor + "12" : colors.muted,
                paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
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
          flexDirection: "row", gap: 14,
          borderTopWidth: 1, borderTopColor: colors.border,
          paddingTop: 11, marginTop: compact ? 10 : 0, alignItems: "center",
        }}>
          {/* Like */}
          <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 5 }} onPress={handleLike}>
            <View style={[{
              width: 30, height: 30, borderRadius: 15,
              alignItems: "center", justifyContent: "center",
            }, isLiked
              ? { backgroundColor: "#f472b620" }
              : { backgroundColor: colors.muted }
            ]}>
              <Feather name="heart" size={14} color={isLiked ? "#f472b6" : colors.mutedForeground} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: isLiked ? "#f472b6" : colors.mutedForeground }}>
              {formatCount(post.likes + (isLiked ? 1 : 0))}
            </Text>
          </Pressable>

          {/* Comment */}
          <Pressable
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
          >
            <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.muted }}>
              <Feather name="message-circle" size={14} color={colors.mutedForeground} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>
              {formatCount(post.comments)}
            </Text>
          </Pressable>

          {/* 🌹 송이 */}
          <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 5 }} onPress={handleSong}>
            <View style={[{
              width: 30, height: 30, borderRadius: 15,
              alignItems: "center", justifyContent: "center",
            }, songSent
              ? { backgroundColor: "#ec489920" }
              : { backgroundColor: colors.muted }
            ]}>
              <Text style={{ fontSize: 13 }}>🌹</Text>
            </View>
            {songSent && (
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#ec4899" }}>송이</Text>
            )}
          </Pressable>

          <View style={{ flex: 1 }} />

          {/* Save */}
          <Pressable onPress={handleSave}>
            <View style={[{
              width: 30, height: 30, borderRadius: 15,
              alignItems: "center", justifyContent: "center",
            }, isSaved
              ? { backgroundColor: colors.primary + "18" }
              : { backgroundColor: colors.muted }
            ]}>
              <Feather
                name="bookmark"
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
