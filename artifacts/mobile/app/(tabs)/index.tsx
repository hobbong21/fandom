import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FandomCard } from "@/components/FandomCard";
import { ArtistAvatar } from "@/components/ArtistAvatar";
import { PostCard } from "@/components/PostCard";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import type { Fandom } from "@/constants/data";

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

const STAR_ACTIONS = [
  { emoji: "💬", label: "대화방", icon: "message-circle" as const },
  { emoji: "🎁", label: "선물", icon: "gift" as const },
  { emoji: "🏆", label: "랭킹", icon: "award" as const },
  { emoji: "🛒", label: "상점", icon: "shopping-cart" as const },
];

function QuickActions({
  colors,
  selectedFandom,
  onDismiss,
}: {
  colors: ReturnType<typeof useColors>;
  selectedFandom: Fandom | null;
  onDismiss: () => void;
}) {
  if (selectedFandom) {
    const c = selectedFandom.color;
    return (
      <View style={{ marginBottom: 20 }}>
        {/* Star header bar */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 10,
          backgroundColor: c + "18",
          borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9,
          marginBottom: 10,
          borderWidth: 1, borderColor: c + "33",
        }}>
          <ArtistAvatar
            avatarUrl={selectedFandom.avatarUrl}
            emoji={selectedFandom.emoji}
            size={32}
            backgroundColor={c + "30"}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: c }}>
              {selectedFandom.artistName}
            </Text>
            <Text style={{ fontSize: 10, color: c + "aa", fontWeight: "500" }}>
              스타 전용 메뉴
            </Text>
          </View>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => ({
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: pressed ? c + "22" : c + "15",
              alignItems: "center", justifyContent: "center",
            })}
          >
            <Feather name="x" size={14} color={c} />
          </Pressable>
        </View>

        {/* Star-specific action buttons */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {STAR_ACTIONS.map((a) => (
            <Pressable
              key={a.label}
              style={({ pressed }) => ({
                flex: 1, alignItems: "center", gap: 7, paddingVertical: 14,
                backgroundColor: pressed ? c + "30" : c + "15",
                borderRadius: 16, borderWidth: 1.5, borderColor: c + "44",
              })}
              onPress={() => router.push({ pathname: "/fandom/[id]", params: { id: selectedFandom.id } })}
            >
              <View style={{
                width: 34, height: 34, borderRadius: 17,
                backgroundColor: c + "25",
                alignItems: "center", justifyContent: "center",
              }}>
                <Feather name={a.icon} size={17} color={c} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: "700", color: c }}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  return null;
}

function StarSelectCard({
  fandom,
  isSelected,
  onSelect,
  colors,
}: {
  fandom: Fandom;
  isSelected: boolean;
  onSelect: (f: Fandom) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const c = fandom.color;
  return (
    <Pressable
      style={({ pressed }) => ({
        width: 76, alignItems: "center", gap: 6, paddingVertical: 10,
        paddingHorizontal: 4,
        opacity: pressed ? 0.8 : 1,
      })}
      onPress={() => onSelect(fandom)}
    >
      <View style={{
        width: 54, height: 54, borderRadius: 27,
        backgroundColor: isSelected ? c + "30" : colors.muted,
        borderWidth: isSelected ? 2.5 : 1.5,
        borderColor: isSelected ? c : colors.border,
        alignItems: "center", justifyContent: "center",
        shadowColor: isSelected ? c : "transparent",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isSelected ? 0.45 : 0,
        shadowRadius: 6,
        elevation: isSelected ? 4 : 0,
      }}>
        <ArtistAvatar
          avatarUrl={fandom.avatarUrl}
          emoji={fandom.emoji}
          size={42}
          backgroundColor="transparent"
        />
        {isSelected && (
          <View style={{
            position: "absolute", bottom: -1, right: -1,
            width: 16, height: 16, borderRadius: 8,
            backgroundColor: c,
            alignItems: "center", justifyContent: "center",
            borderWidth: 1.5, borderColor: colors.background,
          }}>
            <Feather name="check" size={9} color="#fff" />
          </View>
        )}
      </View>
      <Text
        style={{
          fontSize: 10, fontWeight: isSelected ? "800" : "500",
          color: isSelected ? c : colors.mutedForeground,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {fandom.artistName}
      </Text>
    </Pressable>
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
  const [selectedFandom, setSelectedFandom] = useState<Fandom | null>(null);
  const isWeb = useIsDesktop();

  const handleSelectStar = (f: Fandom) => {
    setSelectedFandom((prev) => (prev?.id === f.id ? null : f));
  };

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
      <QuickActions
        colors={colors}
        selectedFandom={selectedFandom}
        onDismiss={() => setSelectedFandom(null)}
      />
      <LiveBanner colors={colors} />

      {followedArtists.length > 0 && (
        <View style={{ marginBottom: 22 }}>
          <SectionHeader
            title="팔로잉 아티스트"
            subtitle="스타를 선택해 전용 메뉴를 열어보세요"
            colors={colors}
            onPress={() => router.push("/explore")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 4, paddingBottom: 4 }}
          >
            {followedArtists.map((f) => (
              <StarSelectCard
                key={f.id}
                fandom={f}
                isSelected={selectedFandom?.id === f.id}
                onSelect={handleSelectStar}
                colors={colors}
              />
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
                  {user ? `안녕하세요, ${user.name}님 👋` : "팬노드에 오신 것을 환영해요"}
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
            <QuickActions
              colors={colors}
              selectedFandom={selectedFandom}
              onDismiss={() => setSelectedFandom(null)}
            />
            <LiveBanner colors={colors} />

            {followedArtists.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <SectionHeader
                  title="팔로잉 아티스트"
                  subtitle="스타를 선택해 전용 메뉴를 열어보세요"
                  colors={colors}
                  onPress={() => router.push("/explore")}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingBottom: 4 }}>
                  {followedArtists.map((f) => (
                    <StarSelectCard
                      key={f.id}
                      fandom={f}
                      isSelected={selectedFandom?.id === f.id}
                      onSelect={handleSelectStar}
                      colors={colors}
                    />
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
