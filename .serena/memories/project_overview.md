# Project Overview

## Purpose

This is a **Nuxt 4 + Hono + TanStack Query + Pinia フルスタック サンプル** project that demonstrates modern full-stack web development with hybrid state management. The project showcases:

- A Nuxt.js frontend application with Vue 3 and TypeScript
- TanStack Query for efficient server state management (API data, caching, synchronization)
- Pinia for client-side state management (UI state, user input, local data)
- Clear separation between server and client state concerns
- A backend API built with Hono framework integrated into Nuxt server
- Health check API with OpenAPI documentation and Swagger UI
- Type-safe API communication with auto-generated TypeScript types
- Modern development tooling with linting, formatting, and type checking
- Comprehensive testing setup for both state management approaches

## Tech Stack

### Frontend

- **Nuxt 4** (v4.1.1) - フルスタック Vue.js フレームワーク
- **Vue 3** (v3.5.21) - JavaScript framework
- **TanStack Query** (@tanstack/vue-query v5.87.1) - サーバー状態管理・キャッシング・同期
- **Pinia** (v3.0.3) - クライアント状態管理・UI状態・ユーザー入力
- **@pinia/nuxt** (v0.11.2) - Pinia Nuxt integration
- **@pinia/testing** (v1.0.2) - Pinia testing utilities
- **TypeScript** (v5.9.2) - Type safety
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework

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
- **Vitest** - Testing framework
- **@nuxt/test-utils** - Nuxt testing utilities

### Node.js Environment

- Node.js v22.16.0 (managed by Volta)
- pnpm v10.15.1 (managed by Volta)

## Architecture Highlights

### Hybrid State Management

- **TanStack Query**: サーバー状態（API データ、キャッシング、バックグラウンド同期）
- **Pinia**: クライアント状態（UI 状態、ユーザー入力、ローカルデータ）
- **Clear Boundaries**: サーバーとクライアント状態の明確な分離
- **Testing Support**: Both state management systems have comprehensive testing support

### Data Flow Architecture

#### Server State Flow

1. **Service Layer** (`app/services/`) - API calls with Zod validation
2. **Query Layer** (`app/queries/`) - TanStack Query integration
3. **Adapter Composables** (`app/composables/useHealth/`) - Data transformation and business logic
4. **Components** - Consume server state through adapter composables

#### Client State Flow

1. **Store Layer** (`app/store/`) - Pinia stores for client state
2. **Store Composables** (`app/composables/useHealth/`) - Store access and transformation
3. **Components** - Consume client state through store composables

#### Integration Pattern

Components receive both server and client state through a unified composable interface:

```typescript
const {
  isLoading, // Server state from TanStack Query
  healthStatusData, // Server state from TanStack Query
  sampleInput, // Client state from Pinia
} = useHealth();
```

### SSR/SSG Support

- **Server-side hydration** via TanStack Query plugin
- **Automatic dehydration/hydration** for seamless client-server transition
- **Performance optimization** with intelligent caching strategies
- **Pinia SSR compatibility** for client state when needed

## Current Implementation Details

### Implemented Features

1. **Health Check API**: Complete server state management with API integration
2. **User Input Management**: Client state management for form inputs
3. **Hybrid State Integration**: Unified interface combining both state types
4. **Testing Infrastructure**: Complete testing setup for both state management approaches
5. **Type Safety**: End-to-end TypeScript integration
6. **Component Architecture**: Clean component design consuming both state types

### File Structure Overview

```
app/
├── store/                     # Pinia stores (client state)
│   └── health.ts             # Health-related client state
├── queries/                  # TanStack Query composables
│   └── useHealthQuery.ts     # Health API query
├── composables/
│   └── useHealth/
│       ├── useHealthAdapter.ts   # Server state transformation
│       ├── useHealthInput.ts     # Client state access
│       └── index.ts              # Unified interface
├── services/                 # API communication layer
│   └── health.ts            # Health API service
├── components/               # Vue components
│   └── index/
│       ├── Input.vue        # User input component
│       └── ...
├── helpers/test/            # Testing utilities
│   └── setupTestingPinia.ts # Pinia testing setup
└── ...
```

### Testing Strategy

- **Query Testing**: Mock services for TanStack Query testing
- **Store Testing**: `createTestingPinia` for isolated store testing
- **Component Testing**: Integration tests with both state types
- **E2E Testing**: Full application flow testing
- **Type Testing**: TypeScript compilation checks

## Development Workflow

### State Management Guidelines

1. **Server State**: Use TanStack Query for all API-related data
2. **Client State**: Use Pinia for UI state, user input, and local data
3. **No State Mixing**: Keep server and client concerns completely separate
4. **Unified Interface**: Provide single composable interface to components
5. **Testing First**: Write tests for both state types independently

### Architecture Benefits

- **Maintainable**: Clear separation of concerns
- **Performant**: Optimized libraries for each state type
- **Testable**: Independent testing capabilities
- **Scalable**: Easy to extend with new features
- **Type-Safe**: End-to-end TypeScript support
