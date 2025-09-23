# Task Completion Checklist

## 🔍 Basic Quality Check

### Required Check Items

1. **Lint & Format Check**

   ```bash
   pnpm lint:fix
   ```

   - No ESLint errors
   - No Biome errors
   - Prettier format applied
   - No TypeScript type errors

2. **Test Execution**

   ```bash
   pnpm test
   ```

   - All existing tests pass
   - Tests added for new features (when necessary)

3. **Build Verification**

   ```bash
   pnpm build
   ```

   - Production build succeeds
   - Type definition generation succeeds

## 🏗️ Architecture Compliance Check

### Hybrid State Management

- **When using TanStack Query**:
  - API communication implemented in `app/services/`
  - Query definitions in `app/queries/`
  - Adapter provided in `app/composables/`
  - Manages server state only

- **When using Pinia**:
  - Store definitions in `app/store/`
  - Store access provided in `app/composables/`
  - Manages client state only
  - Uses `createTestingPinia` for testing

### Unified Interface

- Components access through single `useXxx()` interface
- Server and client states are properly separated

## 📝 Code Style Compliance Check

### JSDoc Quality

- **Appropriate JSDoc for functions**:
  - Clear and specific description of purpose
  - All parameters explained with `@param` tags
  - Return value explained with `@returns` tags
  - Use technically accurate expressions

- **Expressions to avoid**:
  - "Pattern matching style"
  - "Functional paradigm style"
  - "Pure function" (when used without context)

### Naming Conventions

- **Components**: PascalCase
- **Composables**: `use` + camelCase
- **Queries**: `use` + camelCase + `Query`
- **Stores**: `use` + camelCase + `Store`

## 🚨 Error Handling Compliance Check

### Error Code System

- **Use appropriate classification**:
  - `NET_xxx`: Network-related
  - `SVR_xxx`: Server internal
  - `VAL_xxx`: Validation
  - `AUTH_xxx`: Authentication/Authorization
  - `UNK_xxx`: Unknown/Unexpected

### Unified Response Format

```json
{
  "error": "Error message",
  "errorCode": "SVR_002",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Handling Function Verification

```bash
# Test after starting development server
curl "http://localhost:3000/api/health?simulate=error"
curl "http://localhost:3000/api/health?simulate=timeout"
```

## 🔄 API-First Development Check

### Type Definition Synchronization

```bash
pnpm generate-types
```

- OpenAPI specification is up to date
- TypeScript type definitions are synchronized
- Zod schemas are properly defined

### Swagger Operation Verification

- Accessible at http://localhost:3000/api/swagger
- API specification displayed correctly
- Test parameters are functional

## 🧪 Test Quality Check

### Test Coverage

```bash
pnpm test:coverage
```

- Main logic is tested
- Edge cases are considered

### Test File Placement

- **Unit tests**: `*.{test,spec}.ts`
- **Nuxt tests**: `*.nuxt.{test,spec}.ts`
- **Appropriate directory**: `app/__test__/`

## 📚 Documentation Update Check

### Auto-generated Files

- `public/openapi.yaml`: API specification
- `shared/types/api/`: TypeScript type definitions

### Manual Documentation

- **When adding new features**: Update `docs/` directory
- **When changing architecture**: Update README.md
- **For important changes**: Create CHANGELOG (when necessary)

## 🔐 Security Check

### Exclusion of Secret Information

- No secret keys or API keys committed
- `.env` files included in `.gitignore`
- No secret information output to logs

## 📦 Dependency Check

### Package Updates

```bash
pnpm update
```

- Dependencies are up to date (when necessary)
- No vulnerabilities

## 🏃‍♂️ Performance Check

### Build Size

```bash
pnpm build
```

- Bundle size is appropriate
- No unnecessary imports

### Development Experience

```bash
pnpm dev
```

- Development server starts quickly
- Hot reload is functional

## 🎯 Project-Specific Check

### Volta Environment

- Using Node.js v22.16.0
- Using pnpm v10.15.1

### Git Conventions

- Create commit messages with Gitmoji conventions
- Pass Husky pre-commit hooks

## ✅ Final Verification Commands

```bash
# Execute everything in batch
pnpm lint:fix && pnpm test && pnpm build

# Complete check including error handling related
pnpm generate-types && pnpm lint:fix && pnpm test && pnpm build
```

## 🚀 Pre-Deployment Final Check

1. All automated tests pass
2. Manual testing confirms error handling
3. Production build succeeds
4. Type definitions and API specification synchronization confirmed
5. Documentation updates completed
6. Security check completed

Following this checklist enables efficient development while maintaining project quality and consistency.
