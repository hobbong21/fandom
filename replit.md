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
An Expo React Native mobile app for fandom communities. Frontend-only, uses AsyncStorage for persistence.

**Features:**
- Home feed with featured fandoms carousel and posts feed (For You / Following / Trending filters)
- Explore screen with search and category filtering
- Fandom detail page with stats, tags, follow/unfollow
- Post detail with full content, like/save, and comments
- Notifications screen with badge count
- Profile screen with editable bio and saved posts/fandoms

**Stack:**
- Expo Router (file-based routing)
- React Context + AsyncStorage (local persistence)
- `@expo/vector-icons` (Feather icons)
- expo-haptics for touch feedback
- `react-native-keyboard-controller` for keyboard handling
- AI-generated images for fandoms (anime, fantasy categories)
- Dark mode support via `constants/colors.ts` + `useColors()`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
