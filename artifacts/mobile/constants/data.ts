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
  { id: "all", label: "All" },
  { id: "anime", label: "Anime" },
  { id: "fantasy", label: "Fantasy" },
  { id: "gaming", label: "Gaming" },
  { id: "movies", label: "Movies" },
  { id: "tv", label: "TV Shows" },
  { id: "comics", label: "Comics" },
  { id: "music", label: "Music" },
];

export const INITIAL_FANDOMS: Fandom[] = [
  {
    id: "1",
    name: "Naruto Universe",
    category: "anime",
    memberCount: 2800000,
    postCount: 450000,
    coverImage: require("../assets/images/category-anime.png"),
    description: "The ultimate community for Naruto fans — discuss episodes, theories, characters, and more.",
    tags: ["Naruto", "Boruto", "Ninja", "Shonen"],
    isFollowing: true,
  },
  {
    id: "2",
    name: "The Elder Scrolls",
    category: "gaming",
    memberCount: 1900000,
    postCount: 320000,
    coverImage: require("../assets/images/category-fantasy.png"),
    description: "Tamriel awaits — lore deep dives, modding guides, and community adventures.",
    tags: ["Skyrim", "Oblivion", "RPG", "Bethesda"],
    isFollowing: false,
  },
  {
    id: "3",
    name: "Attack on Titan",
    category: "anime",
    memberCount: 3400000,
    postCount: 680000,
    coverImage: require("../assets/images/category-anime.png"),
    description: "The walls are fallen. Discuss AoT's epic story, characters, and ending.",
    tags: ["AoT", "SNK", "Shonen", "Anime"],
    isFollowing: true,
  },
  {
    id: "4",
    name: "Dragon Age",
    category: "gaming",
    memberCount: 870000,
    postCount: 140000,
    coverImage: require("../assets/images/category-fantasy.png"),
    description: "Celebrate BioWare's Dragon Age universe with lore, builds, and companions.",
    tags: ["RPG", "BioWare", "Fantasy", "Inquisition"],
    isFollowing: false,
  },
  {
    id: "5",
    name: "Marvel Cinematic Universe",
    category: "movies",
    memberCount: 5100000,
    postCount: 920000,
    coverImage: require("../assets/images/hero-banner.png"),
    description: "Earth's mightiest fandom — MCU movies, shows, and spoiler-free zones.",
    tags: ["Marvel", "Avengers", "Disney", "Superhero"],
    isFollowing: false,
  },
  {
    id: "6",
    name: "Demon Slayer",
    category: "anime",
    memberCount: 2200000,
    postCount: 390000,
    coverImage: require("../assets/images/category-anime.png"),
    description: "Tanjiro's world, Hashira rankings, breathiing styles, and fan art.",
    tags: ["KimetsuNoYaiba", "Shonen", "Anime", "Manga"],
    isFollowing: true,
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "p1",
    fandomId: "1",
    fandomName: "Naruto Universe",
    authorName: "KonohaShinobi",
    authorAvatar: "K",
    title: "Ranking every Hokage from weakest to strongest",
    content: "This is my complete breakdown of the Hokage rankings based on feats shown throughout the series. Controversial but I'll explain my reasoning...",
    likes: 8432,
    comments: 312,
    timeAgo: "3h",
    isLiked: false,
    isSaved: false,
    tags: ["Theory", "Power Rankings"],
    coverImage: require("../assets/images/category-anime.png"),
  },
  {
    id: "p2",
    fandomId: "3",
    fandomName: "Attack on Titan",
    authorName: "ErenYeager_Fan",
    authorAvatar: "E",
    title: "The ending was actually perfect — here's why",
    content: "I know the AoT ending is divisive, but after rewatching the series twice, I genuinely believe it's the most thematically consistent ending the series could have had...",
    likes: 12039,
    comments: 891,
    timeAgo: "6h",
    isLiked: true,
    isSaved: true,
    tags: ["Discussion", "Spoilers", "Finale"],
  },
  {
    id: "p3",
    fandomId: "5",
    fandomName: "Marvel Cinematic Universe",
    authorName: "MarvelNerd42",
    authorAvatar: "M",
    title: "Secret Wars theory: who survives?",
    content: "Based on the comics and what we know about the upcoming MCU lineup, here's my breakdown of who's most likely to survive the next Avengers event...",
    likes: 21450,
    comments: 1203,
    timeAgo: "12h",
    isLiked: false,
    isSaved: false,
    tags: ["Theory", "Phase 6", "Avengers"],
    coverImage: require("../assets/images/hero-banner.png"),
  },
  {
    id: "p4",
    fandomId: "6",
    fandomName: "Demon Slayer",
    authorName: "TanjiroFan",
    authorAvatar: "T",
    title: "Complete Hashira tier list after the Infinity Castle arc",
    content: "Now that we've seen everyone in action during the final arc, it's time to finalize the Hashira tier list based on actual demonstrated power...",
    likes: 5892,
    comments: 428,
    timeAgo: "1d",
    isLiked: false,
    isSaved: true,
    tags: ["Tier List", "Hashira", "Discussion"],
  },
  {
    id: "p5",
    fandomId: "2",
    fandomName: "The Elder Scrolls",
    authorName: "TamrielScholar",
    authorAvatar: "T",
    title: "I spent 100 hours reading every in-game book in Skyrim",
    content: "The lore is deeper than you think. Here's my complete summary of Tamriel's history as told through all 300+ in-game books, organized chronologically...",
    likes: 7021,
    comments: 234,
    timeAgo: "2d",
    isLiked: true,
    isSaved: false,
    tags: ["Lore", "Skyrim", "Deep Dive"],
  },
];

