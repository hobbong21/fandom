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
import { useLanguage } from "@/context/LanguageContext";
import { useXP } from "@/context/XPContext";
import { useColors } from "@/hooks/useColors";
import type { Fandom } from "@/constants/data";
import { ArtistAvatar } from "@/components/ArtistAvatar";

interface FandomCardProps {
  fandom: Fandom;
  variant?: "default" | "compact" | "featured";
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 10000) return (n / 10000).toFixed(1) + "만";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function FandomCard({ fandom, variant = "default" }: FandomCardProps) {
  const colors = useColors();
  const { followedFandomIds, toggleFollow } = useFandom();
  const { t } = useLanguage();
  const { earnXP } = useXP();
  const isFollowing = followedFandomIds.includes(fandom.id);

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isFollowing) earnXP("JOIN_FANDOM");
    toggleFollow(fandom.id);
  };

  const genreLabel = t.categories[fandom.genre] ?? fandom.genre;
  const genreEmoji = (t as any).categoryEmojis?.[fandom.genre] ?? "🎵";

  if (variant === "compact") {
    return (
      <Pressable
        style={({ pressed }) => [
          {
            width: 130,
            height: 130,
            borderRadius: 16,
            overflow: "hidden",
            marginRight: 10,
            opacity: pressed ? 0.88 : 1,
            backgroundColor: fandom.color + "22",
            borderWidth: 1.5,
            borderColor: fandom.color + "44",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
          },
        ]}
        onPress={() => router.push({ pathname: "/fandom/[id]", params: { id: fandom.id } })}
      >
        <ArtistAvatar avatarUrl={fandom.avatarUrl} emoji={fandom.emoji} size={64} backgroundColor={fandom.color + "30"} />
        <View style={{ height: 6 }} />
        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.foreground, textAlign: "center" }} numberOfLines={2}>
          {fandom.artistName}
        </Text>
        <View style={{ marginTop: 4, backgroundColor: fandom.color + "33", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2 }}>
          <Text style={{ fontSize: 10, color: fandom.color, fontWeight: "600" }}>{genreEmoji} {genreLabel}</Text>
        </View>
      </Pressable>
    );
  }

  if (variant === "featured") {
    return (
      <Pressable
        style={({ pressed }) => [
          {
            width: 200,
            borderRadius: 20,
            overflow: "hidden",
            marginRight: 12,
            opacity: pressed ? 0.92 : 1,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
        onPress={() => router.push({ pathname: "/fandom/[id]", params: { id: fandom.id } })}
      >
        {/* Gradient-like header */}
        <View style={{
          height: 100,
          backgroundColor: fandom.color,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          {/* Pattern background dots */}
          <View style={[StyleSheet.absoluteFillObject, { opacity: 0.15 }]}>
            {[...Array(12)].map((_, i) => (
              <View key={i} style={{
                position: "absolute",
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#ffffff",
                top: (i % 4) * 28 + 10,
                left: Math.floor(i / 4) * 68 + 16,
              }} />
            ))}
          </View>
          <ArtistAvatar avatarUrl={fandom.avatarUrl} emoji={fandom.emoji} size={72} backgroundColor="rgba(255,255,255,0.25)" borderWidth={2} borderColor="rgba(255,255,255,0.5)" />
          {fandom.isVerified && (
            <View style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.4)",
              borderRadius: 20,
              paddingHorizontal: 7,
              paddingVertical: 3,
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
            }}>
              <Feather name="check-circle" size={10} color="#ffffff" />
              <Text style={{ fontSize: 10, color: "#ffffff", fontWeight: "700" }}>공식</Text>
            </View>
          )}
        </View>

        <View style={{ padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: colors.foreground, flex: 1 }} numberOfLines={1}>
              {fandom.artistName}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
            <Text style={{ fontSize: 11 }}>{genreEmoji}</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, fontWeight: "500" }}>{genreLabel}</Text>
            <Text style={{ fontSize: 11, color: colors.border }}>·</Text>
            <Feather name="users" size={11} color={colors.mutedForeground} />
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{formatCount(fandom.memberCount)}</Text>
          </View>

          {fandom.recentActivity && (
            <View style={{
              backgroundColor: fandom.color + "15",
              borderRadius: 8,
              padding: 7,
              marginBottom: 10,
            }}>
              <Text style={{ fontSize: 11, color: fandom.color, fontWeight: "500" }} numberOfLines={1}>
                {fandom.recentActivity}
              </Text>
            </View>
          )}

          <Pressable
            style={[{
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: "center",
            }, isFollowing
              ? { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border }
              : { backgroundColor: fandom.color }
            ]}
            onPress={handleFollow}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: "700",
              color: isFollowing ? colors.mutedForeground : "#ffffff",
            }}>
              {isFollowing ? "✓ " + t.followingBtn : t.followArtist ?? t.joinBtn}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [{
        backgroundColor: colors.card,
        borderRadius: 18,
        overflow: "hidden",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.92 : 1,
      }]}
      onPress={() => router.push({ pathname: "/fandom/[id]", params: { id: fandom.id } })}
    >
      {/* Color stripe top */}
      <View style={{ height: 5, backgroundColor: fandom.color }} />

      <View style={{ padding: 16, flexDirection: "row", gap: 14, alignItems: "center" }}>
        {/* Artist avatar circle */}
        <ArtistAvatar
          avatarUrl={fandom.avatarUrl}
          emoji={fandom.emoji}
          size={60}
          backgroundColor={fandom.color + "20"}
          borderWidth={2}
          borderColor={fandom.color + "50"}
        />

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: colors.foreground }} numberOfLines={1}>
              {fandom.artistName}
            </Text>
            {fandom.isVerified && (
              <Feather name="check-circle" size={14} color={fandom.color} />
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <View style={{ backgroundColor: fandom.color + "20", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ fontSize: 11, color: fandom.color, fontWeight: "600" }}>{genreEmoji} {genreLabel}</Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>팬 {formatCount(fandom.memberCount)}명</Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 18 }} numberOfLines={2}>
            {fandom.description}
          </Text>
        </View>

        <Pressable
          style={[{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
          }, isFollowing
            ? { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.border }
            : { backgroundColor: fandom.color }
          ]}
          onPress={handleFollow}
        >
          <Text style={{
            fontSize: 13,
            fontWeight: "700",
            color: isFollowing ? colors.mutedForeground : "#ffffff",
          }}>
            {isFollowing ? "팔로잉" : "팔로우"}
          </Text>
        </Pressable>
      </View>

      {fandom.recentActivity && (
        <View style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}>
          <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: fandom.color }} />
          <Text style={{ fontSize: 12, color: colors.mutedForeground, flex: 1 }} numberOfLines={1}>
            {fandom.recentActivity}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
