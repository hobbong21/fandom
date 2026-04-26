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

function LiveBanner({ colors, t }: { colors: any; t: any }) {
  return (
    <Pressable
      style={{
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#ef4444",
      }}
      onPress={() => {}}
    >
      <View style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.2)",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Text style={{ fontSize: 20 }}>잔</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <View style={{ backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
              <Text style={{ fontSize: 10, color: "#ffffff", fontWeight: "800" }}>🔴 LIVE</Text>
            </View>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>잔나비</Text>
          </View>
          <Text style={{ fontSize: 14, color: "#ffffff", fontWeight: "700" }}>홍대 깜짝 버스킹 중!</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>홍대 걷고싶은거리 · 지금 참여 가능</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Feather name="chevron-right" size={20} color="#ffffff" />
        </View>
      </View>
    </Pressable>
  );
}

function SectionHeader({ title, subtitle, onPress, colors }: {
  title: string; subtitle?: string; onPress?: () => void; colors: any;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
      <View>
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.foreground }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 1 }}>{subtitle}</Text>}
      </View>
      {onPress && (
        <Pressable onPress={onPress}>
          <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "600" }}>전체보기</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { posts, fandoms, followedFandomIds } = useFandom();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState(0);

  const feedFilters = [t.feedFor, t.feedFollowing, t.feedTrending];
  const followedArtists = fandoms.filter((f) => followedFandomIds.includes(f.id));
  const featuredFandoms = fandoms.slice(0, 5);
  const isWeb = Platform.OS === "web";

  const filteredPosts =
    activeFilter === 1
      ? posts.filter((p) => followedFandomIds.includes(p.fandomId))
      : posts;

  const artistPosts = posts.filter((p) => p.isArtistPost);
  const shownPosts = activeFilter === 2 ? [...posts].sort((a, b) => b.likes - a.likes) : filteredPosts;

  const content = (
    <>
      {/* Live banner */}
      <LiveBanner colors={colors} t={t} />

      {/* Following artists quick row */}
      {followedArtists.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <SectionHeader
            title="팔로잉 아티스트"
            subtitle="최신 소식을 받고 있어요"
            colors={colors}
            onPress={() => router.push("/explore")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {followedArtists.map((f) => (
              <FandomCard key={f.id} fandom={f} variant="compact" />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured artists horizontal */}
      <View style={{ marginBottom: 20 }}>
        <SectionHeader
          title="🎤 아티스트 둘러보기"
          subtitle="가수, 인디밴드, 트로트"
          colors={colors}
          onPress={() => router.push("/explore")}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {featuredFandoms.map((f) => (
            <FandomCard key={f.id} fandom={f} variant="featured" />
          ))}
        </ScrollView>
      </View>

      {/* Artist direct posts callout */}
      {artistPosts.length > 0 && activeFilter !== 1 && (
        <View style={{ marginBottom: 20 }}>
          <SectionHeader
            title="💌 아티스트 직접 소식"
            subtitle="아티스트가 직접 올린 메시지"
            colors={colors}
          />
          {artistPosts.slice(0, 2).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      )}

      {/* Feed filter */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {feedFilters.map((filter, i) => (
          <Pressable
            key={filter}
            style={[{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1.5,
            }, activeFilter === i
              ? { backgroundColor: colors.primary, borderColor: colors.primary }
              : { backgroundColor: "transparent", borderColor: colors.border }
            ]}
            onPress={() => setActiveFilter(i)}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: "600",
              color: activeFilter === i ? colors.primaryForeground : colors.mutedForeground,
            }}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Feed title */}
      <SectionHeader
        title={activeFilter === 0 ? "🌟 모든 소식" : activeFilter === 1 ? "📡 팔로잉 소식" : "🔥 인기 소식"}
        colors={colors}
      />

      {shownPosts.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
          <Text style={{ fontSize: 48 }}>🎵</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{t.noPostsTitle}</Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center", maxWidth: 240 }}>{t.noPostsText}</Text>
          <Pressable
            style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 8 }}
            onPress={() => router.push("/explore")}
          >
            <Text style={{ color: colors.primaryForeground, fontWeight: "700", fontSize: 14 }}>{t.exploreFandoms}</Text>
          </Pressable>
        </View>
      ) : (
        shownPosts.map((item) => <PostCard key={item.id} post={item} />)
      )}

      <View style={{ height: 40 }} />
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {isWeb ? (
        <View style={{ flex: 1, overflowY: "auto" as any }}>
          <View style={{ maxWidth: WEB_MAX_WIDTH, width: "100%", alignSelf: "center", paddingHorizontal: 20 }}>
            {/* Web header */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 28,
              paddingBottom: 20,
            }}>
              <View>
                <Text style={{ fontSize: 28, fontWeight: "900", color: colors.primary, letterSpacing: -1 }}>
                  {t.appName}
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 1 }}>
                  {(t as any).appTagline}
                </Text>
              </View>
              <Pressable
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: colors.muted,
                  alignItems: "center", justifyContent: "center",
                }}
                onPress={() => router.push("/explore")}
              >
                <Feather name="search" size={18} color={colors.foreground} />
              </Pressable>
            </View>
            {content}
          </View>
        </View>
      ) : (
        <>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: insets.top + 12,
            paddingBottom: 14,
            paddingHorizontal: 16,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <View>
              <Text style={{ fontSize: 26, fontWeight: "900", color: colors.primary, letterSpacing: -0.8 }}>
                {t.appName}
              </Text>
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                {(t as any).appTagline}
              </Text>
            </View>
            <Pressable
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}
              onPress={() => router.push("/explore")}
            >
              <Feather name="search" size={18} color={colors.foreground} />
            </Pressable>
          </View>

          <FlatList
            data={shownPosts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
            ListHeaderComponent={
              <View style={{ paddingTop: 16 }}>
                <LiveBanner colors={colors} t={t} />

                {followedArtists.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <SectionHeader title="팔로잉 아티스트" colors={colors} onPress={() => router.push("/explore")} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                      {followedArtists.map((f) => (
                        <FandomCard key={f.id} fandom={f} variant="compact" />
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={{ marginBottom: 20 }}>
                  <SectionHeader title="🎤 아티스트 둘러보기" colors={colors} onPress={() => router.push("/explore")} />
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                    {featuredFandoms.map((f) => (
                      <FandomCard key={f.id} fandom={f} variant="featured" />
                    ))}
                  </ScrollView>
                </View>

                {artistPosts.length > 0 && activeFilter !== 1 && (
                  <View style={{ marginBottom: 20 }}>
                    <SectionHeader title="💌 아티스트 직접 소식" colors={colors} />
                    {artistPosts.slice(0, 2).map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                  {feedFilters.map((filter, i) => (
                    <Pressable
                      key={filter}
                      style={[{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        borderWidth: 1.5,
                      }, activeFilter === i
                        ? { backgroundColor: colors.primary, borderColor: colors.primary }
                        : { backgroundColor: "transparent", borderColor: colors.border }
                      ]}
                      onPress={() => setActiveFilter(i)}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "600", color: activeFilter === i ? colors.primaryForeground : colors.mutedForeground }}>
                        {filter}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <SectionHeader
                  title={activeFilter === 0 ? "🌟 모든 소식" : activeFilter === 1 ? "📡 팔로잉 소식" : "🔥 인기 소식"}
                  colors={colors}
                />
              </View>
            }
            renderItem={({ item }) => <PostCard post={item} />}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
                <Text style={{ fontSize: 48 }}>🎵</Text>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{t.noPostsTitle}</Text>
                <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center", maxWidth: 240 }}>{t.noPostsText}</Text>
                <Pressable
                  style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 8 }}
                  onPress={() => router.push("/explore")}
                >
                  <Text style={{ color: colors.primaryForeground, fontWeight: "700", fontSize: 14 }}>{t.exploreFandoms}</Text>
                </Pressable>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}