export const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "c1",
    authorName: "AnimeFan99",
    authorAvatar: "A",
    content: "This is such a great breakdown! I completely agree with your #1 pick, though I'd argue the 4th Hokage deserves to be higher.",
    likes: 234,
    timeAgo: "1h",
    isLiked: false,
  },
  {
    id: "c2",
    authorName: "NinjaLore",
    authorAvatar: "N",
    content: "The 3rd Hokage is criminally underrated. His mastery of ALL jutsu is insane when you think about it.",
    likes: 187,
    timeAgo: "2h",
    isLiked: true,
  },
  {
    id: "c3",
    authorName: "ShippudenFan",
    authorAvatar: "S",
    content: "Hashirama should always be #1 no debate. The man created an entire village from scratch.",
    likes: 412,
    timeAgo: "3h",
    isLiked: false,
  },
  {
    id: "c4",
    authorName: "BorutoGen",
    authorAvatar: "B",
    content: "What about Naruto himself? By Boruto he's way beyond any previous Hokage.",
    likes: 89,
    timeAgo: "4h",
    isLiked: false,
  },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "like",
    title: "KonohaShinobi liked your post",
    body: "\"My top 10 anime endings of all time\"",
    timeAgo: "5m",
    isRead: false,
    avatar: "K",
  },
  {
    id: "n2",
    type: "comment",
    title: "ErenYeager_Fan commented on your post",
    body: "Great analysis! I think you're missing a key point about the rumbling...",
    timeAgo: "22m",
    isRead: false,
    avatar: "E",
  },
  {
    id: "n3",
    type: "follow",
    title: "MarvelNerd42 started following you",
    body: "",
    timeAgo: "1h",
    isRead: false,
    avatar: "M",
  },
  {
    id: "n4",
    type: "new_post",
    title: "New post in Attack on Titan",
    body: "\"The symbolism of the ocean scene — a complete breakdown\"",
    timeAgo: "3h",
    isRead: true,
    avatar: "A",
  },
  {
    id: "n5",
    type: "mention",
    title: "TanjiroFan mentioned you in a comment",
    body: "@you — exactly my thoughts! The breathing techniques are clearly based on...",
    timeAgo: "5h",
    isRead: true,
    avatar: "T",
  },
  {
    id: "n6",
    type: "like",
    title: "TamrielScholar liked your comment",
    body: "\"The Aedra and Daedra distinction is key to understanding Talos worship\"",
    timeAgo: "1d",
    isRead: true,
    avatar: "T",
  },
];
