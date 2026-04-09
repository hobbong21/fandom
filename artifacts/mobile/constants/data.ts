export interface Fandom {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  postCount: number;
  coverImage: any;
  description: string;
  tags: string[];
  isFollowing: boolean;
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
}

export interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  timeAgo: string;
  isLiked: boolean;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "new_post";
  title: string;
  body: string;
  timeAgo: string;
  isRead: boolean;
  avatar: string;
}

export const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "anime", label: "애니메이션" },
  { id: "fantasy", label: "판타지" },
  { id: "gaming", label: "게임" },
  { id: "movies", label: "영화" },
  { id: "tv", label: "TV 드라마" },
  { id: "comics", label: "만화" },
  { id: "music", label: "음악" },
];

export const INITIAL_FANDOMS: Fandom[] = [
  {
    id: "1",
    name: "나루토 유니버스",
    category: "anime",
    memberCount: 2800000,
    postCount: 450000,
    coverImage: require("../assets/images/category-anime.png"),
    description: "나루토 팬들을 위한 최고의 커뮤니티 — 에피소드, 이론, 캐릭터 등을 함께 이야기해요.",
    tags: ["나루토", "보루토", "닌자", "소년만화"],
    isFollowing: true,
  },
  {
    id: "2",
    name: "엘더스크롤",
    category: "gaming",
    memberCount: 1900000,
    postCount: 320000,
    coverImage: require("../assets/images/category-fantasy.png"),
    description: "탐리엘이 기다립니다 — 깊은 세계관 탐구, 모딩 가이드, 커뮤니티 모험.",
    tags: ["스카이림", "오블리비언", "RPG", "베데스다"],
    isFollowing: false,
  },
  {
    id: "3",
    name: "진격의 거인",
    category: "anime",
    memberCount: 3400000,
    postCount: 680000,
    coverImage: require("../assets/images/category-anime.png"),
    description: "벽이 무너졌다. 진거의 서사, 캐릭터, 결말에 대해 함께 이야기해요.",
    tags: ["진격의거인", "AOT", "소년만화", "애니"],
    isFollowing: true,
  },
  {
    id: "4",
    name: "드래곤 에이지",
    category: "gaming",
    memberCount: 870000,
    postCount: 140000,
    coverImage: require("../assets/images/category-fantasy.png"),
    description: "바이오웨어의 드래곤 에이지 세계를 세계관, 빌드, 동료 캐릭터로 탐험해요.",
    tags: ["RPG", "바이오웨어", "판타지", "인퀴지션"],
    isFollowing: false,
  },
  {
    id: "5",
    name: "마블 시네마틱 유니버스",
    category: "movies",
    memberCount: 5100000,
    postCount: 920000,
    coverImage: require("../assets/images/hero-banner.png"),
    description: "지구 최강의 팬덤 — MCU 영화, 드라마, 스포일러 없는 구역까지.",
    tags: ["마블", "어벤져스", "디즈니", "슈퍼히어로"],
    isFollowing: false,
  },
  {
    id: "6",
    name: "귀멸의 칼날",
    category: "anime",
    memberCount: 2200000,
    postCount: 390000,
    coverImage: require("../assets/images/category-anime.png"),
    description: "탄지로의 세계, 기주 랭킹, 호흡법, 팬아트까지 모두 여기서.",
    tags: ["귀멸의칼날", "소년만화", "애니", "만화"],
    isFollowing: true,
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "p1",
    fandomId: "1",
    fandomName: "나루토 유니버스",
    authorName: "코노하시노비",
    authorAvatar: "코",
    title: "역대 화카게 최약에서 최강까지 전부 랭킹 매기기",
    content: "시리즈 전체 feat를 기반으로 한 화카게 랭킹 완전 분석입니다. 논란이 있을 수 있지만 제 논리를 설명할게요...",
    likes: 8432,
    comments: 312,
    timeAgo: "3시간 전",
    isLiked: false,
    isSaved: false,
    tags: ["이론", "파워랭킹"],
    coverImage: require("../assets/images/category-anime.png"),
  },
  {
    id: "p2",
    fandomId: "3",
    fandomName: "진격의 거인",
    authorName: "에렌예거팬",
    authorAvatar: "에",
    title: "결말은 사실 완벽했다 — 이유를 알려드립니다",
    content: "진격의 거인 결말이 논란의 여지가 있다는 건 알지만, 시리즈를 두 번 다시 보고 나서 이 결말이 가장 주제적으로 일관된 결말이라고 진심으로 믿게 됐습니다...",
    likes: 12039,
    comments: 891,
    timeAgo: "6시간 전",
    isLiked: true,
    isSaved: true,
    tags: ["토론", "스포일러", "피날레"],
  },
  {
    id: "p3",
    fandomId: "5",
    fandomName: "마블 시네마틱 유니버스",
    authorName: "마블너드42",
    authorAvatar: "마",
    title: "시크릿 워즈 이론: 누가 살아남을까?",
    content: "코믹스와 알려진 MCU 라인업을 바탕으로, 다음 어벤져스 이벤트에서 살아남을 가능성이 높은 캐릭터를 분석합니다...",
    likes: 21450,
    comments: 1203,
    timeAgo: "12시간 전",
    isLiked: false,
    isSaved: false,
    tags: ["이론", "페이즈6", "어벤져스"],
    coverImage: require("../assets/images/hero-banner.png"),
  },
  {
    id: "p4",
    fandomId: "6",
    fandomName: "귀멸의 칼날",
    authorName: "탄지로팬",
    authorAvatar: "탄",
    title: "무한성 편 이후 기주 전원 티어리스트 완성본",
    content: "마지막 편에서 모두의 활약을 본 지금, 실제로 보여준 실력을 기반으로 기주 티어리스트를 확정할 때가 됐습니다...",
    likes: 5892,
    comments: 428,
    timeAgo: "1일 전",
    isLiked: false,
    isSaved: true,
    tags: ["티어리스트", "기주", "토론"],
  },
  {
    id: "p5",
    fandomId: "2",
    fandomName: "엘더스크롤",
    authorName: "탐리엘학자",
    authorAvatar: "탐",
    title: "스카이림 게임 내 책 300권 이상을 100시간 동안 전부 읽었습니다",
    content: "세계관은 여러분이 생각하는 것보다 훨씬 깊습니다. 시간순으로 정리한 탐리엘 역사 완전 요약본입니다...",
    likes: 7021,
    comments: 234,
    timeAgo: "2일 전",
    isLiked: true,
    isSaved: false,
    tags: ["세계관", "스카이림", "심층분석"],
  },
];

