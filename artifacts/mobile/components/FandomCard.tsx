import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFandom } from "@/context/FandomContext";
import { useColors } from "@/hooks/useColors";
import type { Fandom } from "@/constants/data";

interface FandomCardProps {
  fandom: Fandom;
  variant?: "default" | "compact" | "featured";
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function FandomCard({ fandom, variant = "default" }: FandomCardProps) {
  const colors = useColors();
  const { followedFandomIds, toggleFollow } = useFandom();
  const isFollowing = followedFandomIds.includes(fandom.id);
  const styles = makeStyles(colors);

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFollow(fandom.id);
  };

  if (variant === "compact") {
    return (
      <Pressable
        style={({ pressed }) => [styles.compactCard, pressed && { opacity: 0.9 }]}
        onPress={() => router.push({ pathname: "/fandom/[id]", params: { id: fandom.id } })}
      >
        <Image source={fandom.coverImage} style={styles.compactImage} resizeMode="cover" />
        <View style={styles.compactOverlay} />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>{fandom.name}</Text>
          <Text style={styles.compactMembers}>{formatCount(fandom.memberCount)}</Text>
        </View>
      </Pressable>
    );
  }

  if (variant === "featured") {
    return (
      <Pressable
        style={({ pressed }) => [styles.featuredCard, pressed && { opacity: 0.92 }]}
        onPress={() => router.push({ pathname: "/fandom/[id]", params: { id: fandom.id } })}
      >
        <Image source={fandom.coverImage} style={styles.featuredImage} resizeMode="cover" />
        <View style={styles.featuredOverlay} />
        <View style={styles.featuredContent}>
          <View style={styles.featuredCategoryBadge}>
            <Text style={styles.featuredCategoryText}>{fandom.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.featuredName}>{fandom.name}</Text>
          <Text style={styles.featuredDescription} numberOfLines={2}>{fandom.description}</Text>
          <View style={styles.featuredStats}>
            <View style={styles.statItem}>
              <Feather name="users" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{formatCount(fandom.memberCount)}</Text>
            </View>
            <View style={styles.statItem}>
              <Feather name="file-text" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statText}>{formatCount(fandom.postCount)}</Text>
            </View>
          </View>
          <Pressable
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={handleFollow}
          >
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
              {isFollowing ? "Following" : "Join"}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      onPress={() => router.push({ pathname: "/fandom/[id]", params: { id: fandom.id } })}
    >
      <Image source={fandom.coverImage} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cardName}>{fandom.name}</Text>
            <Text style={styles.cardCategory}>{fandom.category}</Text>
          </View>
          <Pressable
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={handleFollow}
          >
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
              {isFollowing ? "Following" : "Join"}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.cardDescription} numberOfLines={2}>{fandom.description}</Text>
        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <Feather name="users" size={12} color={colors.mutedForeground} />
            <Text style={styles.cardStatText}>{formatCount(fandom.memberCount)} members</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="file-text" size={12} color={colors.mutedForeground} />
            <Text style={styles.cardStatText}>{formatCount(fandom.postCount)} posts</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 12,
    },
    cardImage: {
      width: "100%",
      height: 100,
    },
    cardContent: {
      padding: 14,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    cardName: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    cardCategory: {
      fontSize: 12,
      color: colors.mutedForeground,
      textTransform: "capitalize",
      marginTop: 2,
    },
    cardDescription: {
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
      marginBottom: 10,
    },
    cardStats: {
      flexDirection: "row",
      gap: 16,
    },
    cardStatText: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    followBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
    },
    followingBtn: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.border,
    },
    followBtnText: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.primaryForeground,
    },
    followingBtnText: {
      color: colors.mutedForeground,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statText: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
    },
    compactCard: {
      width: 140,
      height: 100,
      borderRadius: 12,
      overflow: "hidden",
      marginRight: 10,
    },
    compactImage: {
      width: "100%",
      height: "100%",
    },
    compactOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    compactContent: {
      ...StyleSheet.absoluteFillObject,
      padding: 10,
      justifyContent: "flex-end",
    },
    compactName: {
      fontSize: 13,
      fontWeight: "700" as const,
      color: "#ffffff",
    },
    compactMembers: {
      fontSize: 11,
      color: "rgba(255,255,255,0.75)",
    },
    featuredCard: {
      width: 260,
      height: 200,
      borderRadius: 16,
      overflow: "hidden",
      marginRight: 12,
    },
    featuredImage: {
      width: "100%",
      height: "100%",
    },
    featuredOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.55)",
    },
    featuredContent: {
      ...StyleSheet.absoluteFillObject,
      padding: 14,
      justifyContent: "flex-end",
    },
    featuredCategoryBadge: {
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      alignSelf: "flex-start",
      marginBottom: 6,
    },
    featuredCategoryText: {
      fontSize: 10,
      fontWeight: "700" as const,
      color: "#ffffff",
      letterSpacing: 0.5,
    },
    featuredName: {
      fontSize: 18,
      fontWeight: "800" as const,
      color: "#ffffff",
      marginBottom: 4,
    },
    featuredDescription: {
      fontSize: 12,
      color: "rgba(255,255,255,0.75)",
      marginBottom: 8,
      lineHeight: 17,
    },
    featuredStats: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 10,
    },
  });
