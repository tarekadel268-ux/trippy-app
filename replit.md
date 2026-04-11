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

### Egypt Events & Trips (`artifacts/egypt-app`)
- **Type**: Expo mobile app
- **Preview Path**: `/`
- **Purpose**: Marketplace for Egyptian events and trips

#### Features
- Onboarding: nationality selection (Egyptian / Tourist) → role selection
- Roles: Ticket Holder, Trip Planner, Tourist Explorer (cannot be changed)
- Events section: Music Concerts, Afro & Techno, Private Parties with horizontal carousels
- Trips section: 8 Egyptian cities (Alexandria, Sharm El-Sheikh, Dahab, Nuweiba, Hurghada, Gouna, Luxor, Aswan) with city photos + scrollable offer cards
- Subscription gate: Tourists pay $15/month to see verified planner contact info; blurred/locked for unsubscribed
- Trip Planner verification: Egyptian ID + phone + 200 EGP/month
- In-app messaging between buyers and organizers
- Filters: Most viewed, price high/low, currency toggle (EGP/USD)
- Add trip offer (verified planners only) and add event ticket (ticket holders only)

#### Architecture
- Frontend-only Expo app using AsyncStorage for persistence
- No backend needed for first build
- React Context (`AppContext`) manages: user profile, trips, events, chats, currency
- Sample data pre-populated for 8 cities and 5 event listings

#### Key Files
- `contexts/AppContext.tsx` — all state management
- `app/_layout.tsx` — root layout with navigation guard
- `app/(tabs)/` — main tabs: trips, events, messages, profile
- `app/trips/[id].tsx` — trip detail with contact gate
- `app/events/[id].tsx` — event detail
- `app/chat/[id].tsx` — in-app messaging
- `app/verify.tsx` — planner verification flow
- `app/subscribe.tsx` — tourist subscription ($15 USD)
- `app/add-trip.tsx` — list a new trip
- `app/add-event.tsx` — list a ticket
- `constants/colors.ts` — Egypt-inspired color palette (gold, deep blue, sand)
- `assets/images/` — AI-generated city images for all 8 destinations + concert

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
