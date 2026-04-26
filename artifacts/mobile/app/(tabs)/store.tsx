import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArtistAvatar } from "@/components/ArtistAvatar";
import { useFandom } from "@/context/FandomContext";
import { useStore } from "@/context/StoreContext";
import { useColors } from "@/hooks/useColors";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import type { Product } from "@/constants/storeData";

function formatPrice(n: number) {
  return "₩" + n.toLocaleString("ko-KR");
}

function BadgeLabel({ badge, color }: { badge: string; color: string }) {
  const bg = badge === "신상품" ? "#10b981" : badge === "한정판" ? "#f97316" : badge === "인기" ? "#ef4444" : "#64748b";
  return (
    <View style={{ backgroundColor: bg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start" }}>
      <Text style={{ fontSize: 10, fontWeight: "700", color: "#fff" }}>{badge}</Text>
    </View>
  );
}

function ProductCard({ product, fandomColor, onAddToCart }: { product: Product; fandomColor: string; onAddToCart: () => void }) {
  const colors = useColors();
  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      flex: 1,
      margin: 5,
    }}>
      <View style={{ backgroundColor: fandomColor + "18", height: 90, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 44 }}>{product.emoji}</Text>
      </View>
      <View style={{ padding: 10, gap: 4 }}>
        {product.badge && <BadgeLabel badge={product.badge} color={fandomColor} />}
        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.foreground, lineHeight: 16 }} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: fandomColor }}>
            {formatPrice(product.price)}
          </Text>
          {product.originalPrice && (
            <Text style={{ fontSize: 11, color: colors.mutedForeground, textDecorationLine: "line-through" }}>
              {formatPrice(product.originalPrice)}
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 1 }}>
          재고 {product.stock.toLocaleString()}개
        </Text>
        <Pressable
          style={({ pressed }) => [{
            backgroundColor: fandomColor,
            borderRadius: 10,
            paddingVertical: 7,
            alignItems: "center",
            marginTop: 4,
            opacity: pressed ? 0.82 : 1,
          }]}
          onPress={onAddToCart}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>장바구니 담기</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CartSheet({ onClose }: { onClose: () => void }) {
  const colors = useColors();
  const { cart, cartTotal, removeFromCart, updateQuantity, checkout, getProductById } = useStore();
  const { fandoms } = useFandom();
  const [ordered, setOrdered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    await checkout();
    setLoading(false);
    setOrdered(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (ordered) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 40 }}>
        <Text style={{ fontSize: 60, marginBottom: 16 }}>🎉</Text>
        <Text style={{ fontSize: 22, fontWeight: "800", color: colors.foreground, textAlign: "center", marginBottom: 8 }}>주문 완료!</Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center", marginBottom: 32 }}>
          주문이 성공적으로 접수되었습니다.{"\n"}배송은 영업일 기준 3~5일 소요됩니다.
        </Text>
        <Pressable
          style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 32 }}
          onPress={onClose}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>쇼핑 계속하기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.foreground }}>장바구니 ({cart.length})</Text>
        <Pressable onPress={onClose}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      {cart.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Text style={{ fontSize: 40 }}>🛒</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.mutedForeground }}>장바구니가 비어있어요</Text>
        </View>
      ) : (
        <>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
            {cart.map((item) => {
              const product = getProductById(item.productId);
              if (!product) return null;
              const fandom = fandoms.find((f) => f.id === product.fandomId);
              const color = fandom?.color ?? "#7c3aed";
              return (
                <View key={item.productId} style={{
                  flexDirection: "row", alignItems: "center", gap: 12,
                  backgroundColor: colors.card, borderRadius: 14, padding: 12,
                  borderWidth: 1, borderColor: colors.border,
                }}>
                  <View style={{ width: 50, height: 50, backgroundColor: color + "18", borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 26 }}>{product.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }} numberOfLines={2}>{product.name}</Text>
                    <Text style={{ fontSize: 13, fontWeight: "800", color: color, marginTop: 2 }}>{formatPrice(product.price)}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Pressable
                      onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}
                    >
                      <Feather name="minus" size={14} color={colors.foreground} />
                    </Pressable>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, minWidth: 20, textAlign: "center" }}>{item.quantity}</Text>
                    <Pressable
                      onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                      style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}
                    >
                      <Feather name="plus" size={14} color={colors.foreground} />
                    </Pressable>
                  </View>
                  <Pressable onPress={() => removeFromCart(item.productId)} style={{ padding: 4 }}>
                    <Feather name="trash-2" size={16} color={colors.destructive} />
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border, gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: colors.mutedForeground }}>합계</Text>
              <Text style={{ fontSize: 20, fontWeight: "900", color: colors.foreground }}>{formatPrice(cartTotal)}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [{
                backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15,
                alignItems: "center", opacity: pressed || loading ? 0.8 : 1,
              }]}
              onPress={handleCheckout}
              disabled={loading}
            >
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}>
                {loading ? "처리 중..." : `${formatPrice(cartTotal)} 주문하기`}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

