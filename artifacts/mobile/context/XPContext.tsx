import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { XP_ACTIONS, XPActionKey, getTierInfo } from "@/constants/fanTiers";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";

interface XPToast {
  id: string;
  message: string;
  xp: number;
}

interface XPContextValue {
  totalXP: number;
  earnXP: (action: XPActionKey) => void;
  chonConnections: ChonConnection[];
  addChonConnection: (name: string, avatar: string) => void;
}

export interface ChonConnection {
  id: string;
  name: string;
  avatar: string;
  degree: 1 | 2;
  xp: number;
  tier: string;
  joinedAt: string;
}

const XPContext = createContext<XPContextValue | undefined>(undefined);
const XP_STORAGE_KEY = "chon_xp_total";
const CHON_STORAGE_KEY = "chon_connections";

const SAMPLE_CONNECTIONS: ChonConnection[] = [
  { id: "c1", name: "별빛팬", avatar: "별", degree: 1, xp: 3200, tier: "middle", joinedAt: "2024-01" },
  { id: "c2", name: "달님사랑", avatar: "달", degree: 1, xp: 6700, tier: "royal", joinedAt: "2024-02" },
  { id: "c3", name: "팬심가득", avatar: "팬", degree: 2, xp: 980, tier: "casual", joinedAt: "2024-03" },
  { id: "c4", name: "최고팬01", avatar: "최", degree: 1, xp: 5100, tier: "royal", joinedAt: "2024-01" },
  { id: "c5", name: "하트러버", avatar: "하", degree: 2, xp: 2300, tier: "middle", joinedAt: "2024-04" },
];

export function XPProvider({ children }: { children: React.ReactNode }) {
  const [totalXP, setTotalXP] = useState(120);
  const [toasts, setToasts] = useState<XPToast[]>([]);
  const [chonConnections, setChonConnections] = useState<ChonConnection[]>(SAMPLE_CONNECTIONS);
  const { language } = useLanguage();
  const colors = useColors();

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(XP_STORAGE_KEY);
        if (stored) setTotalXP(parseInt(stored, 10));
        const storedChon = await AsyncStorage.getItem(CHON_STORAGE_KEY);
        if (storedChon) setChonConnections(JSON.parse(storedChon));
      } catch {}
    })();
  }, []);

  const showToast = useCallback((message: string, xp: number) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, xp }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  const earnXP = useCallback(
    (action: XPActionKey) => {
      const actionInfo = XP_ACTIONS[action];
      const xpAmount = actionInfo.xp;
      const label = language === "ko" ? actionInfo.label.ko : actionInfo.label.en;

      setTotalXP((prev) => {
        const next = prev + xpAmount;
        AsyncStorage.setItem(XP_STORAGE_KEY, next.toString());
        const prevTier = getTierInfo(prev).tier;
        const nextTier = getTierInfo(next).tier;
        if (prevTier !== nextTier) {
          const tierLabel = getTierInfo(next);
          showToast(
            language === "ko"
              ? `${tierLabel.emoji} ${tierLabel.label.ko} 등급 달성!`
              : `${tierLabel.emoji} ${tierLabel.label.en} tier reached!`,
            xpAmount
          );
        } else {
          showToast(label, xpAmount);
        }
        return next;
      });
    },
    [language, showToast]
  );

  const addChonConnection = useCallback((name: string, avatar: string) => {
    const newConn: ChonConnection = {
      id: Date.now().toString(),
      name,
      avatar: avatar.charAt(0).toUpperCase(),
      degree: 1,
      xp: Math.floor(Math.random() * 3000),
      tier: "casual",
      joinedAt: new Date().toISOString().slice(0, 7),
    };
    setChonConnections((prev) => {
      const next = [newConn, ...prev];
      AsyncStorage.setItem(CHON_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <XPContext.Provider value={{ totalXP, earnXP, chonConnections, addChonConnection }}>
      {children}
      <View style={styles.toastContainer} pointerEvents="none">
        {toasts.map((toast) => (
          <XPToastItem key={toast.id} toast={toast} colors={colors} />
        ))}
      </View>
    </XPContext.Provider>
  );
}

function XPToastItem({ toast, colors }: { toast: XPToast; colors: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: colors.primary, opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={[styles.toastText, { color: colors.primaryForeground }]}>
        {toast.message}
      </Text>
      <Text style={[styles.toastXP, { color: colors.primaryForeground }]}>
        +{toast.xp} XP
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 110 : 120,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 8,
    zIndex: 9999,
    pointerEvents: "none" as any,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: { fontSize: 14, fontWeight: "600" },
  toastXP: { fontSize: 13, fontWeight: "700", opacity: 0.9 },
});

export function useXP() {
  const ctx = useContext(XPContext);
  if (!ctx) throw new Error("useXP must be used within XPProvider");
  return ctx;
}
