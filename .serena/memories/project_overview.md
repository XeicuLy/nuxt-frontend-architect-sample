# Project Overview

## Purpose

This is a **Nuxt 4 + Hono + TanStack Query フルスタック サンプル** project that demonstrates modern full-stack web development with proper state management separation. The project showcases:

- A Nuxt.js frontend application with Vue 3 and TypeScript
- TanStack Query for efficient server state management
- Pinia for client-side state management only
- A backend API built with Hono framework integrated into Nuxt server
- Health check API with OpenAPI documentation and Swagger UI
- Type-safe API communication with auto-generated TypeScript types
- Modern development tooling with linting, formatting, and type checking

## Tech Stack

### Frontend

- **Nuxt 4** (v4.1.1) - フルスタック Vue.js フレームワーク
- **Vue 3** (v3.5.21) - JavaScript framework
- **TanStack Query** (@tanstack/vue-query v5.87.1) - サーバー状態管理・キャッシング・同期
- **TypeScript** (v5.9.2) - Type safety
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **Pinia** (v3.0.3) - クライアント状態管理のみ

### Backend

- **Hono** (v4.9.6) - Fast web framework
- **Zod** (v4.1.5) - Schema validation
- **@hono/zod-openapi** (v1.1.0) - OpenAPI integration
- **Swagger UI** (v0.5.2) - API documentation

### Development Tools

- **Biome** (v2.2.3) - Fast linter and formatter
- **ESLint** (v9.35.0) - JavaScript/TypeScript linting
- **Prettier** (v3.6.2) - Code formatting
- **@hey-api/openapi-ts** (v0.82.4) - TypeScript API type generation

### Node.js Environment

- Node.js v22.19.0 (managed by Volta)
- pnpm v10.15.1 (managed by Volta)

## Architecture Highlights

### State Management Separation

- **TanStack Query**: サーバー状態（API データ、キャッシング、バックグラウンド同期）
- **Pinia**: クライアント状態（UI 状態、ユーザー設定、ローカルデータ）のみ
- **Clear Boundaries**: サーバーとクライアント状態の明確な分離

### Data Flow

1. **Service Layer** (`app/services/`) - API calls with Zod validation
2. **Query Layer** (`app/queries/`) - TanStack Query integration
3. **Adapter Composables** (`app/composables/useHealth/`) - Data transformation and business logic
4. **Components** - Consume data through adapter composables
5. **Client Stores** - Manage UI-only state when needed (currently not implemented)

### SSR/SSG Support

- **Server-side hydration** via TanStack Query plugin
- **Automatic dehydration/hydration** for seamless client-server transition
- **Performance optimization** with intelligent caching strategies