export default function StoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktop();
  const { fandoms } = useFandom();
  const { getProductsByFandom, addToCart, cartCount } = useStore();
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFandomId, setSelectedFandomId] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<"all" | "album" | "goods">("all");

  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }

  function handleAddToCart(product: Product, fandomColor: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addToCart(product.id);
    showToast(`장바구니에 담겼어요 🛒`);
  }

  const filteredFandoms = fandoms.filter((f) =>
    f.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFandom = fandoms.find((f) => f.id === selectedFandomId);

  if (showCart) {
    return (
      <View style={{ flex: 1 }}>
        <CartSheet onClose={() => setShowCart(false)} />
      </View>
    );
  }

  const headerPad = isDesktop ? 24 : insets.top + 16;

  if (selectedFandomId && selectedFandom) {
    const products = getProductsByFandom(selectedFandomId).filter((p) =>
      productFilter === "all" ? true : p.type === productFilter
    );

    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          paddingTop: headerPad, paddingBottom: 14, paddingHorizontal: 16,
          backgroundColor: selectedFandom.color,
          flexDirection: "row", alignItems: "center", gap: 12,
        }}>
          <Pressable onPress={() => setSelectedFandomId(null)} style={{ padding: 4 }}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <ArtistAvatar avatarUrl={selectedFandom.avatarUrl} emoji={selectedFandom.emoji} size={38} backgroundColor="rgba(255,255,255,0.25)" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#fff" }}>{selectedFandom.artistName}</Text>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>공식 스토어</Text>
          </View>
          <Pressable
            style={{ backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 5 }}
            onPress={() => setShowCart(true)}
          >
            <Feather name="shopping-cart" size={16} color="#fff" />
            {cartCount > 0 && <Text style={{ fontSize: 12, fontWeight: "700", color: "#fff" }}>{cartCount}</Text>}
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", backgroundColor: colors.muted, margin: 14, borderRadius: 12, padding: 4 }}>
          {(["all", "album", "goods"] as const).map((f) => (
            <Pressable
              key={f}
              style={[{ flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: "center" }, productFilter === f && { backgroundColor: colors.background }]}
              onPress={() => setProductFilter(f)}
            >
              <Text style={{ fontSize: 13, fontWeight: productFilter === f ? "700" : "500", color: productFilter === f ? colors.foreground : colors.mutedForeground }}>
                {f === "all" ? "전체" : f === "album" ? "음반" : "굿즈"}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              fandomColor={selectedFandom.color}
              onAddToCart={() => handleAddToCart(item, selectedFandom.color)}
            />
          )}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: colors.mutedForeground }}>상품이 없습니다</Text>
            </View>
          }
        />

        {toastVisible && (
          <View style={{
            position: "absolute", bottom: 120, alignSelf: "center",
            backgroundColor: "rgba(0,0,0,0.8)", borderRadius: 24,
            paddingHorizontal: 20, paddingVertical: 10,
          }}>
            <Text style={{ fontSize: 13, color: "#fff", fontWeight: "600" }}>{toastMsg}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{
        paddingTop: headerPad, paddingBottom: 14, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: colors.border,
        flexDirection: "row", alignItems: "center", gap: 12,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.foreground }}>스토어</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 1 }}>공식 굿즈 & 음반</Text>
        </View>
        <Pressable
          style={{
            backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
            flexDirection: "row", alignItems: "center", gap: 6, position: "relative",
          }}
          onPress={() => setShowCart(true)}
        >
          <Feather name="shopping-cart" size={17} color="#fff" />
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>장바구니</Text>
          {cartCount > 0 && (
            <View style={{
              position: "absolute", top: -5, right: -5,
              backgroundColor: "#ef4444", borderRadius: 10, minWidth: 18, height: 18,
              alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
            }}>
              <Text style={{ fontSize: 10, color: "#fff", fontWeight: "800" }}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 10,
          backgroundColor: colors.muted, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4,
        }}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={{ flex: 1, fontSize: 14, color: colors.foreground, paddingVertical: 9 }}
            placeholder="아티스트 검색..."
            placeholderTextColor={colors.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {filteredFandoms.map((fandom) => {
          const products = getProductsByFandom(fandom.id).slice(0, 3);
          return (
            <View key={fandom.id} style={{ marginTop: 20, paddingHorizontal: 16 }}>
              <Pressable
                style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}
                onPress={() => setSelectedFandomId(fandom.id)}
              >
                <ArtistAvatar avatarUrl={fandom.avatarUrl} emoji={fandom.emoji} size={40} backgroundColor={fandom.color + "20"} borderWidth={1.5} borderColor={fandom.color + "50"} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: colors.foreground }}>{fandom.artistName}</Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground }}>공식 스토어</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: fandom.color + "15", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: fandom.color }}>모두 보기</Text>
                  <Feather name="chevron-right" size={13} color={fandom.color} />
                </View>
              </Pressable>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
                {products.map((product) => (
                  <View key={product.id} style={{
                    width: 150, marginRight: 10,
                    backgroundColor: colors.card, borderRadius: 16,
                    borderWidth: 1, borderColor: colors.border, overflow: "hidden",
                  }}>
                    <View style={{ backgroundColor: fandom.color + "18", height: 80, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 38 }}>{product.emoji}</Text>
                    </View>
                    <View style={{ padding: 10, gap: 3 }}>
                      {product.badge && <BadgeLabel badge={product.badge} color={fandom.color} />}
                      <Text style={{ fontSize: 11, fontWeight: "700", color: colors.foreground }} numberOfLines={2}>{product.name}</Text>
                      <Text style={{ fontSize: 12, fontWeight: "800", color: fandom.color }}>{formatPrice(product.price)}</Text>
                      <Pressable
                        style={({ pressed }) => [{ backgroundColor: fandom.color, borderRadius: 8, paddingVertical: 6, alignItems: "center", marginTop: 2, opacity: pressed ? 0.8 : 1 }]}
                        onPress={() => handleAddToCart(product, fandom.color)}
                      >
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>담기</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {toastVisible && (
        <View style={{
          position: "absolute", bottom: 120, alignSelf: "center",
          backgroundColor: "rgba(0,0,0,0.8)", borderRadius: 24,
          paddingHorizontal: 20, paddingVertical: 10,
        }}>
          <Text style={{ fontSize: 13, color: "#fff", fontWeight: "600" }}>{toastMsg}</Text>
        </View>
      )}
    </View>
  );
}
