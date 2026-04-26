import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { ChonConnection } from "@/context/XPContext";
import { useColors } from "@/hooks/useColors";

interface NodeData extends ChonConnection {
  x: number;
  y: number;
  parentId?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  connections: ChonConnection[];
  userName: string;
  userInitials: string;
  totalXP: number;
}

const DEGREE_RING = {
  1: { stroke: "#ec4899", glow: "#ec489930", label: "1촌" },
  2: { stroke: "#10b981", glow: "#10b98130", label: "2촌" },
};

const TIER_COLOR: Record<string, string> = {
  casual: "#6b7280",
  middle: "#3b82f6",
  royal: "#f59e0b",
};

const TIER_EMOJI: Record<string, string> = {
  casual: "🌱",
  middle: "⭐",
  royal: "👑",
};

export function ChonNetworkGraph({ visible, onClose, connections, userName, userInitials, totalXP }: Props) {
  const colors = useColors();
  const { width, height } = useWindowDimensions();
  const [selected, setSelected] = useState<NodeData | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  const canvasW = Math.min(width - 16, 520);
  const canvasH = canvasW;
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const R1 = canvasW * 0.27;
  const R2 = canvasW * 0.43;
  const CENTER_R = 34;
  const NODE_R1 = 25;
  const NODE_R2 = 19;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.88);
      setSelected(null);
    }
  }, [visible]);

  const degree1 = connections.filter((c) => c.degree === 1);
  const degree2 = connections.filter((c) => c.degree === 2);

  const nodes1: NodeData[] = degree1.map((c, i) => {
    const angle = (2 * Math.PI * i) / Math.max(degree1.length, 1) - Math.PI / 2;
    return { ...c, x: cx + R1 * Math.cos(angle), y: cy + R1 * Math.sin(angle) };
  });

  const nodes2: NodeData[] = degree2.map((c, i) => {
    const parentIndex = i % Math.max(nodes1.length, 1);
    const parent = nodes1[parentIndex];
    const sameParentCount = Math.ceil(degree2.length / Math.max(nodes1.length, 1));
    const sib = Math.floor(i / Math.max(nodes1.length, 1));
    const baseAngle = parent ? Math.atan2(parent.y - cy, parent.x - cx) : (2 * Math.PI * i) / Math.max(degree2.length, 1) - Math.PI / 2;
    const spread = Math.PI / 3.5;
    const offset = sameParentCount > 1 ? (sib - (sameParentCount - 1) / 2) * (spread / (sameParentCount - 1)) : 0;
    const angle = baseAngle + offset;
    return {
      ...c,
      x: cx + R2 * Math.cos(angle),
      y: cy + R2 * Math.sin(angle),
      parentId: parent?.id,
    };
  });

  const isDark = colors.background === "#09090b" || colors.background.startsWith("#0");
  const bgColor = isDark ? "#0f0f1a" : "#f8f6ff";
  const lineColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(100,100,120,0.18)";

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: bgColor }}>

        {/* Header */}
        <View style={{
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14,
          borderBottomWidth: 1, borderBottomColor: colors.border,
        }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: "800", color: colors.foreground }}>🕸️ 촌수 네트워크</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
              {connections.length}명 연결 · 1촌 {degree1.length}명 · 2촌 {degree2.length}명
            </Text>
          </View>
          <Pressable
            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center" }}
            onPress={onClose}
          >
            <Feather name="x" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Legend */}
          <View style={{ flexDirection: "row", gap: 14, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4, flexWrap: "wrap" }}>
            {[
              { color: "#7c3aed", label: "나" },
              { color: "#ec4899", label: "1촌 링크" },
              { color: "#10b981", label: "2촌 링크" },
            ].map((item) => (
              <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{item.label}</Text>
              </View>
            ))}
            <View style={{ marginLeft: "auto", flexDirection: "row", gap: 10 }}>
              {Object.entries(TIER_EMOJI).map(([tier, emoji]) => (
                <Text key={tier} style={{ fontSize: 11, color: colors.mutedForeground }}>{emoji} {tier === "casual" ? "캐주얼" : tier === "middle" ? "미들" : "로열"}</Text>
              ))}
            </View>
          </View>

          {/* SVG Graph */}
          <Animated.View style={{ alignItems: "center", paddingTop: 8, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            <Svg width={canvasW} height={canvasH}>
              <Defs>
                <RadialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
                  <Stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
                </RadialGradient>
              </Defs>

              {/* Concentric guide rings */}
              <Circle cx={cx} cy={cy} r={R1} stroke={lineColor} strokeWidth={1} fill="none" strokeDasharray="3 5" />
              <Circle cx={cx} cy={cy} r={R2} stroke={lineColor} strokeWidth={1} fill="none" strokeDasharray="3 7" />

              {/* Edges: center → 1촌 */}
              {nodes1.map((n) => (
                <Line key={`ec-${n.id}`} x1={cx} y1={cy} x2={n.x} y2={n.y}
                  stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="5 4" opacity={0.4} />
              ))}

              {/* Edges: 1촌 → 2촌 */}
              {nodes2.map((n) => {
                const parent = nodes1.find((p) => p.id === n.parentId);
                if (!parent) return null;
                return (
                  <Line key={`e2-${n.id}`} x1={parent.x} y1={parent.y} x2={n.x} y2={n.y}
                    stroke="#10b981" strokeWidth={1.2} strokeDasharray="4 5" opacity={0.35} />
                );
              })}

              {/* 2촌 nodes */}
              {nodes2.map((n) => {
                const tier = TIER_COLOR[n.tier] ?? "#6b7280";
                const isSelected = selected?.id === n.id;
                return (
                  <G key={n.id} onPress={() => setSelected(isSelected ? null : n)}>
                    <Circle cx={n.x} cy={n.y} r={NODE_R2 + 7} fill="#10b981" opacity={isSelected ? 0.22 : 0.1} />
                    <Circle cx={n.x} cy={n.y} r={NODE_R2} fill={tier} stroke="#10b981" strokeWidth={isSelected ? 3 : 2} />
                    <SvgText x={n.x} y={n.y + 5} textAnchor="middle" fill="#fff" fontSize={11} fontWeight="700">
                      {n.avatar.charAt(0)}
                    </SvgText>
                    <SvgText x={n.x} y={n.y + NODE_R2 + 13} textAnchor="middle" fill={colors.mutedForeground} fontSize={9}>
                      {n.name}
                    </SvgText>
                    <SvgText x={n.x} y={n.y + NODE_R2 + 22} textAnchor="middle" fill="#10b981" fontSize={8} opacity={0.8}>
                      2촌
                    </SvgText>
                  </G>
                );
              })}

              {/* 1촌 nodes */}
              {nodes1.map((n) => {
                const tier = TIER_COLOR[n.tier] ?? "#6b7280";
                const isSelected = selected?.id === n.id;
                return (
                  <G key={n.id} onPress={() => setSelected(isSelected ? null : n)}>
                    <Circle cx={n.x} cy={n.y} r={NODE_R1 + 8} fill="#ec4899" opacity={isSelected ? 0.2 : 0.09} />
                    <Circle cx={n.x} cy={n.y} r={NODE_R1} fill={tier} stroke="#ec4899" strokeWidth={isSelected ? 3.5 : 2.5} />
                    <SvgText x={n.x} y={n.y + 5} textAnchor="middle" fill="#fff" fontSize={13} fontWeight="700">
                      {n.avatar.charAt(0)}
                    </SvgText>
                    <SvgText x={n.x} y={n.y + NODE_R1 + 13} textAnchor="middle" fill={colors.foreground} fontSize={10} fontWeight="600">
                      {n.name}
                    </SvgText>
                    <SvgText x={n.x} y={n.y + NODE_R1 + 23} textAnchor="middle" fill="#ec4899" fontSize={8} opacity={0.9}>
                      1촌
                    </SvgText>
                  </G>
                );
              })}

              {/* Center: 나 */}
              <Circle cx={cx} cy={cy} r={CENTER_R + 10} fill="#7c3aed" opacity={0.13} />
              <Circle cx={cx} cy={cy} r={CENTER_R} fill="url(#centerGrad)" stroke="#a78bfa" strokeWidth={3} />
              <SvgText x={cx} y={cy - 4} textAnchor="middle" fill="#fff" fontSize={13} fontWeight="800">
                {userInitials}
              </SvgText>
              <SvgText x={cx} y={cy + 10} textAnchor="middle" fill="#e9d5ff" fontSize={9}>
                나
              </SvgText>
              <SvgText x={cx} y={cy + CENTER_R + 15} textAnchor="middle" fill={colors.foreground} fontSize={10} fontWeight="600">
                {userName}
              </SvgText>
            </Svg>
          </Animated.View>

          {/* Selected node detail card */}
          {selected ? (
            <View style={{
              marginHorizontal: 20, marginTop: 4, padding: 16,
              backgroundColor: colors.card, borderRadius: 18,
              borderWidth: 1.5, borderColor: selected.degree === 1 ? "#ec4899" : "#10b981",
              gap: 12,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{
                  width: 48, height: 48, borderRadius: 24,
                  backgroundColor: (TIER_COLOR[selected.tier] ?? "#6b7280") + "30",
                  borderWidth: 2, borderColor: TIER_COLOR[selected.tier] ?? "#6b7280",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 20, fontWeight: "700", color: TIER_COLOR[selected.tier] ?? "#6b7280" }}>
                    {selected.avatar.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: colors.foreground }}>{selected.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                    {selected.degree === 1 ? "1촌 · 직접 연결" : "2촌 · 간접 연결"} · 가입 {selected.joinedAt}
                  </Text>
                </View>
                <Pressable onPress={() => setSelected(null)}>
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1, backgroundColor: (TIER_COLOR[selected.tier] ?? "#6b7280") + "15", borderRadius: 12, padding: 12, alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: TIER_COLOR[selected.tier] ?? "#6b7280" }}>
                    {selected.xp.toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground }}>XP</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: (selected.degree === 1 ? "#ec4899" : "#10b981") + "15", borderRadius: 12, padding: 12, alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 22 }}>{TIER_EMOJI[selected.tier] ?? "🌱"}</Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                    {selected.tier === "casual" ? "캐주얼" : selected.tier === "middle" ? "미들" : "로열"}
                  </Text>
                </View>
                <View style={{ flex: 1, backgroundColor: "#7c3aed15", borderRadius: 12, padding: 12, alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#7c3aed" }}>{selected.degree}촌</Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground }}>나와의 거리</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ marginHorizontal: 20, marginTop: 8, padding: 14, backgroundColor: colors.muted + "60", borderRadius: 14, alignItems: "center" }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>노드를 탭하면 팬 정보를 볼 수 있어요</Text>
            </View>
          )}

          {/* Stats summary */}
          <View style={{ flexDirection: "row", gap: 10, marginHorizontal: 20, marginTop: 16 }}>
            {[
              { label: "전체 연결", value: connections.length, color: "#7c3aed" },
              { label: "1촌", value: degree1.length, color: "#ec4899" },
              { label: "2촌", value: degree2.length, color: "#10b981" },
              { label: "로열 팬", value: connections.filter((c) => c.tier === "royal").length, color: "#f59e0b" },
            ].map((s) => (
              <View key={s.label} style={{ flex: 1, backgroundColor: s.color + "12", borderRadius: 12, padding: 10, alignItems: "center", gap: 3 }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: s.color }}>{s.value}</Text>
                <Text style={{ fontSize: 10, color: colors.mutedForeground, textAlign: "center" }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
