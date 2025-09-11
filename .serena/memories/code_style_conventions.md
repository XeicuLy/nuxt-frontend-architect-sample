# Code Style and Conventions

## Formatting Configuration

### Biome Configuration

- **Indent**: 2 spaces
- **Line width**: 120 characters
- **Line ending**: LF
- **Quote style**: Single quotes
- **Trailing commas**: Always
- **Semicolons**: Always
- **Import organization**: Enabled

### Prettier Configuration

- **Tab width**: 2 spaces
- **Print width**: 120 characters
- **Trailing comma**: All
- **End of line**: LF
- **Semicolons**: True
- **Single quote**: True

### ESLint Configuration

- Uses Nuxt's built-in ESLint configuration
- TailwindCSS plugin enabled
- Vue.js accessibility plugin enabled
- Specific Vue rules:
  - `vue/html-self-closing`: off
  - `vue/multi-word-component-names`: off
  - `vue/no-multiple-template-root`: off

## File Structure Conventions

### Directory Structure

- `app/` - Nuxt application code
  - `components/` - Vue components
  - `composables/` - Reusable composition functions (adapters)
  - `queries/` - TanStack Query layer
  - `layouts/` - Page layouts
  - `pages/` - Route pages
  - `services/` - Business logic services
  - `store/` - Pinia stores (currently empty)
  - `assets/css/` - Stylesheets
- `server/` - Backend API code
  - `api/routes/` - API route handlers
  - `api/schema/` - Zod schemas
- `shared/` - Shared types and utilities
  - `types/api/` - Auto-generated API types

### Naming Conventions

- **Components**: PascalCase (e.g., `HealthStatusDisplayArea.vue`)
- **Queries**: camelCase with `use` prefix + `Query` suffix (e.g., `useHealthQuery`)
- **Composables**: camelCase with `use` prefix (e.g., `useHealth`, `useHealthAdapter`)
- **Services**: camelCase with Service suffix (e.g., `useHealthService.ts`)
- **Stores**: camelCase with Store suffix (e.g., `useHealthStore.ts`)
- **API routes**: kebab-case (e.g., `/api/health`)

## TypeScript Guidelines

- Strict TypeScript configuration via Nuxt
- Type definitions auto-generated from OpenAPI specs
- Zod schemas for runtime validation
- Import organization with Biome