export const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "c1",
    authorName: "애니팬99",
    authorAvatar: "애",
    content: "정말 훌륭한 분석이에요! 1위 픽에 완전 동의하지만, 4대 화카게는 좀 더 높아야 한다고 생각해요.",
    likes: 234,
    timeAgo: "1시간 전",
    isLiked: false,
  },
  {
    id: "c2",
    authorName: "닌자로어",
    authorAvatar: "닌",
    content: "3대 화카게는 진짜 너무 저평가됐어요. 모든 인술을 마스터했다는 게 생각할수록 대단합니다.",
    likes: 187,
    timeAgo: "2시간 전",
    isLiked: true,
  },
  {
    id: "c3",
    authorName: "슈푸덴팬",
    authorAvatar: "슈",
    content: "하시라마가 1위인 건 논쟁의 여지가 없죠. 직접 마을을 세운 사람인데요.",
    likes: 412,
    timeAgo: "3시간 전",
    isLiked: false,
  },
  {
    id: "c4",
    authorName: "보루토세대",
    authorAvatar: "보",
    content: "나루토 본인은요? 보루토 편에서는 역대 화카게를 완전히 초월하는데.",
    likes: 89,
    timeAgo: "4시간 전",
    isLiked: false,
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "like",
    title: "코노하시노비가 내 게시글에 좋아요를 눌렀습니다",
    body: "\"내가 뽑은 역대 애니 최고의 엔딩 10선\"",
    timeAgo: "5분 전",
    isRead: false,
    avatar: "코",
  },
  {
    id: "n2",
    type: "comment",
    title: "에렌예거팬이 내 게시글에 댓글을 달았습니다",
    body: "훌륭한 분석이에요! 지평선에 대한 핵심 포인트를 놓친 것 같은데요...",
    timeAgo: "22분 전",
    isRead: false,
    avatar: "에",
  },
  {
    id: "n3",
    type: "follow",
    title: "마블너드42가 팔로우하기 시작했습니다",
    body: "",
    timeAgo: "1시간 전",
    isRead: false,
    avatar: "마",
  },
  {
    id: "n4",
    type: "new_post",
    title: "진격의 거인에 새 게시글이 올라왔습니다",
    body: "\"바다 장면의 상징성 — 완전 분석\"",
    timeAgo: "3시간 전",
    isRead: true,
    avatar: "진",
  },
  {
    id: "n5",
    type: "mention",
    title: "탄지로팬이 댓글에서 나를 언급했습니다",
    body: "@나 — 정확히 제 생각이에요! 호흡 기술이 분명히...",
    timeAgo: "5시간 전",
    isRead: true,
    avatar: "탄",
  },
  {
    id: "n6",
    type: "like",
    title: "탐리엘학자가 내 댓글에 좋아요를 눌렀습니다",
    body: "\"아에드라와 다에드라의 구분이 탈로스 숭배를 이해하는 핵심입니다\"",
    timeAgo: "1일 전",
    isRead: true,
    avatar: "탐",
  },
];
