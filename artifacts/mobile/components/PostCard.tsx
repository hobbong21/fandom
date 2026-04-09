import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFandom } from "@/context/FandomContext";
import { useColors } from "@/hooks/useColors";
import type { Post } from "@/constants/data";

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function PostCard({ post, compact = false }: PostCardProps) {
  const colors = useColors();
  const { likedPosts, savedPosts, toggleLike, toggleSave } = useFandom();
  const isLiked = likedPosts.includes(post.id);
  const isSaved = savedPosts.includes(post.id);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLike(post.id);
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSave(post.id);
  };

  const styles = makeStyles(colors);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
    >
      <View style={styles.header}>
        <View style={styles.fandomBadge}>
          <Text style={styles.fandomBadgeText}>{post.fandomName}</Text>
        </View>
        <Text style={styles.timeAgo}>{post.timeAgo}</Text>
      </View>

      <View style={styles.authorRow}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "33" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {post.authorAvatar}
          </Text>
        </View>
        <Text style={styles.authorName}>{post.authorName}</Text>
      </View>

      <Text style={styles.title} numberOfLines={compact ? 2 : 3}>
        {post.title}
      </Text>

      {!compact && (
        <Text style={styles.content} numberOfLines={3}>
          {post.content}
        </Text>
      )}

      {!compact && post.coverImage && (
        <Image
          source={post.coverImage}
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}

      {!compact && post.tags.length > 0 && (
        <View style={styles.tags}>
          {post.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Pressable style={styles.action} onPress={handleLike}>
          <Feather
            name="heart"
            size={16}
            color={isLiked ? colors.accent : colors.mutedForeground}
          />
          <Text
            style={[
              styles.actionText,
              isLiked ? { color: colors.accent } : { color: colors.mutedForeground },
            ]}
          >
            {formatCount(post.likes + (isLiked ? 1 : 0))}
          </Text>
        </Pressable>

        <Pressable
          style={styles.action}
          onPress={() => router.push({ pathname: "/post/[id]", params: { id: post.id } })}
        >
          <Feather name="message-circle" size={16} color={colors.mutedForeground} />
          <Text style={[styles.actionText, { color: colors.mutedForeground }]}>
            {formatCount(post.comments)}
          </Text>
        </Pressable>

        <Pressable style={styles.action} onPress={handleSave}>
          <Feather
            name="bookmark"
            size={16}
            color={isSaved ? colors.primary : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    fandomBadge: {
      backgroundColor: colors.primary + "22",
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
    },
    fandomBadgeText: {
      fontSize: 11,
      fontWeight: "600" as const,
      color: colors.primary,
    },
    timeAgo: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    authorRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      gap: 8,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 13,
      fontWeight: "700" as const,
    },
    authorName: {
      fontSize: 13,
      fontWeight: "500" as const,
      color: colors.mutedForeground,
    },
    title: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.foreground,
      marginBottom: 6,
      lineHeight: 22,
    },
    content: {
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
      marginBottom: 12,
    },
    coverImage: {
      width: "100%",
      height: 160,
      borderRadius: 10,
      marginBottom: 12,
    },
    tags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 12,
    },
    tag: {
      backgroundColor: colors.muted,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    tagText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontWeight: "500" as const,
    },
    footer: {
      flexDirection: "row",
      gap: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      marginTop: 4,
    },
    action: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    actionText: {
      fontSize: 13,
      fontWeight: "500" as const,
    },
  });
