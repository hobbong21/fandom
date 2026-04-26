export type FanTier = "casual" | "middle" | "royal";

export interface TierInfo {
  tier: FanTier;
  label: { ko: string; en: string };
  emoji: string;
  color: string;
  bgColor: string;
  minXP: number;
  maxXP: number | null;
  description: { ko: string; en: string };
}

export const FAN_TIERS: TierInfo[] = [
  {
    tier: "casual",
    label: { ko: "캐주얼", en: "Casual" },
    emoji: "🌱",
    color: "#6b7280",
    bgColor: "#f3f4f6",
    minXP: 0,
    maxXP: 999,
    description: { ko: "팬덤 입문자", en: "Fandom Newcomer" },
  },
  {
    tier: "middle",
    label: { ko: "미들", en: "Middle" },
    emoji: "⭐",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    minXP: 1000,
    maxXP: 4999,
    description: { ko: "열정적인 팬", en: "Passionate Fan" },
  },
  {
    tier: "royal",
    label: { ko: "로열", en: "Royal" },
    emoji: "👑",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    minXP: 5000,
    maxXP: null,
    description: { ko: "진정한 팬덤 로열티", en: "True Fandom Royalty" },
  },
];

export function getTierInfo(xp: number): TierInfo {
  for (let i = FAN_TIERS.length - 1; i >= 0; i--) {
    if (xp >= FAN_TIERS[i].minXP) return FAN_TIERS[i];
  }
  return FAN_TIERS[0];
}

export function getNextTierInfo(xp: number): TierInfo | null {
  const current = getTierInfo(xp);
  const idx = FAN_TIERS.findIndex((t) => t.tier === current.tier);
  return idx < FAN_TIERS.length - 1 ? FAN_TIERS[idx + 1] : null;
}

export function getProgressToNextTier(xp: number): number {
  const current = getTierInfo(xp);
  const next = getNextTierInfo(xp);
  if (!next) return 1;
  const range = next.minXP - current.minXP;
  const earned = xp - current.minXP;
  return Math.min(earned / range, 1);
}

export const XP_ACTIONS = {
  LIKE_POST: { xp: 5, label: { ko: "좋아요", en: "Like" } },
  WRITE_POST: { xp: 50, label: { ko: "게시글 작성", en: "Post" } },
  WRITE_COMMENT: { xp: 20, label: { ko: "댓글 작성", en: "Comment" } },
  JOIN_FANDOM: { xp: 30, label: { ko: "팬덤 가입", en: "Join Fandom" } },
  DAILY_LOGIN: { xp: 10, label: { ko: "일일 접속", en: "Daily Login" } },
} as const;

export type XPActionKey = keyof typeof XP_ACTIONS;
