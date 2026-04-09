import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FandomCard } from "@/components/FandomCard";
import { CATEGORIES } from "@/constants/data";
import { useFandom } from "@/context/FandomContext";
import { useColors } from "@/hooks/useColors";

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { fandoms } = useFandom();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const isWeb = Platform.OS === "web";

  const filtered = fandoms.filter((f) => {
    const matchSearch =
      search.length === 0 ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: isWeb ? 67 : insets.top + 12 },
        ]}
      >
        <Text style={styles.title}>탐색</Text>
        <Text style={styles.subtitle}>커뮤니티를 찾아보세요</Text>
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="팬덤 검색..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            style={[
              styles.catBtn,
              activeCategory === cat.id && styles.catBtnActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text
              style={[
                styles.catText,
                activeCategory === cat.id && styles.catTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: isWeb ? 34 : insets.bottom + 100 },
        ]}
        renderItem={({ item }) => <FandomCard fandom={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="compass" size={40} color={colors.mutedForeground} />
            <Text style={styles.emptyTitle}>팬덤을 찾을 수 없습니다</Text>
            <Text style={styles.emptyText}>다른 검색어 또는 카테고리를 시도해보세요</Text>
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
      paddingHorizontal: 20,
      paddingBottom: 14,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 14,
      marginTop: 2,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
    },
    categories: {
      maxHeight: 48,
      marginBottom: 6,
    },
    categoriesContent: {
      paddingHorizontal: 16,
      gap: 8,
      alignItems: "center",
    },
    catBtn: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.muted,
    },
    catBtnActive: {
      backgroundColor: colors.primary,
    },
    catText: {
      fontSize: 14,
      fontWeight: "500" as const,
      color: colors.mutedForeground,
    },
    catTextActive: {
      color: colors.primaryForeground,
    },
    list: {
      paddingHorizontal: 16,
      paddingTop: 12,
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
    },
  });
