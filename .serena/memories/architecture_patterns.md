# Architecture Patterns

## 🏗️ Hybrid State Management Architecture

### Basic Design Principles

**Clear Separation of Responsibilities**:

- **TanStack Query**: Server state (API data, caching, synchronization)
- **Pinia**: Client state (UI state, user input, local data)

### Data Flow Implementation Patterns

#### Server State Flow (TanStack Query)

```
API Layer (services/)
    ↓
Query Layer (queries/)
    ↓
Adapter Layer (composables/)
    ↓
Components
```

**Implementation Example**:

```typescript
// 1. API Communication (app/services/health.ts)
export const getHealthApi = async (): Promise<GetApiHealthResponse> => {
  const response = await $fetch<GetApiHealthResponse>('/api/health');
  return zGetApiHealthResponse.parse(response);
};

// 2. Query Definition (app/queries/useHealthQuery.ts)
export const useHealthQuery = () => {
  const healthQuery = useQuery({
    queryKey: ['health'] as const,
    queryFn: getHealthApi,
  });
  return { healthQuery };
};

// 3. Adapter (app/composables/useHealth/useHealthAdapter.ts)
export const useHealthAdapter = () => {
  const { healthQuery } = useHealthQuery();
  const { isLoading, data, suspense: getHealthData } = healthQuery;

  const healthStatusData = computed(() => ({
    healthStatus: data.value?.status ?? '-',
    healthTimestamp: data.value?.timestamp ?? '-',
  }));

  return { isLoading, getHealthData, healthStatusData };
};
```

#### Client State Flow (Pinia)

```
Store Layer (store/)
    ↓
Store Composables (composables/)
    ↓
Components
```

**Implementation Example**:

```typescript
// 1. Store Definition (app/store/health.ts)
export const useHealthStore = defineStore('health', () => {
  const input = ref('');
  const updateInput = (value: string): void => {
    input.value = value;
  };
  return { input, updateInput };
});

// 2. Store Operations (app/composables/useHealth/useHealthInput.ts)
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

#### Unified Interface

```typescript
// app/composables/useHealth/index.ts
export const useHealth = () => {
  return {
    ...useHealthAdapter(), // Server state
    ...useHealthInput(), // Client state
  };
};
```

## 🚨 Unified Error Handling Pattern

### Error Code System

```typescript
// shared/constants/errorCode.ts
export const ERROR_TYPES = {
  // Network-related errors (NET_xxx)
  CONNECTION_ERROR: 'NET_001',
  TIMEOUT_ERROR: 'NET_002',

  // Server internal errors (SVR_xxx)
  INTERNAL_SERVER_ERROR: 'SVR_001',
  SERVICE_UNAVAILABLE: 'SVR_002',

  // Validation errors (VAL_xxx)
  VALIDATION_INVALID_FORMAT: 'VAL_002',

  // Authentication/Authorization errors (AUTH_xxx)
  AUTH_FAILED: 'AUTH_001',

  // Unknown/Unexpected errors (UNK_xxx)
  UNEXPECTED_ERROR: 'UNK_001',
} as const;
```

### Error Response Generation Pattern

```typescript
// Unified error response
export const createErrorResponse = (errorCode: ErrorCode, customMessage?: string, timestamp?: string) => ({
  error: customMessage || ERROR_MESSAGES[errorCode],
  errorCode,
  timestamp: timestamp || new Date().toISOString(),
});
```

### Global Error Handling

```typescript
// server/api/middleware/errorHandler.ts
export const errorHandlerMiddleware = async (context: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    const errorCode = classifyError(error);
    const httpStatus = getHttpStatusFromErrorCode(errorCode);
    const errorResponse = createErrorResponse(errorCode);

    return context.json(errorResponse, httpStatus);
  }
};
```

## 🔄 API-First Development Pattern

### Development Flow

```
1. OpenAPI Specification Definition (server/api/schema/)
    ↓
2. Automatic Type Generation (shared/types/api/)
    ↓
3. Server Implementation (server/api/routes/)
    ↓
4. Client Implementation (app/services/, app/queries/)
```

### Zod Schema Pattern

```typescript
// server/api/schema/health.ts
/**
 * Health check success response schema
 * Contains system status and timestamp
 */
export const healthResponseSchema = z.object({
  status: z.string().openapi({ example: 'ok' }),
  timestamp: z.iso.datetime().openapi({ example: new Date().toISOString() }),
});
```

## 🧪 Test Architecture Pattern

### TanStack Query Test Pattern

```typescript
// Test with mock service
vi.mock('@/services/health', () => ({
  getHealthApi: vi.fn(),
}));

const mockGetHealthApi = vi.mocked(getHealthApi);
```

### Pinia Test Pattern

```typescript
// app/helpers/test/setupTestingPinia.ts
export const setupTestingPinia = (initialState = {}) => {
  return createTestingPinia({
    stubActions: false,
    createSpy: vi.fn,
    initialState,
  });
};
```

### Integration Test Pattern

```typescript
// Component test including both state management systems
const wrapper = mount(Component, {
  global: {
    plugins: [setupTestingPinia(), [VueQueryPlugin, queryClient]],
  },
});
```

## 📁 Directory Structure Pattern

### Feature-Based Structure

```
app/composables/useHealth/
├── index.ts              # Unified interface
├── useHealthAdapter.ts   # Server state adapter
└── useHealthInput.ts     # Client state operations
```

### Layer Separation

```
app/
├── services/     # API communication layer
├── queries/      # TanStack Query layer
├── store/        # Pinia store layer
├── composables/  # Adapter layer (unified)
└── components/   # Presentation layer
```

## 🔧 Configuration Patterns

### Nuxt Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/test-utils/module', '@nuxtjs/tailwindcss', '@pinia/nuxt'],
  serverHandlers: [{ route: '/api/**', handler: '~~/server/api/index.ts' }],
});
```

### TanStack Query Configuration

```typescript
// app/plugins/vue-query.ts
export default defineNuxtPlugin(() => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 1000 * 60 * 5 }, // 5 minutes
    },
  });
  vueQueryPlugin.install(nuxtApp.vueApp, { queryClient });
});
```

## 🎯 Performance Optimization Patterns

### Cache Strategy

- **TanStack Query**: Automatic server data caching
- **Pinia**: State retention only when needed
- **SSR**: Initial data hydration

### Code Splitting

```typescript
// Dynamic import at page level
const HealthComponent = defineAsyncComponent(() => import('@/components/Health.vue'));
```

## 🔐 Security Patterns

### Input Validation

```typescript
// Runtime validation with Zod
const validatedData = schema.parse(input);
```

### Error Information Control

```typescript
// Hide detailed error information in production environment
const errorMessage = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message;
```

## 🚀 Deployment Patterns

### SSR/SSG Selection

- **SSR**: Dynamic content
- **SSG**: Static content
- **Hybrid**: Page-level optimization

### Environment-specific Configuration

```typescript
// Configuration branching by environment variables
const apiUrl = process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

These architecture patterns enable building scalable and maintainable applications.
