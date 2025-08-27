# Architecture Patterns and Guidelines

## Project Architecture

### Full-Stack Monorepo Structure

This project follows a **monorepo pattern** with clear separation of concerns:

- **Frontend**: Nuxt.js application in `/app` directory
- **Backend**: Hono API integrated into Nuxt server in `/server` directory
- **Shared**: Common types and utilities in `/shared` directory

### API-First Development

- **OpenAPI specification** drives development
- **Type-safe communication** between frontend and backend
- **Auto-generated TypeScript types** from OpenAPI specs
- **Swagger UI** for API documentation and testing

## Design Patterns

### Composables Pattern (Vue 3 Composition API)

- **Service Layer**: Business logic in composables (e.g., `useHealth`)
- **State Management**: Pinia stores for global state
- **Adapters**: Composables that bridge services and components
- **Common Utilities**: Shared composables for cross-cutting concerns

### API Layer Architecture

- **Route Handlers**: Organized in `/server/api/routes/`
- **Schema Validation**: Zod schemas in `/server/api/schema/`
- **OpenAPI Integration**: Type-safe route definitions with `@hono/zod-openapi`

### Component Architecture

- **Page Components**: Route-level components in `/app/pages/`
- **Feature Components**: Domain-specific components organized by feature
- **Layout System**: Nuxt layouts for consistent page structure
- **Component Composition**: Small, focused, reusable components

## Key Architectural Principles

### 1. Type Safety

- **End-to-end TypeScript** from API to UI
- **Runtime validation** with Zod schemas
- **Auto-generated types** to prevent drift between API and frontend

### 2. Separation of Concerns

- **Services**: Handle business logic and API communication
- **Stores**: Manage application state
- **Components**: Focus on presentation and user interaction
- **Composables**: Provide reusable logic and state

### 3. API Design Standards

- **RESTful endpoints** with clear naming
- **Consistent response formats**
- **Comprehensive OpenAPI documentation**
- **Proper HTTP status codes** and error handling

### 4. Modern Development Practices

- **Convention over configuration** (Nuxt.js approach)
- **File-based routing** (automatic route generation)
- **Auto-imports** for composables and utilities
- **Hot module replacement** for fast development

## Integration Points

### Frontend ↔ Backend

- **API communication** through generated TypeScript client
- **Shared types** in `/shared/types/api/`
- **Development proxy** through Nuxt server handlers

### Development ↔ Production

- **Build-time type generation** from OpenAPI specs
- **Static analysis** with ESLint, Biome, and TypeScript
- **Consistent formatting** with Prettier and Biome
