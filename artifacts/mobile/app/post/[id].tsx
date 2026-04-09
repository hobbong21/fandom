import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useFandom } from "@/context/FandomContext";
import { useColors } from "@/hooks/useColors";
import type { Comment } from "@/constants/data";

function formatCount(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function CommentItem({ comment, colors }: { comment: Comment; colors: ReturnType<typeof useColors> }) {
  const [liked, setLiked] = useState(comment.isLiked);
  const styles = makeStyles(colors);

  return (
    <View style={styles.comment}>
      <View style={[styles.commentAvatar, { backgroundColor: colors.primary + "22" }]}>
        <Text style={[styles.commentAvatarText, { color: colors.primary }]}>
          {comment.authorAvatar}
        </Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{comment.authorName}</Text>
          <Text style={styles.commentTime}>{comment.timeAgo}</Text>
        </View>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <Pressable
          style={styles.commentLike}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setLiked((l) => !l);
          }}
        >
          <Feather name="heart" size={13} color={liked ? colors.accent : colors.mutedForeground} />
          <Text style={[styles.commentLikeText, liked ? { color: colors.accent } : { color: colors.mutedForeground }]}>
            {comment.likes + (liked ? 1 : 0)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts, likedPosts, savedPosts, toggleLike, toggleSave, getPostComments, addComment } = useFandom();
  const post = posts.find((p) => p.id === id);
  const comments = getPostComments(id ?? "");
  const isLiked = likedPosts.includes(id ?? "");
  const isSaved = savedPosts.includes(id ?? "");
  const [commentText, setCommentText] = useState("");
  const isWeb = Platform.OS === "web";
  const styles = makeStyles(colors);

  if (!post) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.mutedForeground }}>Post not found</Text>
      </View>
    );
  }

  const handleSubmitComment = () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    addComment(post.id, trimmed);
    setCommentText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <>
            <View style={[styles.header, { paddingTop: isWeb ? 67 : insets.top + 12 }]}>
              <Pressable style={styles.backBtn} onPress={() => router.back()}>
                <Feather name="arrow-left" size={20} color={colors.foreground} />
              </Pressable>
              <View style={styles.fandomBadge}>
                <Text style={styles.fandomBadgeText}>{post.fandomName}</Text>
              </View>
              <Pressable onPress={() => toggleSave(post.id)}>
                <Feather
                  name="bookmark"
                  size={20}
                  color={isSaved ? colors.primary : colors.foreground}
                />
              </Pressable>
            </View>

            <View style={styles.postSection}>
              <View style={styles.authorRow}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + "33" }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {post.authorAvatar}
                  </Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{post.authorName}</Text>
                  <Text style={styles.postTime}>{post.timeAgo}</Text>
                </View>
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent}>{post.content}</Text>

              {post.coverImage && (
                <Image source={post.coverImage} style={styles.coverImage} resizeMode="cover" />
              )}

              {post.tags.length > 0 && (
                <View style={styles.tags}>
                  {post.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleLike(post.id);
                  }}
                >
                  <Feather
                    name="heart"
                    size={20}
                    color={isLiked ? colors.accent : colors.mutedForeground}
                  />
                  <Text style={[styles.actionCount, isLiked ? { color: colors.accent } : { color: colors.mutedForeground }]}>
                    {formatCount(post.likes + (isLiked ? 1 : 0))}
                  </Text>
                </Pressable>
                <View style={styles.actionBtn}>
                  <Feather name="message-circle" size={20} color={colors.mutedForeground} />
                  <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>
                    {formatCount(post.comments)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>
                Comments ({comments.length})
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => <CommentItem comment={item} colors={colors} />}
        ListEmptyComponent={
          <View style={styles.emptyComments}>
            <Text style={styles.emptyCommentsText}>No comments yet. Be the first!</Text>
          </View>
        }
      />

      <View
        style={[
          styles.inputBar,
          { paddingBottom: isWeb ? 34 : insets.bottom + 8 },
        ]}
      >
        <TextInput
          style={[styles.commentInput, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="Add a comment..."
          placeholderTextColor={colors.mutedForeground}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
          onPress={handleSubmitComment}
          disabled={!commentText.trim()}
        >
          <Feather name="send" size={18} color={commentText.trim() ? colors.primaryForeground : colors.mutedForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    notFound: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    fandomBadge: {
      backgroundColor: colors.primary + "22",
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 20,
    },
    fandomBadgeText: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.primary,
    },
    postSection: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    authorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 16,
      fontWeight: "700" as const,
    },
    authorName: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.foreground,
    },
    postTime: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    postTitle: {
      fontSize: 22,
      fontWeight: "800" as const,
      color: colors.foreground,
      lineHeight: 30,
      marginBottom: 12,
    },
    postContent: {
      fontSize: 15,
      color: colors.mutedForeground,
      lineHeight: 24,
      marginBottom: 16,
    },
    coverImage: {
      width: "100%",
      height: 200,
      borderRadius: 14,
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
      fontSize: 12,
      fontWeight: "500" as const,
      color: colors.primary,
    },
    actions: {
      flexDirection: "row",
      gap: 20,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    actionCount: {
      fontSize: 15,
      fontWeight: "600" as const,
    },
    commentsHeader: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    commentsTitle: {
      fontSize: 17,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    comment: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    commentAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    commentAvatarText: {
      fontSize: 14,
      fontWeight: "700" as const,
    },
    commentBody: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    commentAuthor: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
    },
    commentTime: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    commentContent: {
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 20,
      marginBottom: 8,
    },
    commentLike: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    commentLikeText: {
      fontSize: 12,
      fontWeight: "500" as const,
    },
    emptyComments: {
      padding: 30,
      alignItems: "center",
    },
    emptyCommentsText: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "flex-end",
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    commentInput: {
      flex: 1,
      minHeight: 42,
      maxHeight: 100,
      borderWidth: 1,
      borderRadius: 21,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      backgroundColor: colors.muted,
      borderColor: "transparent",
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: {
      backgroundColor: colors.muted,
    },
  });
