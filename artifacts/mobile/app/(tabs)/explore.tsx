import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
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
import { useIsDesktop } from "@/hooks/useIsDesktop";

const WEB_MAX_WIDTH = 680;

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { fandoms } = useFandom();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const isWeb = useIsDesktop();

  const filtered = fandoms.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch =
      search.length === 0 ||
      f.name.toLowerCase().includes(q) ||
      f.artistName.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.tags.some((tag) => tag.toLowerCase().includes(q));
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  const header = (padTop: number) => (
    <View style={{ backgroundColor: colors.background, paddingTop: padTop, paddingBottom: 0 }}>
      {/* Title */}
      <View style={{ paddingHorizontal: isWeb ? 0 : 16, paddingBottom: 14 }}>
        <Text style={{ fontSize: 26, fontWeight: "900", color: colors.foreground, letterSpacing: -0.5, marginBottom: 3 }}>
          {t.exploreTitle}
        </Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{t.exploreSubtitle}</Text>
      </View>

      {/* Search bar */}
      <View style={[{
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
        marginBottom: 14,
        backgroundColor: colors.muted,
      }, !isWeb && { marginHorizontal: 16 }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={{ flex: 1, fontSize: 15, color: colors.foreground }}
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

      {/* Genre filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: isWeb ? 0 : 16, gap: 8, paddingBottom: 14 }}
      >
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={[{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderRadius: 20,
                borderWidth: 1.5,
              }, active
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: "transparent", borderColor: colors.border }
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
              <Text style={{
                fontSize: 14,
                fontWeight: "600",
                color: active ? colors.primaryForeground : colors.mutedForeground,
              }}>
                {t.categories[cat.id] ?? cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Count */}
      <View style={{ paddingHorizontal: isWeb ? 0 : 16, paddingBottom: 6 }}>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
          아티스트 <Text style={{ color: colors.foreground, fontWeight: "700" }}>{filtered.length}</Text>명
        </Text>
      </View>
    </View>
  );

  const emptyComponent = (
    <View style={{ alignItems: "center", paddingVertical: 60, gap: 14 }}>
      <Text style={{ fontSize: 48 }}>🎵</Text>
      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{t.noFandomTitle}</Text>
      <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center" }}>{t.noFandomText}</Text>
    </View>
  );

  if (isWeb) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, overflowY: "auto" as any }}>
          <View style={{ maxWidth: WEB_MAX_WIDTH, width: "100%", alignSelf: "center", paddingHorizontal: 20 }}>
            {header(28)}
            {filtered.length === 0
              ? emptyComponent
              : filtered.map((item) => <FandomCard key={item.id} fandom={item} />)
            }
            <View style={{ height: 40 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
        ListHeaderComponent={header(insets.top + 12)}
        renderItem={({ item }) => <FandomCard fandom={item} />}
        ListEmptyComponent={emptyComponent}
      />
    </View>
  );
}
