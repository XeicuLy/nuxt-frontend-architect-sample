# Architecture Patterns and Guidelines

## Project Architecture

### Full-Stack Monorepo Structure

This project follows a **monorepo pattern** with clear separation of concerns:

- **Frontend**: Nuxt.js application in `/app` directory
- **Backend**: Hono API integrated into Nuxt server in `/server` directory
- **Shared**: Common types and utilities in `/shared` directory

### State Management Architecture (Updated)

This project implements a **clear separation of server and client state management**:

#### Server State Management

- **TanStack Query**: Handles all server state (API data, caching, synchronization)
- **Service Layer**: API calls with Zod validation (`app/services/`)
- **Query Composables**: Encapsulate query logic (`app/composables/useHealth/`)
- **SSR/SSG Support**: Server-side data hydration/dehydration via vue-query plugin

#### Client State Management

- **Pinia**: Exclusively for client-side state (UI state, user preferences, local data)
- **No server state mixing**: Pinia stores avoid API data management
- **Testing Support**: Configured with `@pinia/testing` for unit tests

### API-First Development

- **OpenAPI specification** drives development
- **Type-safe communication** between frontend and backend
- **Auto-generated TypeScript types** from OpenAPI specs
- **Swagger UI** for API documentation and testing

## Design Patterns

### TanStack Query Pattern (Primary Data Fetching)

- **Query Layer** (`app/queries/`): Domain-specific query logic (e.g., `useHealthQuery`)
- **Adapter Composables** (`app/composables/`): Bridge between queries and components, handle data transformation
- **Centralized Configuration**: Plugin setup with SSR support at `app/plugins/vue-query.ts`
- **Caching Strategy**: 5-minute stale time, 30-minute garbage collection
- **Clear Separation**: Query logic isolated from business/presentation logic

### Composables Pattern (Vue 3 Composition API)

- **Query Layer** (`app/queries/`): Pure TanStack Query logic without business logic
- **Adapter Composables** (`app/composables/`): Data transformation and business logic (e.g., `useHealthAdapter`)
- **Utility Composables**: Shared logic and common functionality
- **Runtime Composables**: Environment detection (`useRuntime`, `useRenderEnvironment`)
- **Auto-imports**: Automatic composable discovery and imports

### Service Layer Architecture

- **API Services**: Pure functions handling HTTP requests with validation
- **Zod Integration**: Runtime type validation for API responses
- **Error Handling**: Consistent error handling patterns
- **Type Safety**: End-to-end TypeScript with generated types

### Component Architecture

- **Page Components**: Route-level components in `/app/pages/`
- **Feature Components**: Domain-specific components organized by feature
- **Layout System**: Nuxt layouts for consistent page structure
- **Query Integration**: Components consume data via query composables

## Key Architectural Principles

### 1. State Separation

- **Server State**: TanStack Query (API data, caching, background updates)
- **Client State**: Pinia (UI state, user preferences, local data)
- **No State Mixing**: Clear boundaries between server and client concerns

### 2. Type Safety

- **End-to-end TypeScript** from API to UI
- **Runtime validation** with Zod schemas
- **Auto-generated types** to prevent drift between API and frontend

### 3. Separation of Concerns

- **Services**: Handle API communication and validation
- **Query Composables**: Manage server state and caching
- **Client Stores**: Manage local UI state
- **Components**: Focus on presentation and user interaction

### 4. Performance Optimization

- **TanStack Query Caching**: Intelligent background data synchronization
- **SSR/SSG Support**: Server-side data hydration for better performance
- **Bundle Optimization**: Tree-shaking and code splitting
- **Hot Module Replacement**: Fast development feedback

## Integration Points

### Query Layer ↔ Services

- **Query Functions**: Services provide data to TanStack Query in Query Layer
- **Type Validation**: Zod schemas ensure runtime type safety
- **Error Handling**: Consistent error propagation and handling
- **Pure Query Logic**: Query layer focuses solely on data fetching and caching

### Frontend ↔ Backend

- **API communication** through generated TypeScript client
- **Shared types** in `/shared/types/api/`
- **Development proxy** through Nuxt server handlers

### Development ↔ Production

- **Build-time type generation** from OpenAPI specs
- **Static analysis** with ESLint, Biome, and TypeScript
- **Consistent formatting** with Prettier and Biome
