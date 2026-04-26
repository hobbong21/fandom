import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PostCard } from "@/components/PostCard";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useXP } from "@/context/XPContext";
import { useColors } from "@/hooks/useColors";

type Tab = "intro" | "news" | "fans";

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "만";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { fandoms, posts, followedFandomIds, toggleFollow } = useFandom();
  const { t } = useLanguage();
  const { earnXP } = useXP();
  const isWeb = Platform.OS === "web";
  const [activeTab, setActiveTab] = useState<Tab>("intro");

  const fandom = fandoms.find((f) => f.id === id);
  const fandomPosts = posts.filter((p) => p.fandomId === id);
  const isFollowing = followedFandomIds.includes(id ?? "");

  if (!fandom) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>{t.fandomNotFound}</Text>
      </View>
    );
  }

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isFollowing) earnXP("JOIN_FANDOM");
    toggleFollow(fandom.id);
  };

  const genreLabel = t.categories[fandom.genre] ?? fandom.genre;
  const genreEmoji = (t as any).categoryEmojis?.[fandom.genre] ?? "🎵";
  const artistPosts = fandomPosts.filter((p) => p.isArtistPost);
  const fanPosts = fandomPosts.filter((p) => !p.isArtistPost);
  const { profile } = fandom;

  const tabLabel: Record<Tab, string> = {
    intro: "소개",
    news: `소식 ${artistPosts.length > 0 ? `(${artistPosts.length})` : ""}`,
    fans: `팬게시판 ${fanPosts.length > 0 ? `(${fanPosts.length})` : ""}`,
  };

  /* ── Hero ─────────────────────────────────────── */
  const hero = (
    <View style={{ backgroundColor: fandom.color, overflow: "hidden" }}>
      {/* dot pattern */}
      <View style={StyleSheet.absoluteFillObject}>
        {[...Array(30)].map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.12)",
              top: (i % 6) * 55 + 10,
              left: Math.floor(i / 6) * 75 + 10,
            }}
          />
        ))}
      </View>

      {/* Back button */}
      <Pressable
        style={{
          position: "absolute",
          top: isWeb ? 18 : insets.top + 12,
          left: 14,
          zIndex: 10,
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: "rgba(0,0,0,0.28)",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={20} color="#fff" />
      </Pressable>

      {/* Content */}
      <View style={{
        paddingTop: isWeb ? 56 : insets.top + 54,
        paddingBottom: 28,
        paddingHorizontal: 20,
        alignItems: "center",
      }}>
        {/* Avatar */}
        <View style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: "rgba(255,255,255,0.22)",
          borderWidth: 3,
          borderColor: "rgba(255,255,255,0.5)",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}>
          <Text style={{ fontSize: 48 }}>{fandom.emoji}</Text>
        </View>

        {/* Name + verified */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 }}>
          <Text style={{ fontSize: 27, fontWeight: "900", color: "#fff" }}>
            {fandom.artistName}
          </Text>
          {fandom.isVerified && (
            <View style={{
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: 12,
              paddingHorizontal: 7,
              paddingVertical: 3,
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
            }}>
              <Feather name="check" size={11} color="#fff" />
              <Text style={{ fontSize: 10, color: "#fff", fontWeight: "700" }}>공식</Text>
            </View>
          )}
        </View>

        {/* Genre badge */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          backgroundColor: "rgba(0,0,0,0.22)",
          borderRadius: 16,
          paddingHorizontal: 12,
          paddingVertical: 5,
          marginBottom: 18,
        }}>
          <Text style={{ fontSize: 13 }}>{genreEmoji}</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.92)", fontWeight: "600" }}>{genreLabel}</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>·</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{profile.debutYear}년 데뷔</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>·</Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{profile.label}</Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 28, alignItems: "center", marginBottom: 20 }}>
          {[
            { value: formatCount(fandom.memberCount), label: "팬" },
            { value: formatCount(fandom.postCount), label: "게시글" },
            { value: String(artistPosts.length), label: "아티스트 글" },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 19, fontWeight: "800", color: "#fff" }}>{s.value}</Text>
                <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>{s.label}</Text>
              </View>
              {i < arr.length - 1 && (
                <View style={{ width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.25)" }} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Follow button */}
        <Pressable
          style={[{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            borderRadius: 26,
            paddingVertical: 12,
            paddingHorizontal: 32,
          }, isFollowing
            ? { backgroundColor: "rgba(0,0,0,0.25)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.4)" }
            : { backgroundColor: "#ffffff" }
          ]}
          onPress={handleFollow}
        >
          <Feather
            name={isFollowing ? "check" : "user-plus"}
            size={15}
            color={isFollowing ? "#fff" : fandom.color}
          />
          <Text style={{
            fontSize: 15,
            fontWeight: "700",
            color: isFollowing ? "#fff" : fandom.color,
          }}>
            {isFollowing ? "팔로잉" : "팔로우"}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  /* ── Tab Bar ──────────────────────────────────── */
  const tabBar = (
    <View style={{
      flexDirection: "row",
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    }}>
      {(["intro", "news", "fans"] as Tab[]).map((tab) => (
        <Pressable
          key={tab}
          style={{
            flex: 1,
            alignItems: "center",
            paddingVertical: 14,
            borderBottomWidth: 2.5,
            borderBottomColor: activeTab === tab ? fandom.color : "transparent",
          }}
          onPress={() => {
            Haptics.selectionAsync();
            setActiveTab(tab);
          }}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: activeTab === tab ? "700" : "500",
            color: activeTab === tab ? fandom.color : colors.mutedForeground,
          }}>
            {tabLabel[tab]}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  /* ── 소개 Tab ─────────────────────────────────── */
  const introTab = (
    <View style={{ padding: 18, gap: 16 }}>

      {/* Artist intro quote card */}
      <View style={{
        backgroundColor: fandom.color + "0f",
        borderRadius: 18,
        padding: 18,
        borderWidth: 1.5,
        borderColor: fandom.color + "30",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: fandom.color,
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Text style={{ fontSize: 16 }}>{fandom.emoji}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>{fandom.artistName}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Feather name="check-circle" size={11} color={fandom.color} />
              <Text style={{ fontSize: 11, color: fandom.color, fontWeight: "600" }}>아티스트 소개</Text>
            </View>
          </View>
        </View>

        {/* Quote mark */}
        <Text style={{ fontSize: 36, color: fandom.color, lineHeight: 32, marginBottom: 4, fontWeight: "900", opacity: 0.5 }}>"</Text>
        <Text style={{ fontSize: 15, color: colors.foreground, lineHeight: 24, fontWeight: "500" }}>
          {profile.introMessage}
        </Text>
        <Text style={{ fontSize: 36, color: fandom.color, lineHeight: 20, textAlign: "right", fontWeight: "900", opacity: 0.5 }}>"</Text>
      </View>

      {/* Latest release card */}
      <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Feather name="disc" size={15} color={fandom.color} />
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>최신 발매</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            backgroundColor: fandom.color + "20",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: fandom.color + "30",
          }}>
            <Text style={{ fontSize: 30 }}>{profile.latestRelease.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: colors.foreground, marginBottom: 4 }}>
              {profile.latestRelease.title}
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              {profile.latestRelease.type} · {profile.latestRelease.releaseDate}
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{fandom.artistName}</Text>
          </View>
        </View>
      </View>

      {/* Upcoming event card */}
      {profile.upcomingEvent && (
        <View style={{
          backgroundColor: "#ef4444" + "0d",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: "#ef4444" + "30",
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" }} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#ef4444" }}>예정된 이벤트</Text>
            <View style={{ marginLeft: "auto", backgroundColor: "#ef4444", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 10, color: "#fff", fontWeight: "700" }}>{profile.upcomingEvent.type}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 17, fontWeight: "800", color: colors.foreground, marginBottom: 6 }}>
            {profile.upcomingEvent.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Feather name="calendar" size={13} color={colors.mutedForeground} />
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{profile.upcomingEvent.date}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{profile.upcomingEvent.location}</Text>
          </View>
        </View>
      )}

      {/* Discography */}
      <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 }}>
          <Feather name="music" size={15} color={fandom.color} />
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>디스코그래피</Text>
        </View>
        <View style={{ gap: 12 }}>
          {profile.discography.map((item, idx) => (
            <View key={idx} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: fandom.color + (idx === 0 ? "25" : "12"),
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Text style={{ fontSize: 18 }}>🎵</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: idx === 0 ? "700" : "500",
                  color: idx === 0 ? colors.foreground : colors.mutedForeground,
                }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{item.type} · {item.year}</Text>
              </View>
              {idx === 0 && (
                <View style={{ backgroundColor: fandom.color, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, color: "#fff", fontWeight: "700" }}>최신</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Social links */}
      {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
        <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <Feather name="share-2" size={15} color={fandom.color} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>소셜 채널</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {profile.socialLinks.instagram && (
              <View style={{ backgroundColor: "#e1306c" + "15", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: "#e1306c" + "30" }}>
                <Text style={{ fontSize: 15 }}>📸</Text>
                <Text style={{ fontSize: 13, color: "#e1306c", fontWeight: "600" }}>Instagram</Text>
              </View>
            )}
            {profile.socialLinks.youtube && (
              <View style={{ backgroundColor: "#ff0000" + "12", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: "#ff0000" + "28" }}>
                <Text style={{ fontSize: 15 }}>▶️</Text>
                <Text style={{ fontSize: 13, color: "#ff0000", fontWeight: "600" }}>YouTube</Text>
              </View>
            )}
            {profile.socialLinks.spotify && (
              <View style={{ backgroundColor: "#1db954" + "15", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: "#1db954" + "30" }}>
                <Text style={{ fontSize: 15 }}>🎧</Text>
                <Text style={{ fontSize: 13, color: "#1db954", fontWeight: "600" }}>Spotify</Text>
              </View>
            )}
            {profile.socialLinks.twitter && (
              <View style={{ backgroundColor: "#1da1f2" + "15", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: "#1da1f2" + "30" }}>
                <Text style={{ fontSize: 15 }}>🐦</Text>
                <Text style={{ fontSize: 13, color: "#1da1f2", fontWeight: "600" }}>Twitter / X</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Tags */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {fandom.tags.map((tag) => (
          <View key={tag} style={{
            backgroundColor: fandom.color + "15",
            paddingHorizontal: 13,
            paddingVertical: 6,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: fandom.color + "28",
          }}>
            <Text style={{ fontSize: 13, color: fandom.color, fontWeight: "500" }}>#{tag}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 12 }} />
    </View>
  );

  /* ── 소식 Tab (artist posts) ─────────────────── */
  const newsTab = (
    <View style={{ padding: 16 }}>
      {artistPosts.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
          <Text style={{ fontSize: 48 }}>📭</Text>
          <Text style={{ fontSize: 15, color: colors.mutedForeground }}>아직 아티스트 소식이 없어요</Text>
        </View>
      ) : (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <View style={{ backgroundColor: fandom.color, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Feather name="check" size={10} color="#fff" />
              <Text style={{ fontSize: 11, color: "#fff", fontWeight: "700" }}>아티스트 직접 작성</Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{artistPosts.length}개의 소식</Text>
          </View>
          {artistPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </>
      )}
      <View style={{ height: 12 }} />
    </View>
  );

  /* ── 팬게시판 Tab ─────────────────────────────── */
  const fansTab = (
    <View style={{ padding: 16 }}>
      {/* Fan post header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>
          팬 이야기 {fanPosts.length > 0 ? `(${fanPosts.length})` : ""}
        </Text>
        <Pressable style={{ backgroundColor: fandom.color, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="edit-3" size={12} color="#fff" />
          <Text style={{ fontSize: 13, color: "#fff", fontWeight: "600" }}>글쓰기</Text>
        </Pressable>
      </View>

      {fanPosts.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
          <Text style={{ fontSize: 48 }}>💌</Text>
          <Text style={{ fontSize: 15, color: colors.mutedForeground }}>첫 번째 팬 게시글을 올려보세요!</Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground + "99", textAlign: "center" }}>
            {fandom.artistName}에 대한 이야기를 나눠보세요
          </Text>
        </View>
      ) : (
        fanPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
      <View style={{ height: 12 }} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: isWeb ? 40 : insets.bottom + 100 }}
      >
        {/* 0 — hero (not sticky) */}
        {hero}

        {/* 1 — tab bar (sticky) */}
        {tabBar}

        {/* 2 — tab content */}
        <View>
          {activeTab === "intro" && introTab}
          {activeTab === "news" && newsTab}
          {activeTab === "fans" && fansTab}
        </View>
      </ScrollView>
    </View>
  );
}
