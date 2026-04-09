import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Comment,
  Fandom,
  INITIAL_FANDOMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_POSTS,
  Notification,
  Post,
  SAMPLE_COMMENTS,
} from "@/constants/data";

interface FandomContextValue {
  fandoms: Fandom[];
  posts: Post[];
  notifications: Notification[];
  unreadCount: number;
  savedPosts: string[];
  likedPosts: string[];
  followedFandomIds: string[];
  toggleFollow: (fandomId: string) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  markAllRead: () => void;
  markRead: (notifId: string) => void;
  getPostComments: (postId: string) => Comment[];
  addComment: (postId: string, content: string) => void;
  addPost: (post: Omit<Post, "id" | "likes" | "comments" | "timeAgo" | "isLiked" | "isSaved">) => void;
  userProfile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

interface UserProfile {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  postCount: number;
  followerCount: number;
  followingCount: number;
}

const FandomContext = createContext<FandomContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  SAVED: "fandom_saved_posts",
  LIKED: "fandom_liked_posts",
  FOLLOWED: "fandom_followed",
  PROFILE: "fandom_profile",
  NOTIFICATIONS: "fandom_notifications",
  COMMENTS: "fandom_comments",
};

const DEFAULT_PROFILE: UserProfile = {
  name: "Fan User",
  username: "fanuser",
  bio: "Passionate about anime, gaming, and fantasy worlds.",
  avatar: "F",
  postCount: 12,
  followerCount: 847,
  followingCount: 234,
};

export function FandomProvider({ children }: { children: React.ReactNode }) {
  const [fandoms, setFandoms] = useState<Fandom[]>(INITIAL_FANDOMS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [followedFandomIds, setFollowedFandomIds] = useState<string[]>(
    INITIAL_FANDOMS.filter((f) => f.isFollowing).map((f) => f.id)
  );
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [comments, setComments] = useState<Record<string, Comment[]>>({
    p1: SAMPLE_COMMENTS,
    p2: SAMPLE_COMMENTS.slice(0, 2),
    p3: SAMPLE_COMMENTS.slice(1, 4),
  });

  useEffect(() => {
    (async () => {
      try {
        const [saved, liked, followed, profile] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.SAVED),
          AsyncStorage.getItem(STORAGE_KEYS.LIKED),
          AsyncStorage.getItem(STORAGE_KEYS.FOLLOWED),
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        ]);
        if (saved) setSavedPosts(JSON.parse(saved));
        if (liked) setLikedPosts(JSON.parse(liked));
        if (followed) setFollowedFandomIds(JSON.parse(followed));
        if (profile) setUserProfile(JSON.parse(profile));
      } catch {}
    })();
  }, []);

  const toggleFollow = useCallback((fandomId: string) => {
    setFollowedFandomIds((prev) => {
      const next = prev.includes(fandomId)
        ? prev.filter((id) => id !== fandomId)
        : [...prev, fandomId];
      AsyncStorage.setItem(STORAGE_KEYS.FOLLOWED, JSON.stringify(next));
      return next;
    });
    setFandoms((prev) =>
      prev.map((f) =>
        f.id === fandomId
          ? { ...f, memberCount: f.memberCount + (followedFandomIds.includes(fandomId) ? -1 : 1) }
          : f
      )
    );
  }, [followedFandomIds]);

  const toggleLike = useCallback((postId: string) => {
    setLikedPosts((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      AsyncStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(next));
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: p.likes + (likedPosts.includes(postId) ? -1 : 1) }
          : p
      )
    );
  }, [likedPosts]);

  const toggleSave = useCallback((postId: string) => {
    setSavedPosts((prev) => {
      const next = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      AsyncStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(next));
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const markRead = useCallback((notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  }, []);

  const getPostComments = useCallback(
    (postId: string): Comment[] => comments[postId] ?? [],
    [comments]
  );

  const addComment = useCallback((postId: string, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      authorName: "Fan User",
      authorAvatar: "F",
      content,
      likes: 0,
      timeAgo: "now",
      isLiked: false,
    };
    setComments((prev) => ({
      ...prev,
      [postId]: [newComment, ...(prev[postId] ?? [])],
    }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p))
    );
  }, []);

  const addPost = useCallback(
    (post: Omit<Post, "id" | "likes" | "comments" | "timeAgo" | "isLiked" | "isSaved">) => {
      const newPost: Post = {
        ...post,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        likes: 0,
        comments: 0,
        timeAgo: "now",
        isLiked: false,
        isSaved: false,
      };
      setPosts((prev) => [newPost, ...prev]);
    },
    []
  );

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(next));
      return next;
    });
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <FandomContext.Provider
      value={{
        fandoms,
        posts,
        notifications,
        unreadCount,
        savedPosts,
        likedPosts,
        followedFandomIds,
        toggleFollow,
        toggleLike,
        toggleSave,
        markAllRead,
        markRead,
        getPostComments,
        addComment,
        addPost,
        userProfile,
        updateProfile,
      }}
    >
      {children}
    </FandomContext.Provider>
  );
}

export function useFandom() {
  const ctx = useContext(FandomContext);
  if (!ctx) throw new Error("useFandom must be used within FandomProvider");
  return ctx;
}
