# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Fandom Mobile (`artifacts/mobile`) — 스타링 (Starling)
A **hybrid** Expo app — runs as a web app in browsers AND as a native mobile app via Expo Go simultaneously. Frontend-only, uses AsyncStorage for persistence. **Concept: Direct artist-fan communication platform** for Korean singers, indie bands, and trot artists.

**Hybrid layout:**
- **Web (browser)**: Left custom sidebar (240px) with branding, user avatar/XP card, nav items with badges, CTA button. Content max-width 680px centered.
- **Mobile (iOS/Android)**: Bottom tab bar with blur effect, native SF Symbols on iOS, Feather icons elsewhere

**Fandom scope (Korean music only):**
- `singer` — 가수 (e.g., IU 아이유)
- `indie` — 인디밴드 (e.g., 잔나비, 넬, 10cm)
- `trot` — 트로트 (e.g., 임영웅, 송가인)

**Key data fields:**
- `Fandom.genre` — `"singer" | "indie" | "trot"` (also mapped to `category`)
- `Fandom.color` — artist brand color (hex)
- `Fandom.emoji` — artist avatar emoji
- `Fandom.isVerified` — official artist badge
- `Post.isArtistPost` — marks posts from artist directly
- `Post.isLive` — live event badge

**Features:**
- Home: LiveBanner (red LIVE alert), following artists row, featured artists carousel, artist direct messages section, feed with filters
- Explore: Genre filter pills (전체/가수/인디밴드/트로트 with emoji), artist cards with color accents
- Artist detail: Color hero section with emoji avatar, verified badge, follow button, artist posts
- Post cards: Artist badge (보라색 아티스트 tag), LIVE badge, heart/comment/bookmark with colored backgrounds
- Notifications: Artist activity (red/purple), LIVE alerts, fan interactions differentiated
- Profile screen: XP card, fan tier badge (🌱캐주얼/⭐미들/👑로열), 촌수 network, 4-tab layout
- CHON platform: XP earning (+5 like, +20 comment, +30 join), toast notifications

**Stack:**
- Expo Router (file-based routing, `tabBarPosition` for platform routing)
- React Context + AsyncStorage (local persistence)
- `@expo/vector-icons` (Feather icons)
- expo-haptics for touch feedback
- `react-native-keyboard-controller` for keyboard handling
- Dark mode support via `constants/colors.ts` + `useColors()`
- Korean/English i18n via `LanguageContext` + `constants/i18n.ts`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
