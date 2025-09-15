# Architecture Patterns and Guidelines

## Project Architecture

### Full-Stack Monorepo Structure

This project follows a **monorepo pattern** with clear separation of concerns:

- **Frontend**: Nuxt.js application in `/app` directory
- **Backend**: Hono API integrated into Nuxt server in `/server` directory
- **Shared**: Common types and utilities in `/shared` directory

### Hybrid State Management Architecture

This project implements a **clear separation of server and client state management** using a hybrid approach:

#### Server State Management (TanStack Query)

- **Service Layer** (`app/services/`): API calls with Zod validation
- **Query Layer** (`app/queries/`): TanStack Query integration for caching and synchronization
- **Adapter Composables** (`app/composables/useHealth/useHealthAdapter.ts`): Data transformation and business logic
- **SSR/SSG Support**: Server-side data hydration/dehydration via vue-query plugin

#### Client State Management (Pinia)

- **Store Layer** (`app/store/`): Pinia stores for UI state, user input, and local data
- **Store Composables** (`app/composables/useHealth/useHealthInput.ts`): Store access and data transformation
- **Testing Support** (`app/helpers/test/setupTestingPinia.ts`): Pinia testing utilities with `@pinia/testing`
- **Pure Client State**: No server state mixing, dedicated to UI concerns only

### API-First Development

- **OpenAPI specification** drives development
- **Type-safe communication** between frontend and backend
- **Auto-generated TypeScript types** from OpenAPI specs
- **Swagger UI** for API documentation and testing

## Design Patterns

### Hybrid State Management Pattern

The project uses a **hybrid approach** that clearly separates server and client concerns:

#### Server State Flow

```
API Service → TanStack Query → Adapter Composable → Component
```

#### Client State Flow

```
Pinia Store → Store Composable → Component
```

#### Integration Pattern

```typescript
// app/composables/useHealth/index.ts
export const useHealth = () => {
  return {
    ...useHealthAdapter(), // Server state (API data)
    ...useHealthInput(), // Client state (user input)
  };
};
```

### TanStack Query Pattern (Server State)

- **Query Layer** (`app/queries/`): Domain-specific query logic (e.g., `useHealthQuery`)
- **Adapter Composables** (`app/composables/`): Bridge between queries and components, handle data transformation
- **Centralized Configuration**: Plugin setup with SSR support at `app/plugins/vue-query.ts`
- **Caching Strategy**: 5-minute stale time, 30-minute garbage collection
- **Clear Separation**: Query logic isolated from business/presentation logic

### Pinia Pattern (Client State)

- **Store Definition** (`app/store/`): Composition API style stores using `defineStore`
- **Store Composables** (`app/composables/`): Abstraction layer for store access
- **Reactive State**: Using `storeToRefs()` for reactive destructuring
- **Computed Integration**: WritableComputedRef pattern for v-model compatibility
- **Testing Integration**: Full testing support with mocking capabilities

### Composables Pattern (Vue 3 Composition API)

- **Query Composables** (`app/queries/`): Pure TanStack Query logic without business logic
- **Adapter Composables** (`app/composables/`): Data transformation and business logic
- **Store Composables**: Pinia store access and transformation
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
- **State Integration**: Components consume both server and client state via composables
- **Props Pattern**: Type-safe props using TypeScript interfaces

## Key Architectural Principles

### 1. State Separation

- **Server State**: TanStack Query (API data, caching, background updates)
- **Client State**: Pinia (UI state, user input, local data)
- **No State Mixing**: Clear boundaries between server and client concerns
- **Independent Testing**: Each state management can be tested independently

### 2. Type Safety

- **End-to-end TypeScript** from API to UI
- **Runtime validation** with Zod schemas
- **Auto-generated types** to prevent drift between API and frontend
- **Type-safe state management** in both TanStack Query and Pinia

### 3. Separation of Concerns

- **Services**: Handle API communication and validation
- **Query Composables**: Manage server state and caching
- **Store Composables**: Manage client state
- **Adapter Composables**: Transform data for UI consumption
- **Components**: Focus on presentation and user interaction

### 4. Performance Optimization

- **TanStack Query Caching**: Intelligent background data synchronization
- **SSR/SSG Support**: Server-side data hydration for better performance
- **Bundle Optimization**: Tree-shaking and code splitting
- **Hot Module Replacement**: Fast development feedback

### 5. Testing Architecture

- **Query Testing**: TanStack Query with mock service layer
- **Store Testing**: Pinia testing with `createTestingPinia`
- **Component Testing**: Integration tests with both state types
- **E2E Testing**: Full application flow testing

## Integration Points

### Hybrid State Integration

```typescript
// Component consumes both server and client state
const {
  isLoading, // from TanStack Query
  healthStatusData, // from TanStack Query
  sampleInput, // from Pinia
} = useHealth();
```

### Query Layer ↔ Services

- **Query Functions**: Services provide data to TanStack Query
- **Type Validation**: Zod schemas ensure runtime type safety
- **Error Handling**: Consistent error propagation and handling
- **Pure Query Logic**: Query layer focuses solely on data fetching and caching

### Store Layer ↔ Components

- **Reactive Access**: `storeToRefs()` for reactive state access
- **Action Integration**: Direct store action calls
- **Computed Properties**: WritableComputedRef for two-way binding
- **Type Safety**: Full TypeScript integration

### Frontend ↔ Backend

- **API communication** through generated TypeScript client
- **Shared types** in `/shared/types/api/`
- **Development proxy** through Nuxt server handlers

### Development ↔ Production

- **Build-time type generation** from OpenAPI specs
- **Static analysis** with ESLint, Biome, and TypeScript
- **Consistent formatting** with Prettier and Biome

## Implementation Examples

### Store Definition Pattern

```typescript
// app/store/health.ts
export const useHealthStore = defineStore('health', () => {
  const input = ref('');
  const updateInput = (value: string): void => {
    input.value = value;
  };
  return { input, updateInput };
});
```

### Store Composable Pattern

```typescript
// app/composables/useHealth/useHealthInput.ts
export const useHealthInput = () => {
  const healthStore = useHealthStore();
  const { input } = storeToRefs(healthStore);
  const { updateInput } = healthStore;

  const sampleInput = computed({
    get: () => input.value,
    set: (value: string) => updateInput(value),
  });

  return { sampleInput };
};
```

### Hybrid Integration Pattern

```typescript
// app/composables/useHealth/index.ts
export const useHealth = () => {
  return {
    ...useHealthAdapter(), // Server state management
    ...useHealthInput(), // Client state management
  };
};
```
