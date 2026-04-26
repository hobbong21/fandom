export type ArtistGenre = "singer" | "indie" | "trot";

export interface Fandom {
  id: string;
  name: string;
  artistName: string;
  genre: ArtistGenre;
  category: string;
  memberCount: number;
  postCount: number;
  coverImage?: any;
  description: string;
  tags: string[];
  isFollowing: boolean;
  color: string;
  emoji: string;
  isVerified: boolean;
  recentActivity?: string;
}

export interface Post {
  id: string;
  fandomId: string;
  fandomName: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
  isSaved: boolean;
  tags: string[];
  coverImage?: any;
  isArtistPost?: boolean;
  isLive?: boolean;
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  timeAgo: string;
  isLiked: boolean;
  isArtist?: boolean;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "new_post" | "artist_post" | "live";
  title: string;
  body: string;
  timeAgo: string;
  isRead: boolean;
  avatar: string;
  isArtist?: boolean;
}

export const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: "all", label: "전체", emoji: "🎵" },
  { id: "singer", label: "가수", emoji: "🎤" },
  { id: "indie", label: "인디밴드", emoji: "🎸" },
  { id: "trot", label: "트로트", emoji: "🌸" },
];

export const INITIAL_FANDOMS: Fandom[] = [
  {
    id: "1",
    name: "IU 팬덤 유아이나라",
    artistName: "IU (아이유)",
    genre: "singer",
    category: "singer",
    memberCount: 4200000,
    postCount: 890000,
    description: "아이유와 팬들이 직접 소통하는 공간 — 신보 소식, 라이브, 팬메시지까지.",
    tags: ["아이유", "IU", "팝", "발라드", "유아인"],
    isFollowing: true,
    color: "#e879a0",
    emoji: "🌙",
    isVerified: true,
    recentActivity: "아이유가 5분 전에 메시지를 남겼어요",
  },
  {
    id: "2",
    name: "잔나비 팬클럽",
    artistName: "잔나비",
    genre: "indie",
    category: "indie",
    memberCount: 980000,
    postCount: 210000,
    description: "잔나비와 팬들이 함께하는 인디 감성 공간 — 음악, 일상, 공연 이야기.",
    tags: ["잔나비", "인디", "록", "감성"],
    isFollowing: false,
    color: "#f59e0b",
    emoji: "🌻",
    isVerified: true,
    recentActivity: "잔나비가 새 공연 소식을 올렸어요",
  },
  {
    id: "3",
    name: "임영웅 영웅시대",
    artistName: "임영웅",
    genre: "trot",
    category: "trot",
    memberCount: 5800000,
    postCount: 1200000,
    description: "임영웅과 팬들의 따뜻한 소통 공간 — 공연, 방송, 팬메시지, 일상 이야기.",
    tags: ["임영웅", "트로트", "영웅시대", "미스터트롯"],
    isFollowing: true,
    color: "#3b82f6",
    emoji: "🦸",
    isVerified: true,
    recentActivity: "임영웅이 오늘 라이브를 예고했어요",
  },
  {
    id: "4",
    name: "넬 팬덤 회색지대",
    artistName: "넬 (NELL)",
    genre: "indie",
    category: "indie",
    memberCount: 620000,
    postCount: 140000,
    description: "넬과 팬들의 감성 소통 공간 — 음악적 감상, 가사 이야기, 공연 기록.",
    tags: ["넬", "NELL", "인디록", "감성"],
    isFollowing: false,
    color: "#64748b",
    emoji: "🌧️",
    isVerified: false,
    recentActivity: "새 앨범 발매 D-7",
  },
  {
    id: "5",
    name: "송가인 가인나라",
    artistName: "송가인",
    genre: "trot",
    category: "trot",
    memberCount: 3100000,
    postCount: 720000,
    description: "송가인과 팬들의 행복한 소통 공간 — 공연 후기, 음악 이야기, 팬메시지.",
    tags: ["송가인", "트로트", "가인나라"],
    isFollowing: false,
    color: "#ec4899",
    emoji: "🌺",
    isVerified: true,
    recentActivity: "송가인이 팬 편지에 답장했어요",
  },
  {
    id: "6",
    name: "10cm 팬클럽",
    artistName: "10cm",
    genre: "indie",
    category: "indie",
    memberCount: 750000,
    postCount: 180000,
    description: "10cm와 팬들이 함께하는 따뜻한 인디 공간 — 신곡, 라이브, 일상 소통.",
    tags: ["10cm", "인디", "어쿠스틱", "발라드"],
    isFollowing: true,
    color: "#10b981",
    emoji: "🎵",
    isVerified: true,
    recentActivity: "10cm가 새 싱글 프리뷰를 공유했어요",
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "p1",
    fandomId: "1",
    fandomName: "IU 팬덤 유아이나라",
    authorName: "IU (아이유)",
    authorAvatar: "IU",
    title: "안녕하세요, 유아이들 🌙",
    content: "오늘 새 앨범 작업을 마무리했어요. 여러분이 정말 좋아할 것 같은 곡들이 담겼는데, 빨리 들려드리고 싶어서 설레는 중이에요. 조금만 더 기다려 주세요 💜",
    likes: 128400,
    comments: 8920,
    timeAgo: "2시간 전",
    isLiked: false,
    isSaved: false,
    tags: ["신보예고", "아이유"],
    isArtistPost: true,
  },
  {
    id: "p2",
    fandomId: "3",
    fandomName: "임영웅 영웅시대",
    authorName: "임영웅",
    authorAvatar: "임",
    title: "오늘 라이브 방송 합니다! 🎤",
    content: "오늘 저녁 8시에 깜짝 라이브 방송을 진행할 예정이에요. 최근 공연 비하인드도 공개할 예정이니 많이 와주세요. 영웅시대 여러분 사랑합니다!",
    likes: 214500,
    comments: 15800,
    timeAgo: "45분 전",
    isLiked: true,
    isSaved: true,
    tags: ["라이브예고", "임영웅"],
    isArtistPost: true,
    isLive: true,
  },
  {
    id: "p3",
    fandomId: "6",
    fandomName: "10cm 팬클럽",
    authorName: "10cm",
    authorAvatar: "10",
    title: "새 싱글 '봄이 좋냐' 프리뷰 🎵",
    content: "이번 봄에 딱 어울리는 새 싱글을 준비했어요. 녹음할 때부터 팬 여러분 얼굴이 떠올랐어요. 며칠 후에 만나요!",
    likes: 42300,
    comments: 3210,
    timeAgo: "3시간 전",
    isLiked: false,
    isSaved: false,
    tags: ["신곡예고", "봄"],
    isArtistPost: true,
  },
  {
    id: "p4",
    fandomId: "1",
    fandomName: "IU 팬덤 유아이나라",
    authorName: "밤편지팬",
    authorAvatar: "밤",
    title: "콘서트 현장 후기 올립니다 😭✨",
    content: "어제 콘서트 정말 최고였어요. 앞줄에서 아이유 언니 눈빛이랑 마주쳤는데 아직도 심장이 두근거려요. 마지막에 팬들한테 직접 인사해줄 때 너무 감동받았어요...",
    likes: 8920,
    comments: 412,
    timeAgo: "8시간 전",
    isLiked: false,
    isSaved: true,
    tags: ["콘서트후기", "아이유"],
  },
  {
    id: "p5",
    fandomId: "2",
    fandomName: "잔나비 팬클럽",
    authorName: "잔나비",
    authorAvatar: "잔",
    title: "홍대 버스킹 갑작스럽게 합니다 🌻",
    content: "오늘 날씨가 너무 좋아서 즉흥 버스킹을 하기로 했어요. 오후 6시, 홍대 걷고싶은거리에서 만나요. 팬 여러분이랑 직접 노래 들려드리고 싶어요!",
    likes: 31400,
    comments: 2840,
    timeAgo: "30분 전",
    isLiked: false,
    isSaved: false,
    tags: ["버스킹", "홍대", "즉흥"],
    isArtistPost: true,
  },
];

