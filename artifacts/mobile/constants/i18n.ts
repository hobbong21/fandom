export type Language = "ko" | "en";

const translations = {
  ko: {
    appName: "팬덤",

    // Tabs
    home: "홈",
    explore: "탐색",
    notifications: "알림",
    profile: "프로필",

    // Categories
    categories: {
      all: "전체",
      anime: "애니메이션",
      fantasy: "판타지",
      gaming: "게임",
      movies: "영화",
      tv: "TV 드라마",
      comics: "만화",
      music: "음악",
    } as Record<string, string>,

    // Home
    feedFor: "추천",
    feedFollowing: "팔로잉",
    feedTrending: "인기",
    noPostsTitle: "아직 게시글이 없습니다",
    noPostsText: "팬덤에 가입하여 피드를 채워보세요",
    exploreFandoms: "팬덤 탐색하기",

    // Explore
    exploreTitle: "탐색",
    exploreSubtitle: "커뮤니티를 찾아보세요",
    searchPlaceholder: "팬덤 검색...",
    noFandomTitle: "팬덤을 찾을 수 없습니다",
    noFandomText: "다른 검색어 또는 카테고리를 시도해보세요",

    // Notifications
    notificationsTitle: "알림",
    markAllRead: "전체 읽음 처리",
    allCaughtUp: "모두 읽었습니다!",
    noNewNotifs: "새로운 알림이 없습니다",

    // Profile
    profileTitle: "프로필",
    posts: "게시글",
    saved: "저장됨",
    fandoms: "팬덤",
    followers: "팔로워",
    following: "팔로잉",
    saveProfile: "프로필 저장",
    nicknamePlaceholder: "닉네임",
    bioPlaceholder: "자기소개",
    noPostsYet: "아직 게시글이 없습니다",
    noSavedPosts: "저장된 게시글이 없습니다",
    noFandomsYet: "아직 가입한 팬덤이 없습니다",
    logout: "로그아웃",
    languageLabel: "언어",
    logoutConfirm: "로그아웃 하시겠습니까?",
    cancel: "취소",

    // Fandom detail
    members: "멤버",
    tagsLabel: "태그",
    joinCommunity: "커뮤니티 가입",
    fandomNotFound: "팬덤을 찾을 수 없습니다",
    noPostsInFandom: "아직 게시글이 없습니다",

    // Post detail
    commentsLabel: "댓글",
    commentPlaceholder: "댓글 추가...",
    postNotFound: "게시글을 찾을 수 없습니다",
    firstComment: "아직 댓글이 없습니다. 첫 댓글을 달아보세요!",

    // Follow button
    followingBtn: "팔로잉",
    joinBtn: "가입",

    // Login
    loginWelcome: "팬덤에 오신 것을\n환영합니다",
    loginSubtitle: "좋아하는 팬덤을 함께 즐겨보세요",
    emailLabel: "이메일",
    passwordLabel: "비밀번호",
    confirmPasswordLabel: "비밀번호 확인",
    nameLabel: "닉네임",
    loginBtn: "로그인",
    registerBtn: "회원가입",
    noAccount: "계정이 없으신가요?",
    hasAccount: "이미 계정이 있으신가요?",
    signUpLink: "회원가입",
    signInLink: "로그인",
    emailRequired: "이메일을 입력해주세요",
    passwordRequired: "비밀번호를 입력해주세요",
    passwordMismatch: "비밀번호가 일치하지 않습니다",
    nameRequired: "닉네임을 입력해주세요",
    loginError: "이메일 또는 비밀번호가 올바르지 않습니다",
    passwordShort: "비밀번호는 6자 이상이어야 합니다",

    // Announcement
    announcementTitle: "📢 공지사항",
    announcementContent:
      "팬덤 앱에 오신 것을 환영합니다!\n\n새로운 기능이 추가되었습니다:\n• 팬덤 커뮤니티 가입 및 탈퇴\n• 게시글 좋아요 및 댓글\n• 알림 시스템\n\n앱 이용 중 불편한 점이 있으시면 프로필 > 의견 보내기를 통해 알려주세요. 더 나은 서비스를 위해 노력하겠습니다. 감사합니다!",
    announcementClose: "확인",
    dontShowAgain: "다시 보지 않기",
  },

  en: {
    appName: "Fandom",

    home: "Home",
    explore: "Explore",
    notifications: "Notifications",
    profile: "Profile",

    categories: {
      all: "All",
      anime: "Anime",
      fantasy: "Fantasy",
      gaming: "Gaming",
      movies: "Movies",
      tv: "TV Shows",
      comics: "Comics",
      music: "Music",
    } as Record<string, string>,

    feedFor: "For You",
    feedFollowing: "Following",
    feedTrending: "Trending",
    noPostsTitle: "Nothing here yet",
    noPostsText: "Join some fandoms to see posts in your feed",
    exploreFandoms: "Explore Fandoms",

    exploreTitle: "Explore",
    exploreSubtitle: "Discover communities",
    searchPlaceholder: "Search fandoms...",
    noFandomTitle: "No fandoms found",
    noFandomText: "Try a different search or category",

    notificationsTitle: "Notifications",
    markAllRead: "Mark all read",
    allCaughtUp: "All caught up!",
    noNewNotifs: "No new notifications",

    profileTitle: "Profile",
    posts: "Posts",
    saved: "Saved",
    fandoms: "Fandoms",
    followers: "Followers",
    following: "Following",
    saveProfile: "Save Profile",
    nicknamePlaceholder: "Display name",
    bioPlaceholder: "Bio",
    noPostsYet: "No posts yet",
    noSavedPosts: "No saved posts",
    noFandomsYet: "No fandoms followed yet",
    logout: "Log Out",
    languageLabel: "Language",
    logoutConfirm: "Are you sure you want to log out?",
    cancel: "Cancel",

    members: "Members",
    tagsLabel: "Tags",
    joinCommunity: "Join Community",
    fandomNotFound: "Fandom not found",
    noPostsInFandom: "No posts yet in this fandom",

    commentsLabel: "Comments",
    commentPlaceholder: "Add a comment...",
    postNotFound: "Post not found",
    firstComment: "No comments yet. Be the first!",

    followingBtn: "Following",
    joinBtn: "Join",

    loginWelcome: "Welcome to\nFandom",
    loginSubtitle: "Enjoy your favorite fandoms together",
    emailLabel: "Email",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    nameLabel: "Display Name",
    loginBtn: "Log In",
    registerBtn: "Sign Up",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    signUpLink: "Sign Up",
    signInLink: "Log In",
    emailRequired: "Please enter your email",
    passwordRequired: "Please enter your password",
    passwordMismatch: "Passwords do not match",
    nameRequired: "Please enter your display name",
    loginError: "Invalid email or password",
    passwordShort: "Password must be at least 6 characters",

    announcementTitle: "📢 Announcement",
    announcementContent:
      "Welcome to the Fandom App!\n\nNew features have been added:\n• Join and leave fandom communities\n• Like posts and leave comments\n• Notification system\n\nIf you encounter any issues, please let us know via Profile > Send Feedback. We're committed to improving your experience. Thank you!",
    announcementClose: "Got it",
    dontShowAgain: "Don't show again",
  },
} as const;

export type Translations = typeof translations.ko;
export { translations };
