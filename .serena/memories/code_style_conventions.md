# Code Style and Conventions

## Formatting Configuration

### Biome Configuration

- **Indentation**: 2 spaces
- **Line width**: 120 characters
- **Line ending**: LF
- **Quotes**: Single quotes
- **Trailing comma**: All
- **Semicolon**: Always
- **Import organization**: Enabled

### Prettier Configuration

- **Tab width**: 2 spaces
- **Print width**: 120 characters
- **Trailing comma**: All
- **Line ending**: LF
- **Semicolon**: true
- **Single quote**: true

### ESLint Configuration

- Using Nuxt built-in configuration
- TailwindCSS plugin enabled
- Vue.js accessibility plugin enabled
- Vue-specific rules:
  - `vue/html-self-closing`: off
  - `vue/multi-word-component-names`: off
  - `vue/no-multiple-template-root`: off

## File Structure Conventions

### Directory Structure

- `app/` - Nuxt application code
  - `components/` - Vue components
  - `composables/` - Reusable composition functions (adapters)
  - `queries/` - TanStack Query layer
  - `store/` - Pinia stores
  - `services/` - Business logic services
  - `helpers/test/` - Test helpers
- `server/` - Backend API code
  - `api/routes/` - API route handlers
  - `api/schema/` - Zod schemas
  - `api/middleware/` - Middleware
- `shared/` - Shared types and utilities
  - `types/api/` - Auto-generated API types
  - `constants/` - Constant definitions

### Naming Conventions

- **Components**: PascalCase (e.g., `HealthStatusDisplayArea.vue`)
- **Queries**: camelCase + `use` prefix + `Query` suffix (e.g., `useHealthQuery`)
- **Composables**: camelCase + `use` prefix (e.g., `useHealth`, `useHealthAdapter`)
- **Services**: camelCase (e.g., `getHealthApi`)
- **Stores**: camelCase + `use` prefix + `Store` suffix (e.g., `useHealthStore`)
- **API Routes**: kebab-case (e.g., `/api/health`)

## TypeScript Conventions

- Strict TypeScript configuration (via Nuxt)
- Auto-generated type definitions from OpenAPI specifications
- Runtime validation with Zod schemas
- Import organization with Biome

## JSDoc Conventions

### Required Elements

- **Function purpose**: Clear and specific description
- **Parameters**: `@param` tag with type and description
- **Return value**: `@returns` tag with type and description
- **Exceptions**: `@throws` tag when necessary

### Example

```typescript
/**
 * エラーレスポンスを生成するヘルパー関数
 * @param errorCode - エラーコード
 * @param customMessage - カスタムエラーメッセージ（省略時はデフォルトメッセージを使用）
 * @param timestamp - タイムスタンプ（省略時は現在時刻を使用）
 * @returns エラーレスポンスオブジェクト
 */
```

### Expressions to Avoid

- Technically inaccurate terms (e.g., "pattern matching style", "functional paradigm style")
- Describe the purpose of the function, not implementation details

## Error Handling Conventions

### Error Code Naming

- **NET_xxx**: Network-related
- **SVR_xxx**: Server internal
- **VAL_xxx**: Validation
- **AUTH_xxx**: Authentication/Authorization
- **UNK_xxx**: Unknown/Unexpected

### Unified Response Format

```json
{
  "error": "Error message",
  "errorCode": "SVR_002",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Test Conventions

### File Naming

- **Unit tests**: `*.{test,spec}.ts`
- **Nuxt tests**: `*.nuxt.{test,spec}.ts`

### Test Structure

- **Query**: TanStack Query testing with mock services
- **Store**: Isolated store testing with `createTestingPinia`
- **Component**: Integration testing with both state types

## Git Conventions

- **Commitlint**: Using Gitmoji conventions
- **Husky**: Pre-commit hooks enabled

## Quality Management

### Lint & Format Commands

- `pnpm lint`: Overall check (ESLint + Biome + Prettier + TypeCheck)
- `pnpm lint:fix`: Overall fixes
- `pnpm format`: Format check
- `pnpm format:fix`: Format fixes

### Type Checking

- `pnpm typecheck`: TypeScript type check
- `nuxi typecheck .`: Nuxt type check
