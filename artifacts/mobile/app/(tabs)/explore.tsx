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
import { useLanguage } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

const WEB_MAX_WIDTH = 680;

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { fandoms } = useFandom();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const isWeb = Platform.OS === "web";

  const filtered = fandoms.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      search.length === 0 ||
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.tags.some((tag) => tag.toLowerCase().includes(q));
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  const styles = makeStyles(colors);

  if (isWeb) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.webScroll}>
          <View style={styles.webInner}>
            <View style={[styles.header, { paddingTop: 28 }]}>
              <Text style={styles.title}>{t.exploreTitle}</Text>
              <Text style={styles.subtitle}>{t.exploreSubtitle}</Text>
              <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
                <Feather name="search" size={18} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.searchInput, { color: colors.foreground }]}
                  placeholder={t.searchPlaceholder}
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
                    { backgroundColor: colors.muted },
                    activeCategory === cat.id && styles.catBtnActive,
                  ]}
                  onPress={() => setActiveCategory(cat.id)}
                >
                  <Text
                    style={[
                      styles.catText,
                      { color: colors.mutedForeground },
                      activeCategory === cat.id && styles.catTextActive,
                    ]}
                  >
                    {t.categories[cat.id] ?? cat.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="compass" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t.noFandomTitle}</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noFandomText}</Text>
              </View>
            ) : (
              filtered.map((item) => <FandomCard key={item.id} fandom={item} />)
            )}
            <View style={{ height: 40 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>{t.exploreTitle}</Text>
        <Text style={styles.subtitle}>{t.exploreSubtitle}</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder={t.searchPlaceholder}
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
              { backgroundColor: colors.muted },
              activeCategory === cat.id && styles.catBtnActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text
              style={[
                styles.catText,
                { color: colors.mutedForeground },
                activeCategory === cat.id && styles.catTextActive,
              ]}
            >
              {t.categories[cat.id] ?? cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        renderItem={({ item }) => <FandomCard fandom={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="compass" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t.noFandomTitle}</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{t.noFandomText}</Text>
          </View>
        }
      />
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
      paddingBottom: 14,
      backgroundColor: colors.background,
    },
    title: { fontSize: 28, fontWeight: "800" as const, color: colors.foreground, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: colors.mutedForeground, marginBottom: 14, marginTop: 2 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 10,
    },
    searchInput: { flex: 1, fontSize: 15 },
    categories: { maxHeight: 48, marginBottom: 6 },
    categoriesContent: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
    catBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
    catBtnActive: { backgroundColor: colors.primary },
    catText: { fontSize: 14, fontWeight: "500" as const },
    catTextActive: { color: colors.primaryForeground },
    list: { paddingHorizontal: 16, paddingTop: 12 },
    empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
    emptyTitle: { fontSize: 18, fontWeight: "700" as const },
    emptyText: { fontSize: 14, textAlign: "center" },
  });
