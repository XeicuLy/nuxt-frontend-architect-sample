# Project Overview

## Project Purpose

This project is a **Nuxt 4 + Hono + TanStack Query + Pinia full-stack sample** that provides a practical full-stack application sample for learning modern hybrid state management.

### Core Features

- **Hybrid State Management**: Clear separation of TanStack Query (server state) + Pinia (client state)
- **API-First Development**: Auto-generated TypeScript type definitions from OpenAPI specifications
- **Unified Error Handling**: Systematic error code classification and unified responses
- **Type Safety**: Complete type safety between frontend and backend
- **Test Support**: Comprehensive testing support for both state management systems

## Technology Stack

### Frontend

- **Nuxt 4** (4.1.1) - Full-stack framework
- **Vue 3** (3.5.21) - Progressive framework
- **TanStack Query** (@tanstack/vue-query v5.87.1) - Server state management
- **Pinia** (v3.0.3) + @pinia/testing (1.0.2) - Client state management & testing
- **TypeScript** (5.9.2) - Type safety
- **Tailwind CSS** - Styling

### Backend

- **Hono** (4.9.6) - Lightweight high-performance web framework
- **OpenAPI** + **Swagger UI** - API specification and documentation
- **Zod** (4.1.5) - Schema validation

### Development Tools

- **Biome** (2.2.3) - High-speed linter & formatter
- **ESLint** (9.35.0) + **Prettier** (3.6.2) - Code quality
- **@hey-api/openapi-ts** (0.82.4) - Auto-generated type definitions
- **Vitest** + **@nuxt/test-utils** - Testing framework

### Environment

- **Node.js** v22.16.0+ (Volta managed)
- **pnpm** v10.15.1 (Volta managed)

## Project Structure

```
├── app/                           # Nuxt application
│   ├── store/                     # Pinia stores (client state)
│   ├── queries/                   # TanStack Query layer (server state)
│   ├── composables/               # Unified adapter layer
│   │   ├── common/               # Common utilities
│   │   └── useHealth/            # Health check feature integration
│   ├── services/                 # API communication & business logic
│   ├── components/               # Vue components
│   ├── helpers/test/             # Test helpers
│   └── ...
├── server/api/                   # Hono backend
│   ├── middleware/               # Error handling middleware
│   ├── schema/                   # Zod schema definitions
│   └── routes/                   # API route handlers
├── shared/                       # Shared constants & type definitions
│   ├── constants/               # Error codes & HTTP status
│   └── types/api/               # Auto-generated type definitions
└── docs/                        # Detailed documentation
```

## Architecture Features

### Hybrid State Management

**Clear Separation of Responsibilities**:

- **TanStack Query**: Specialized for API data, caching, and synchronization
- **Pinia**: Specialized for UI state, user input, and local data

**Unified Interface**:

```typescript
const {
  isLoading, // TanStack Query (server state)
  healthStatusData, // TanStack Query (server state)
  sampleInput, // Pinia (client state)
} = useHealth();
```

### Unified Error Handling

Systematic error code classification:

- **NET_xxx**: Network-related errors
- **SVR_xxx**: Server internal errors
- **VAL_xxx**: Validation errors
- **AUTH_xxx**: Authentication/Authorization errors
- **UNK_xxx**: Unknown/Unexpected errors

### API-First Development

1. OpenAPI specification definition
2. Auto-generated TypeScript types
3. Type-safe communication between frontend and backend

## Learning Value

- **Scalable Architecture**: Design patterns for large-scale applications
- **State Management Separation**: Choosing the right state management for the right purpose
- **Error Handling**: Unified error management system
- **Testing Strategy**: Testing techniques for multiple state management systems
- **Modern Toolchain**: Effective utilization of latest development tools
