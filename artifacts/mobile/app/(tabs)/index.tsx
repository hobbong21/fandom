import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FandomCard } from "@/components/FandomCard";
import { PostCard } from "@/components/PostCard";
import { useFandom } from "@/context/FandomContext";
import { useColors } from "@/hooks/useColors";

const FEED_FILTERS = ["추천", "팔로잉", "인기"];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts, fandoms, followedFandomIds } = useFandom();
  const [activeFilter, setActiveFilter] = useState("추천");

  const featuredFandoms = fandoms.slice(0, 4);
  const isWeb = Platform.OS === "web";

  const filteredPosts =
    activeFilter === "팔로잉"
      ? posts.filter((p) => followedFandomIds.includes(p.fandomId))
      : posts;

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: isWeb ? 67 : insets.top + 12 },
        ]}
      >
        <Text style={styles.logo}>팬덤</Text>
        <Pressable style={styles.searchBtn} onPress={() => router.push("/explore")}>
          <Feather name="search" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: isWeb ? 34 : insets.bottom + 100 },
        ]}
        ListHeaderComponent={
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.featured}
              contentContainerStyle={styles.featuredContent}
            >
              {featuredFandoms.map((f) => (
                <FandomCard key={f.id} fandom={f} variant="featured" />
              ))}
            </ScrollView>

            <View style={styles.filterRow}>
              {FEED_FILTERS.map((filter) => (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterBtn,
                    activeFilter === filter && styles.filterBtnActive,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter && styles.filterTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        renderItem={({ item }) => <PostCard post={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="rss" size={40} color={colors.mutedForeground} />
            <Text style={styles.emptyTitle}>아직 게시글이 없습니다</Text>
            <Text style={styles.emptyText}>팬덤에 가입하여 피드를 채워보세요</Text>
            <Pressable style={styles.exploreBtn} onPress={() => router.push("/explore")}>
              <Text style={styles.exploreBtnText}>팬덤 탐색하기</Text>
            </Pressable>
          </View>
        }
      />
    </View>
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
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
    logo: {
      fontSize: 26,
      fontWeight: "800" as const,
      color: colors.primary,
      letterSpacing: -0.5,
    },
    searchBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    featured: {
      marginBottom: 16,
    },
    featuredContent: {
      paddingHorizontal: 16,
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },
    filterBtn: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.muted,
    },
    filterBtnActive: {
      backgroundColor: colors.primary,
    },
    filterText: {
      fontSize: 14,
      fontWeight: "500" as const,
      color: colors.mutedForeground,
    },
    filterTextActive: {
      color: colors.primaryForeground,
    },
    list: {
      paddingHorizontal: 16,
    },
    empty: {
      alignItems: "center",
      paddingVertical: 60,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      maxWidth: 240,
    },
    exploreBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 20,
      marginTop: 8,
    },
    exploreBtnText: {
      color: colors.primaryForeground,
      fontWeight: "600" as const,
      fontSize: 14,
    },
  });
