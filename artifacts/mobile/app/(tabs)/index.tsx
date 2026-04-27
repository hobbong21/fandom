import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FandomCard } from "@/components/FandomCard";
import { PostCard } from "@/components/PostCard";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useIsDesktop } from "@/hooks/useIsDesktop";

const WEB_MAX_WIDTH = 680;

function GreetingCard({ userName, colors }: { userName: string; colors: ReturnType<typeof useColors> }) {
  const today = new Date();
  const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  const dayStr = `${today.getMonth() + 1}월 ${today.getDate()}일 ${days[today.getDay()]}`;
  return (
    <View style={{
      borderRadius: 20, marginBottom: 16, overflow: "hidden",
      backgroundColor: colors.primary,
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
    }}>
      {/* Background decoration */}
      <View style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" }} />
      <View style={{ position: "absolute", bottom: -20, right: 40, width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.07)" }} />
      <View style={{ padding: 18 }}>
        <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "600", letterSpacing: 0.4, marginBottom: 5 }}>
          🌹 오늘의 응원 · {dayStr}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "800", color: "#ffffff", letterSpacing: -0.3 }}>
          {userName}님, 오늘도 함께해요
        </Text>
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
          좋아하는 아티스트의 새 소식이 기다리고 있어요
        </Text>
      </View>
    </View>
  );
}

function QuickActions({ colors }: { colors: ReturnType<typeof useColors> }) {
  const actions = [
    { emoji: "💬", label: "대화방" },
    { emoji: "🎁", label: "선물" },
    { emoji: "🏆", label: "랭킹" },
    { emoji: "🛒", label: "상점" },
  ];
  return (
    <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
      {actions.map((a) => (
        <Pressable
          key={a.label}
          style={({ pressed }) => ({
            flex: 1, alignItems: "center", gap: 7, paddingVertical: 14,
            backgroundColor: pressed ? colors.muted + "cc" : colors.card,
            borderRadius: 16, borderWidth: 1, borderColor: colors.border,
          })}
          onPress={() => {}}
        >
          <Text style={{ fontSize: 22 }}>{a.emoji}</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: colors.mutedForeground }}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function LiveBanner({ colors }: { colors: ReturnType<typeof useColors> }) {
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
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: "rgba(255,255,255,0.2)",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Text style={{ fontSize: 18 }}>잔</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 3 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" }} />
              <Text style={{ fontSize: 10, color: "#ffffff", fontWeight: "800" }}>LIVE</Text>
            </View>
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: "700" }}>잔나비</Text>
          </View>
          <Text style={{ fontSize: 14, color: "#ffffff", fontWeight: "700" }}>홍대 깜짝 버스킹 중!</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 1 }}>홍대 걷고싶은거리 · 지금 참여 가능</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#ffffff" />
      </View>
    </Pressable>
  );
}

function SectionHeader({ title, subtitle, onPress, colors }: {
  title: string; subtitle?: string; onPress?: () => void; colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
      <View>
        <Text style={{ fontSize: 17, fontWeight: "800", color: colors.foreground, letterSpacing: -0.3 }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>{subtitle}</Text>}
      </View>
      {onPress && (
        <Pressable onPress={onPress} style={{ paddingTop: 2 }}>
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
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState(0);
  const isWeb = useIsDesktop();

  const feedFilters = [t.feedFor, t.feedFollowing, t.feedTrending];
  const followedArtists = fandoms.filter((f) => followedFandomIds.includes(f.id));
  const featuredFandoms = fandoms.slice(0, 5);

  const filteredPosts =
    activeFilter === 1
      ? posts.filter((p) => followedFandomIds.includes(p.fandomId))
      : posts;

  const artistPosts = posts.filter((p) => p.isArtistPost);
  const shownPosts = activeFilter === 2 ? [...posts].sort((a, b) => b.likes - a.likes) : filteredPosts;

  /* ── Feed filters pill row ── */
  const filterPills = (
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
            fontSize: 13,
            fontWeight: "600",
            color: activeFilter === i ? "#ffffff" : colors.mutedForeground,
          }}>
            {filter}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  /* ── Shared content block ── */
  const feedContent = (
    <>
      {user && <GreetingCard userName={user.name} colors={colors} />}
      <QuickActions colors={colors} />
      <LiveBanner colors={colors} />

      {followedArtists.length > 0 && (
        <View style={{ marginBottom: 22 }}>
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

      <View style={{ marginBottom: 22 }}>
        <SectionHeader
          title="🎤 아티스트 둘러보기"
          subtitle="가수 · 인디밴드 · 트로트"
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

      {artistPosts.length > 0 && activeFilter !== 1 && (
        <View style={{ marginBottom: 22 }}>
          <SectionHeader
            title="💌 아티스트 직접 소식"
            subtitle="아티스트가 직접 작성한 메시지"
            colors={colors}
          />
          {artistPosts.slice(0, 2).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      )}

      {filterPills}

      <SectionHeader
        title={
          activeFilter === 0 ? "🌟 모든 소식"
          : activeFilter === 1 ? "📡 팔로잉 소식"
          : "🔥 인기 소식"
        }
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
            <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 14 }}>{t.exploreFandoms}</Text>
          </Pressable>
        </View>
      ) : (
        shownPosts.map((item) => <PostCard key={item.id} post={item} />)
      )}

      <View style={{ height: 40 }} />
    </>
  );

  /* ── WEB ── */
  if (isWeb) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, overflowY: "auto" as any }}>
          <View style={{ maxWidth: WEB_MAX_WIDTH, width: "100%", alignSelf: "center", paddingHorizontal: 20 }}>
            {/* Web greeting header */}
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 28,
              paddingBottom: 22,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              marginBottom: 22,
            }}>
              <View>
                <Text style={{ fontSize: 22, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 }}>
                  {user ? `안녕하세요, ${user.name}님 👋` : "스타링에 오신 것을 환영해요"}
                </Text>
                <Text style={{ fontSize: 13, color: colors.mutedForeground, marginTop: 3 }}>
                  아티스트의 새 소식을 확인해보세요
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
            {feedContent}
          </View>
        </View>
      </View>
    );
  }

  /* ── MOBILE ── */
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Mobile sticky header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: insets.top + 10,
        paddingBottom: 12,
        paddingHorizontal: 18,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View>
          <Text style={{ fontSize: 26, fontWeight: "900", color: colors.primary, letterSpacing: -0.8 }}>
            {t.appName}
          </Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 1 }}>
            {(t as any).appTagline}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}
            onPress={() => router.push("/explore")}
          >
            <Feather name="search" size={18} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={shownPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
        ListHeaderComponent={
          <View style={{ paddingTop: 16 }}>
            {user && <GreetingCard userName={user.name} colors={colors} />}
            <QuickActions colors={colors} />
            <LiveBanner colors={colors} />

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

            {filterPills}
            <SectionHeader
              title={
                activeFilter === 0 ? "🌟 모든 소식"
                : activeFilter === 1 ? "📡 팔로잉 소식"
                : "🔥 인기 소식"
              }
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
              <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 14 }}>{t.exploreFandoms}</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}