export const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "c1",
    authorName: "IU (아이유)",
    authorAvatar: "IU",
    content: "모두 기다려줘서 고마워요 💜 꼭 좋은 음악으로 보답할게요!",
    likes: 89200,
    timeAgo: "1시간 전",
    isLiked: false,
    isArtist: true,
  },
  {
    id: "c2",
    authorName: "유아이나라_공식팬",
    authorAvatar: "유",
    content: "언니 항상 최고예요!! 새 앨범 정말 기대돼요 😭💜",
    likes: 4210,
    timeAgo: "1시간 30분 전",
    isLiked: true,
  },
  {
    id: "c3",
    authorName: "밤하늘별빛",
    authorAvatar: "별",
    content: "어떤 컨셉일지 너무 궁금해요! 발라드인가요 댄스인가요? 🌙",
    likes: 1830,
    timeAgo: "2시간 전",
    isLiked: false,
  },
  {
    id: "c4",
    authorName: "팬레터쓰는중",
    authorAvatar: "팬",
    content: "언니가 직접 댓글 달아주시다니... 저 오늘 하루 너무 행복해요 ㅠㅠ",
    likes: 920,
    timeAgo: "3시간 전",
    isLiked: false,
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "artist_post",
    title: "임영웅이 라이브를 예고했어요 🎤",
    body: "\"오늘 저녁 8시 깜짝 라이브 방송 합니다!\"",
    timeAgo: "45분 전",
    isRead: false,
    avatar: "임",
    isArtist: true,
  },
  {
    id: "n2",
    type: "live",
    title: "잔나비 지금 홍대 버스킹 중! 🔴 LIVE",
    body: "오후 6시 홍대 걷고싶은거리 — 지금 바로 확인하세요",
    timeAgo: "30분 전",
    isRead: false,
    avatar: "잔",
    isArtist: true,
  },
  {
    id: "n3",
    type: "artist_post",
    title: "IU가 새 앨범 소식을 전했어요 🌙",
    body: "\"오늘 새 앨범 작업을 마무리했어요...\"",
    timeAgo: "2시간 전",
    isRead: false,
    avatar: "IU",
    isArtist: true,
  },
  {
    id: "n4",
    type: "comment",
    title: "IU가 내 댓글에 답글을 달았어요 💜",
    body: "\"모두 기다려줘서 고마워요 💜 꼭 좋은 음악으로 보답할게요!\"",
    timeAgo: "1시간 전",
    isRead: false,
    avatar: "IU",
    isArtist: true,
  },
  {
    id: "n5",
    type: "like",
    title: "밤편지팬이 내 게시글에 좋아요를 눌렀습니다",
    body: "\"콘서트 현장 후기 올립니다\"",
    timeAgo: "4시간 전",
    isRead: true,
    avatar: "밤",
  },
  {
    id: "n6",
    type: "new_post",
    title: "10cm가 새 싱글 프리뷰를 공유했어요 🎵",
    body: "\"봄이 좋냐\" — 며칠 후 발매 예정",
    timeAgo: "3시간 전",
    isRead: true,
    avatar: "10",
    isArtist: true,
  },
];
