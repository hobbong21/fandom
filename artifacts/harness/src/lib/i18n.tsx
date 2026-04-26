import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ko";

interface Translations {
  [key: string]: {
    en: string;
    ko: string;
  };
}

const translations: Translations = {
  app_title: { en: "AI Harness", ko: "AI 하네스" },
  nav_chat: { en: "Chat Workspace", ko: "채팅 작업 공간" },
  nav_image: { en: "Image Lab", ko: "이미지 랩" },
  nav_history: { en: "History", ko: "히스토리" },
  new_chat: { en: "New Chat", ko: "새 채팅" },
  select_model: { en: "Select Model", ko: "모델 선택" },
  system_prompt: { en: "System Prompt", ko: "시스템 프롬프트" },
  title: { en: "Title", ko: "제목" },
  create: { en: "Create", ko: "생성" },
  cancel: { en: "Cancel", ko: "취소" },
  send: { en: "Send", ko: "전송" },
  type_message: { en: "Type a message...", ko: "메시지를 입력하세요..." },
  image_prompt: { en: "Image Prompt", ko: "이미지 프롬프트" },
  size: { en: "Size", ko: "크기" },
  generate: { en: "Generate", ko: "생성" },
  no_conversations: { en: "No conversations found.", ko: "대화가 없습니다." },
  delete: { en: "Delete", ko: "삭제" },
  history_title: { en: "Conversation History", ko: "대화 히스토리" },
  loading: { en: "Loading...", ko: "로딩 중..." },
  error: { en: "An error occurred.", ko: "오류가 발생했습니다." },
  confirm_delete: { en: "Are you sure you want to delete this?", ko: "정말 삭제하시겠습니까?" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("ai_harness_language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("ai_harness_language", language);
  }, [language]);

  const t = (key: keyof typeof translations): string => {
    return translations[key]?.[language] ?? String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
