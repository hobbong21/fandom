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
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

const WEB_MAX_WIDTH = 680;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts, fandoms, followedFandomIds } = useFandom();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState(0);

  const feedFilters = [t.feedFor, t.feedFollowing, t.feedTrending];
  const featuredFandoms = fandoms.slice(0, 4);
  const isWeb = Platform.OS === "web";

  const filteredPosts =
    activeFilter === 1
      ? posts.filter((p) => followedFandomIds.includes(p.fandomId))
      : posts;

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isWeb ? (
        <View style={styles.webScroll}>
          <View style={styles.webInner}>
            <View style={[styles.header, { paddingTop: 28 }]}>
              <Text style={styles.logo}>{t.appName}</Text>
              <Pressable style={styles.searchBtn} onPress={() => router.push("/explore")}>
                <Feather name="search" size={20} color={colors.foreground} />
              </Pressable>
            </View>

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
              {feedFilters.map((filter, i) => (
                <Pressable
                  key={filter}
                  style={[styles.filterBtn, activeFilter === i && styles.filterBtnActive]}
                  onPress={() => setActiveFilter(i)}
                >
                  <Text style={[styles.filterText, activeFilter === i && styles.filterTextActive]}>
                    {filter}
                  </Text>
                </Pressable>
              ))}
            </View>

            {filteredPosts.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="rss" size={40} color={colors.mutedForeground} />
                <Text style={styles.emptyTitle}>{t.noPostsTitle}</Text>
                <Text style={styles.emptyText}>{t.noPostsText}</Text>
                <Pressable style={styles.exploreBtn} onPress={() => router.push("/explore")}>
                  <Text style={styles.exploreBtnText}>{t.exploreFandoms}</Text>
                </Pressable>
              </View>
            ) : (
              filteredPosts.map((item) => <PostCard key={item.id} post={item} />)
            )}
            <View style={{ height: 40 }} />
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
            <Text style={styles.logo}>{t.appName}</Text>
            <Pressable style={styles.searchBtn} onPress={() => router.push("/explore")}>
              <Feather name="search" size={20} color={colors.foreground} />
            </Pressable>
          </View>

          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
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
                  {feedFilters.map((filter, i) => (
                    <Pressable
                      key={filter}
                      style={[styles.filterBtn, activeFilter === i && styles.filterBtnActive]}
                      onPress={() => setActiveFilter(i)}
                    >
                      <Text style={[styles.filterText, activeFilter === i && styles.filterTextActive]}>
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
                <Text style={styles.emptyTitle}>{t.noPostsTitle}</Text>
                <Text style={styles.emptyText}>{t.noPostsText}</Text>
                <Pressable style={styles.exploreBtn} onPress={() => router.push("/explore")}>
                  <Text style={styles.exploreBtnText}>{t.exploreFandoms}</Text>
                </Pressable>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1 },
    webScroll: {
      flex: 1,
      overflowY: "auto" as any,
    },
    webInner: {
      maxWidth: WEB_MAX_WIDTH,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 16,
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
    featured: { marginBottom: 16 },
    featuredContent: { gap: 10 },
    filterRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
    filterBtn: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.muted,
    },
    filterBtnActive: { backgroundColor: colors.primary },
    filterText: { fontSize: 14, fontWeight: "500" as const, color: colors.mutedForeground },
    filterTextActive: { color: colors.primaryForeground },
    list: { paddingHorizontal: 16 },
    empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
    emptyTitle: { fontSize: 18, fontWeight: "700" as const, color: colors.foreground },
    emptyText: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", maxWidth: 240 },
    exploreBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 20,
      marginTop: 8,
    },
    exploreBtnText: { color: colors.primaryForeground, fontWeight: "600" as const, fontSize: 14 },
  });
