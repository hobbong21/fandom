import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface ChatMessage {
  id: string;
  fandomId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: number;
  isArtist?: boolean;
}

interface ChatContextValue {
  getMessages: (fandomId: string) => ChatMessage[];
  sendMessage: (fandomId: string, authorId: string, authorName: string, authorAvatar: string, content: string) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);
const CHAT_KEY = "fandom_chat_v2";

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  "1": [
    { id: "c1-1", fandomId: "1", authorId: "artist", authorName: "IU (아이유)", authorAvatar: "IU", content: "유아이들 안녕하세요 🌙 오늘도 좋은 하루 보내고 있나요? 여러분 덕분에 오늘도 행복하게 음악 작업 중이에요 💜", timestamp: Date.now() - 7200000, isArtist: true },
    { id: "c1-2", fandomId: "1", authorId: "fan1", authorName: "별빛유아이", authorAvatar: "별", content: "언니 저 오늘 콘서트 티켓 드디어 구했어요!! 너무 기대돼요 😭💜", timestamp: Date.now() - 6800000 },
    { id: "c1-3", fandomId: "1", authorId: "fan2", authorName: "밤편지팬덤", authorAvatar: "밤", content: "새 앨범 언제 나와요? 너무 기다리고 있어요!", timestamp: Date.now() - 6200000 },
    { id: "c1-4", fandomId: "1", authorId: "artist", authorName: "IU (아이유)", authorAvatar: "IU", content: "티켓 구했군요! 공연장에서 꼭 만나요 🎤 새 앨범도 곧 소식 전할게요!", timestamp: Date.now() - 5800000, isArtist: true },
    { id: "c1-5", fandomId: "1", authorId: "fan3", authorName: "유아이나라팬", authorAvatar: "유", content: "아이유 언니 채팅에 직접 오셨다ㅠㅠㅠ 너무 감동이에요", timestamp: Date.now() - 5200000 },
  ],
  "2": [
    { id: "c2-1", fandomId: "2", authorId: "artist", authorName: "잔나비", authorAvatar: "잔", content: "안녕 잔나비 팬 여러분 🌻 요즘 날씨가 너무 좋아서 새 곡 작업에 더 집중이 잘 돼요. 다음 달에 좋은 소식 들려드릴게요!", timestamp: Date.now() - 5400000, isArtist: true },
    { id: "c2-2", fandomId: "2", authorId: "fan1", authorName: "인디홀릭", authorAvatar: "인", content: "버스킹 현장 너무 좋았어요!! 다음엔 어디서 하나요?", timestamp: Date.now() - 4800000 },
    { id: "c2-3", fandomId: "2", authorId: "artist", authorName: "잔나비", authorAvatar: "잔", content: "다음 버스킹은 신촌 쪽에서 할 것 같아요. 날짜 확정되면 바로 알려드릴게요 🎸", timestamp: Date.now() - 4200000, isArtist: true },
  ],
  "3": [
    { id: "c3-1", fandomId: "3", authorId: "artist", authorName: "임영웅", authorAvatar: "임", content: "영웅시대 여러분, 오늘도 열심히 연습하고 있어요 🦸 여러분의 응원이 제 힘이 됩니다. 다음 콘서트에서 꼭 만나요!", timestamp: Date.now() - 8400000, isArtist: true },
    { id: "c3-2", fandomId: "3", authorId: "fan1", authorName: "영웅이가좋아", authorAvatar: "영", content: "오빠 오늘 방송에서 너무 잘생기셨어요ㅠㅠ 매일 응원해요!", timestamp: Date.now() - 7200000 },
    { id: "c3-3", fandomId: "3", authorId: "fan2", authorName: "콘서트매니아", authorAvatar: "콘", content: "콘서트 티켓 구했어요!!! D-30입니다 ㅠㅠ", timestamp: Date.now() - 6000000 },
    { id: "c3-4", fandomId: "3", authorId: "artist", authorName: "임영웅", authorAvatar: "임", content: "고마워요! 공연장에서 만나서 더 좋은 무대 보여드릴게요 💙", timestamp: Date.now() - 5400000, isArtist: true },
  ],
  "4": [
    { id: "c4-1", fandomId: "4", authorId: "artist", authorName: "넬 (NELL)", authorAvatar: "넬", content: "안녕하세요. 넬입니다 🌧️ 새 앨범 발매가 일주일 앞으로 다가왔네요. 이번 앨범은 저희에게도 특별한 작업이었어요. 잘 들어주세요.", timestamp: Date.now() - 86400000, isArtist: true },
    { id: "c4-2", fandomId: "4", authorId: "fan1", authorName: "회색지대팬", authorAvatar: "회", content: "정말 기다리고 있었어요. 이번 앨범 어떤 분위기인가요?", timestamp: Date.now() - 80000000 },
    { id: "c4-3", fandomId: "4", authorId: "artist", authorName: "넬 (NELL)", authorAvatar: "넬", content: "이번엔 조금 더 솔직한 감정들을 담았어요. 직접 들으시면 느껴지실 거예요.", timestamp: Date.now() - 75000000, isArtist: true },
  ],
  "5": [
    { id: "c5-1", fandomId: "5", authorId: "artist", authorName: "송가인", authorAvatar: "송", content: "가인나라 여러분 안녕하세요 🌺 오늘 연습실에서 팬레터 읽다가 눈물이 났어요. 여러분의 마음이 너무 따뜻해서요. 정말 고마워요!", timestamp: Date.now() - 10800000, isArtist: true },
    { id: "c5-2", fandomId: "5", authorId: "fan1", authorName: "가인나라팬", authorAvatar: "가", content: "언니 부산 콘서트 정말 기대돼요!! 부산 팬들 다 모입시다!!", timestamp: Date.now() - 9600000 },
    { id: "c5-3", fandomId: "5", authorId: "fan2", authorName: "트롯사랑해", authorAvatar: "트", content: "언니 노래 들으면 항상 힘이 나요 ㅠㅠ 감사합니다", timestamp: Date.now() - 8400000 },
    { id: "c5-4", fandomId: "5", authorId: "artist", authorName: "송가인", authorAvatar: "송", content: "부산 콘서트에서 만나요! 더 신나게 공연할게요 🎤 여러분의 응원이 최고의 에너지예요!", timestamp: Date.now() - 7200000, isArtist: true },
  ],
  "6": [
    { id: "c6-1", fandomId: "6", authorId: "artist", authorName: "10cm", authorAvatar: "10", content: "안녕하세요, 권정열입니다 🎵 봄에 새 노래 들고 나타날게요. 준비 중이에요 :)", timestamp: Date.now() - 43200000, isArtist: true },
    { id: "c6-2", fandomId: "6", authorId: "fan1", authorName: "10cm팬클럽", authorAvatar: "텐", content: "빨리 들어보고 싶어요! 어쿠스틱 스타일인가요?", timestamp: Date.now() - 39600000 },
    { id: "c6-3", fandomId: "6", authorId: "artist", authorName: "10cm", authorAvatar: "10", content: "이번엔 약간 다른 시도를 해봤어요. 들으시면 알 거예요 😏", timestamp: Date.now() - 36000000, isArtist: true },
  ],
  "7": [
    { id: "c7-1", fandomId: "7", authorId: "artist", authorName: "장민호", authorAvatar: "장", content: "민호나라 여러분 안녕하세요 🎙️ 콘서트 준비가 한창이에요. 이번 공연은 정말 특별하게 준비하고 있으니 기대해주세요!", timestamp: Date.now() - 14400000, isArtist: true },
    { id: "c7-2", fandomId: "7", authorId: "fan1", authorName: "민호나라팬", authorAvatar: "민", content: "KSPO돔 콘서트 티켓 구했어요!! 너무 기대돼요!", timestamp: Date.now() - 12000000 },
    { id: "c7-3", fandomId: "7", authorId: "fan2", authorName: "트롯킹팬", authorAvatar: "킹", content: "민호씨 항상 최고예요. 응원합니다!!", timestamp: Date.now() - 10800000 },
    { id: "c7-4", fandomId: "7", authorId: "artist", authorName: "장민호", authorAvatar: "장", content: "감사합니다! 공연에서 직접 만나서 더 좋은 무대 보여드릴게요. 사랑합니다 🧡", timestamp: Date.now() - 9600000, isArtist: true },
  ],
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CHAT_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Record<string, ChatMessage[]>;
          setMessagesMap((prev) => {
            const merged: Record<string, ChatMessage[]> = { ...prev };
            for (const [fid, msgs] of Object.entries(saved)) {
              const existing = prev[fid] ?? [];
              const existingIds = new Set(existing.map((m) => m.id));
              const newMsgs = msgs.filter((m) => !existingIds.has(m.id));
              merged[fid] = [...existing, ...newMsgs].sort((a, b) => a.timestamp - b.timestamp);
            }
            return merged;
          });
        }
      } catch {}
    })();
  }, []);

  const getMessages = useCallback((fandomId: string): ChatMessage[] => {
    return messagesMap[fandomId] ?? [];
  }, [messagesMap]);

  const sendMessage = useCallback((
    fandomId: string,
    authorId: string,
    authorName: string,
    authorAvatar: string,
    content: string,
  ) => {
    const msg: ChatMessage = {
      id: `${fandomId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      fandomId,
      authorId,
      authorName,
      authorAvatar,
      content,
      timestamp: Date.now(),
    };
    setMessagesMap((prev) => {
      const updated = { ...prev, [fandomId]: [...(prev[fandomId] ?? []), msg] };
      AsyncStorage.setItem(CHAT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <ChatContext.Provider value={{ getMessages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
