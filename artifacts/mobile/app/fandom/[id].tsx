import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArtistAvatar } from "@/components/ArtistAvatar";
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useChat, type ChatMessage } from "@/context/ChatContext";
import { useStore } from "@/context/StoreContext";
import { useFandom } from "@/context/FandomContext";
import { useLanguage } from "@/context/LanguageContext";
import { useXP } from "@/context/XPContext";
import { useColors } from "@/hooks/useColors";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import type { Fandom } from "@/constants/data";

type Tab = "intro" | "news" | "fans" | "store" | "chat";

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "만";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function formatChatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return "방금";
  if (diff < 3600000) return Math.floor(diff / 60000) + "분 전";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "시간 전";
  return Math.floor(diff / 86400000) + "일 전";
}

function ChatTabContent({ fandomId, fandom }: { fandomId: string; fandom: Fandom }) {
  const colors = useColors();
  const { user } = useAuth();
  const { getMessages, sendMessage } = useChat();
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktop();
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const messages = getMessages(fandomId);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim() || !user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(fandomId, user.id, user.name, user.avatar, input.trim());
    setInput("");
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.authorId === user?.id;
    const isArtist = item.isArtist;
    return (
      <View style={{
        flexDirection: "row",
        justifyContent: isMe ? "flex-end" : "flex-start",
        marginBottom: 10,
        gap: 8,
        alignItems: "flex-end",
      }}>
        {!isMe && (
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: isArtist ? fandom.color : colors.muted,
            alignItems: "center", justifyContent: "center",
            borderWidth: isArtist ? 2 : 0,
            borderColor: isArtist ? fandom.color + "88" : "transparent",
          }}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: isArtist ? "#fff" : colors.foreground }}>
              {item.authorAvatar.slice(0, 1)}
            </Text>
          </View>
        )}
        <View style={{ maxWidth: "72%" }}>
          {!isMe && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: isArtist ? fandom.color : colors.mutedForeground }}>
                {item.authorName}
              </Text>
              {isArtist && (
                <View style={{ backgroundColor: fandom.color, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: "700", color: "#fff" }}>아티스트</Text>
                </View>
              )}
            </View>
          )}
          <View style={{
            backgroundColor: isMe ? fandom.color : isArtist ? fandom.color + "18" : colors.card,
            borderRadius: isMe ? 18 : 18,
            borderBottomRightRadius: isMe ? 4 : 18,
            borderBottomLeftRadius: isMe ? 18 : 4,
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderWidth: isArtist && !isMe ? 1.5 : 0,
            borderColor: fandom.color + "30",
          }}>
            <Text style={{ fontSize: 14, color: isMe ? "#fff" : colors.foreground, lineHeight: 20 }}>
              {item.content}
            </Text>
          </View>
          <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 3, textAlign: isMe ? "right" : "left" }}>
            {formatChatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", padding: 40, gap: 10 }}>
            <Text style={{ fontSize: 36 }}>💬</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.mutedForeground }}>채팅을 시작해보세요!</Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground + "99", textAlign: "center" }}>
              {fandom.artistName}과 팬들과 직접 대화하세요
            </Text>
          </View>
        }
      />
      {user ? (
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          padding: 12,
          paddingBottom: isDesktop ? 12 : insets.bottom + 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        }}>
          <View style={{
            flex: 1, flexDirection: "row", alignItems: "center",
            backgroundColor: colors.muted, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 2,
          }}>
            <TextInput
              style={{ flex: 1, fontSize: 14, color: colors.foreground, paddingVertical: 10, maxHeight: 100 }}
              placeholder="메시지 보내기..."
              placeholderTextColor={colors.mutedForeground}
              value={input}
              onChangeText={setInput}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>
          <Pressable
            style={({ pressed }) => [{
              width: 42, height: 42, borderRadius: 21,
              backgroundColor: input.trim() ? fandom.color : colors.muted,
              alignItems: "center", justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
            }]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Feather name="send" size={18} color={input.trim() ? "#fff" : colors.mutedForeground} />
          </Pressable>
        </View>
      ) : (
        <View style={{ padding: 16, alignItems: "center", borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>채팅에 참여하려면 로그인이 필요합니다</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function StoreTabContent({ fandomId, fandom }: { fandomId: string; fandom: Fandom }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktop();
  const { getProductsByFandom, addToCart, cart, cartCount } = useStore();
  const [showCart, setShowCart] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"all" | "album" | "goods">("all");

  const products = getProductsByFandom(fandomId);
  const filtered = activeType === "all" ? products : products.filter((p) => p.type === activeType);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleAdd = (productId: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToCart(productId);
    showToast(`🛒 "${name}" 장바구니에 추가!`);
  };

  const BADGE_COLORS: Record<string, string> = {
    "신상품": "#10b981", "한정판": "#f59e0b", "인기": "#ef4444", "품절임박": "#6b7280",
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Filter bar */}
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        {(["all", "album", "goods"] as const).map((type) => (
          <Pressable
            key={type}
            style={{
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
              backgroundColor: activeType === type ? fandom.color : colors.muted,
            }}
            onPress={() => setActiveType(type)}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: activeType === type ? "#fff" : colors.mutedForeground }}>
              {type === "all" ? "전체" : type === "album" ? "💿 음반" : "🎁 굿즈"}
            </Text>
          </Pressable>
        ))}
        {cartCount > 0 && (
          <Pressable
            style={{ marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: fandom.color }}
            onPress={() => setShowCart(true)}
          >
            <Feather name="shopping-cart" size={14} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>{cartCount}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: isDesktop ? 40 : insets.bottom + 80 }}>
        {filtered.map((product) => {
          const inCart = cart.find((c) => c.productId === product.id);
          return (
            <View key={product.id} style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
            }}>
              {/* Product header */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16 }}>
                <View style={{
                  width: 60, height: 60, borderRadius: 12,
                  backgroundColor: fandom.color + "18",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 30 }}>{product.emoji}</Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {product.badge && (
                      <View style={{ backgroundColor: BADGE_COLORS[product.badge] + "22", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, fontWeight: "700", color: BADGE_COLORS[product.badge] }}>{product.badge}</Text>
                      </View>
                    )}
                    <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{product.type === "album" ? "음반" : "굿즈"}</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>{product.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, lineHeight: 17 }}>{product.description}</Text>
                </View>
              </View>
              {/* Price + CTA */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14 }}>
                <View style={{ gap: 2 }}>
                  {product.originalPrice && (
                    <Text style={{ fontSize: 11, color: colors.mutedForeground, textDecorationLine: "line-through" }}>
                      ₩{product.originalPrice.toLocaleString()}
                    </Text>
                  )}
                  <Text style={{ fontSize: 18, fontWeight: "800", color: fandom.color }}>
                    ₩{product.price.toLocaleString()}
                  </Text>
                </View>
                <Pressable
                  style={({ pressed }) => [{
                    flexDirection: "row", alignItems: "center", gap: 6,
                    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24,
                    backgroundColor: inCart ? colors.muted : fandom.color,
                    opacity: pressed ? 0.8 : 1,
                  }]}
                  onPress={() => handleAdd(product.id, product.name)}
                >
                  <Feather name={inCart ? "check" : "shopping-cart"} size={14} color={inCart ? colors.mutedForeground : "#fff"} />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: inCart ? colors.mutedForeground : "#fff" }}>
                    {inCart ? `담음 (${inCart.quantity})` : "담기"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
        {filtered.length === 0 && (
          <View style={{ alignItems: "center", padding: 40, gap: 10 }}>
            <Text style={{ fontSize: 36 }}>🛍️</Text>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.mutedForeground }}>준비 중입니다</Text>
          </View>
        )}
      </ScrollView>

      {/* Cart Sheet */}
      {showCart && <CartSheet fandom={fandom} onClose={() => setShowCart(false)} />}

      {/* Toast */}
      {toast && (
        <View style={{ position: "absolute", bottom: isDesktop ? 20 : insets.bottom + 90, left: 20, right: 20, backgroundColor: "#1a1a2e", borderRadius: 12, padding: 14, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

function CartSheet({ fandom, onClose }: { fandom: Fandom; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktop();
  const { cart, cartTotal, getProductById, updateQuantity, removeFromCart, checkout, clearCart } = useStore();
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setChecking(true);
    try {
      await checkout();
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); }, 2000);
    } finally {
      setChecking(false);
    }
  };

  if (done) {
    return (
      <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 32, alignItems: "center", gap: 12, margin: 20 }}>
          <Text style={{ fontSize: 48 }}>🎉</Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: colors.foreground }}>주문 완료!</Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center" }}>
            주문이 성공적으로 접수되었습니다.{"\n"}빠르게 배송해드릴게요!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      <View style={{ backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "80%", paddingBottom: isDesktop ? 20 : insets.bottom + 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.foreground }}>🛒 장바구니</Text>
          <Pressable onPress={onClose}><Feather name="x" size={22} color={colors.mutedForeground} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {cart.length === 0 ? (
            <View style={{ alignItems: "center", padding: 32, gap: 8 }}>
              <Text style={{ fontSize: 32 }}>🛒</Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>장바구니가 비어있습니다</Text>
            </View>
          ) : cart.map((item) => {
            const product = getProductById(item.productId);
            if (!product) return null;
            return (
              <View key={item.productId} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Text style={{ fontSize: 28 }}>{product.emoji}</Text>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{product.name}</Text>
                  <Text style={{ fontSize: 13, color: fandom.color, fontWeight: "700" }}>₩{(product.price * item.quantity).toLocaleString()}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.muted, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Pressable onPress={() => item.quantity <= 1 ? removeFromCart(item.productId) : updateQuantity(item.productId, item.quantity - 1)}>
                    <Feather name={item.quantity <= 1 ? "trash-2" : "minus"} size={14} color={colors.mutedForeground} />
                  </Pressable>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground, minWidth: 16, textAlign: "center" }}>{item.quantity}</Text>
                  <Pressable onPress={() => updateQuantity(item.productId, item.quantity + 1)}>
                    <Feather name="plus" size={14} color={colors.mutedForeground} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
        {cart.length > 0 && (
          <View style={{ padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>합계</Text>
              <Text style={{ fontSize: 18, fontWeight: "800", color: fandom.color }}>₩{cartTotal.toLocaleString()}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [{ backgroundColor: fandom.color, borderRadius: 16, padding: 16, alignItems: "center", opacity: pressed || checking ? 0.8 : 1 }]}
              onPress={handleCheckout}
              disabled={checking}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{checking ? "처리 중..." : "결제하기"}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { fandoms, posts, followedFandomIds, toggleFollow } = useFandom();
  const { t } = useLanguage();
  const { earnXP } = useXP();
  const isWeb = useIsDesktop();
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
    store: "🛍️ 스토어",
    chat: "💬 채팅",
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
        <View style={{ marginBottom: 14 }}>
          <ArtistAvatar
            avatarUrl={fandom.avatarUrl}
            emoji={fandom.emoji}
            size={96}
            backgroundColor="rgba(255,255,255,0.22)"
            borderWidth={3}
            borderColor="rgba(255,255,255,0.5)"
          />
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
      {(["intro", "news", "fans", "store", "chat"] as Tab[]).map((tab) => (
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
          <ArtistAvatar
            avatarUrl={fandom.avatarUrl}
            emoji={fandom.emoji}
            size={36}
            backgroundColor={fandom.color}
          />
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

  if (activeTab === "store" || activeTab === "chat") {
    const subtitle = activeTab === "store" ? "굿즈 · 음반 스토어" : "실시간 채팅방";
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ backgroundColor: fandom.color, paddingTop: isWeb ? 16 : insets.top + 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 14 }}>
            <Pressable
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.25)", alignItems: "center", justifyContent: "center" }}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={18} color="#fff" />
            </Pressable>
            <ArtistAvatar avatarUrl={fandom.avatarUrl} emoji={fandom.emoji} size={36} backgroundColor="rgba(255,255,255,0.2)" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#fff" }}>{fandom.artistName}</Text>
              <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{subtitle}</Text>
            </View>
          </View>
          {tabBar}
        </View>
        {activeTab === "store" && <StoreTabContent fandomId={id ?? ""} fandom={fandom} />}
        {activeTab === "chat" && <ChatTabContent fandomId={id ?? ""} fandom={fandom} />}
      </View>
    );
  }

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
