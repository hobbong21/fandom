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

### Fandom Mobile (`artifacts/mobile`)
A **hybrid** Expo app — runs as a web app in browsers AND as a native mobile app via Expo Go simultaneously. Frontend-only, uses AsyncStorage for persistence.

**Hybrid layout:**
- **Web (browser)**: Left sidebar navigation (220px), `tabBarPosition: 'left'`, web-optimized top/bottom padding
- **Mobile (iOS/Android)**: Bottom tab bar with blur effect, native SF Symbols on iOS, Feather icons elsewhere

**Features:**
- Home feed with featured fandoms carousel and posts feed (For You / Following / Trending filters)
- Explore screen with search and category filtering
- Fandom detail page with stats, tags, follow/unfollow
- Post detail with full content, like/save, and comments
- Notifications screen with badge count
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
