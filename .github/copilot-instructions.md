# GitHub Copilot Instructions

**Always reference these instructions first** and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

Nuxt 4 + Hono + TanStack Query フルスタック Web アプリケーション with TypeScript, featuring hybrid state management (TanStack Query for server state + Pinia for client state).

## Working Effectively

### Bootstrap, Build, and Test the Repository

Execute these commands in order for initial setup:

1. **Install Node.js 22.16.0** (REQUIRED - project will fail with other versions):
   ```bash
   # Using nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   nvm install 22.16.0
   nvm use 22.16.0
   
   # Verify version
   node --version  # Must show v22.16.0
   ```

2. **Install pnpm 10.15.1**:
   ```bash
   npm install -g pnpm@10.15.1
   pnpm --version  # Must show 10.15.1
   ```

3. **Install dependencies** - takes ~37 seconds. NEVER CANCEL:
   ```bash
   pnpm install
   # Expected time: 36-40 seconds
   # Set timeout: 120+ seconds
   ```

4. **Generate API types** - takes ~15 seconds. NEVER CANCEL:
   ```bash
   pnpm generate-types
   # Expected time: 15-20 seconds
   # Set timeout: 60+ seconds
   ```

5. **Run tests** - takes ~10 seconds. NEVER CANCEL:
   ```bash
   pnpm test
   # Expected time: 7-12 seconds
   # Expected: 41 tests pass
   # Set timeout: 60+ seconds
   ```

6. **Build application** - takes ~14 seconds. NEVER CANCEL:
   ```bash
   pnpm build
   # Expected time: 14-18 seconds
   # Set timeout: 60+ seconds
   ```

### Run the Development Application

**ALWAYS run the bootstrapping steps first.**

1. **Start development server**:
   ```bash
   pnpm dev
   # Starts in ~1 second
   # Available at: http://localhost:3000
   ```

2. **Access URLs**:
   - **App**: http://localhost:3000
   - **API Documentation**: http://localhost:3000/api/swagger
   - **OpenAPI Spec**: http://localhost:3000/api/openapi.yaml
   - **Health Check**: http://localhost:3000/api/health

3. **DevTools** (auto-enabled in development):
   - **Nuxt DevTools**: Press Shift + Alt + D in browser
   - **TanStack Query DevTools**: Visible in browser UI
   - **Pinia DevTools**: Available in Vue DevTools

### Run Production Preview

```bash
pnpm preview
# Serves production build at http://localhost:3000
```

## Validation

### Always Run Complete End-to-End Scenarios

**ALWAYS manually validate** any new code by running through these complete user scenarios:

1. **Health Check Flow**:
   ```bash
   # After starting dev server
   curl http://localhost:3000/api/health
   # Expected: {"error":"External service health check failed","errorCode":"SVR_004","timestamp":"..."}
   ```

2. **API Error Testing**:
   ```bash
   # Test error simulation endpoints
   curl "http://localhost:3000/api/health?simulate=error"
   # Expected: {"error":"Service temporarily unavailable for maintenance","errorCode":"SVR_002","timestamp":"..."}
   
   curl "http://localhost:3000/api/health?simulate=timeout"
   # Expected: timeout or specific error response
   ```

3. **Frontend Validation**:
   - Visit http://localhost:3000
   - Verify page loads without errors
   - Check browser console for errors
   - Test any interactive elements you've modified

4. **API Documentation**:
   - Visit http://localhost:3000/api/swagger
   - Verify Swagger UI loads
   - Test API endpoints through the UI

### Always Run Before Committing

**Run these commands in order** - each command has specific timeout requirements:

```bash
# 1. Lint and format - takes ~15-20 seconds. NEVER CANCEL
pnpm lint:fix
# Set timeout: 60+ seconds

# 2. Test - takes ~10 seconds. NEVER CANCEL  
pnpm test
# Set timeout: 60+ seconds

# 3. Build verification - takes ~14 seconds. NEVER CANCEL
pnpm build
# Set timeout: 60+ seconds
```

**CI Validation Commands** (used in GitHub Actions):
```bash
pnpm biome:ci        # Biome CI check
pnpm prettier:ci     # Prettier CI check  
pnpm eslint:ci       # ESLint CI check (zero warnings)
pnpm typecheck       # TypeScript check
pnpm test:coverage   # Tests with coverage
```

## Common Tasks

### API Type Generation

**When modifying API schemas**, always regenerate types:

```bash
# Full regeneration (includes OpenAPI spec generation)
pnpm generate-types
# Takes ~15 seconds. NEVER CANCEL. Set timeout: 60+ seconds

# CI-only generation (skips spec generation)
pnpm generate-types:ci
```

**Generated files** (do not modify manually):
- `shared/types/api/index.ts`
- `shared/types/api/types.gen.ts` 
- `shared/types/api/zod.gen.ts`
- `public/openapi.yaml`

### Development Workflow

**Standard development flow**:

1. `pnpm generate-types` - Update API types
2. `pnpm dev` - Start development server
3. Make your changes
4. `pnpm lint:fix` - Fix linting issues
5. `pnpm test` - Run tests
6. `pnpm build` - Verify production build

### Troubleshooting

**Port 3000 already in use**:
```bash
lsof -i :3000
kill -9 <PID>
pnpm dev
```

**Clean install** (if dependencies are corrupted):
```bash
rm -rf node_modules .nuxt pnpm-lock.yaml
pnpm install
```

**Type errors after API changes**:
```bash
pnpm generate-types
pnpm typecheck
```

**Full environment reset**:
```bash
rm -rf node_modules .nuxt
pnpm install
pnpm generate-types
pnpm dev
```

## Architecture Overview

### 4-Layer Architecture

The codebase follows a strict 4-layer pattern:

1. **Services** (`app/services/`) - API communication + Zod validation
2. **Queries** (`app/queries/`) - TanStack Query caching layer
3. **Composables** (`app/composables/`) - Business logic + data transformation
4. **Components** (`app/components/`) - Vue presentation layer

### Hybrid State Management

- **Server State**: Managed by TanStack Query (API data, caching, synchronization)
- **Client State**: Managed by Pinia (UI state, user input, local data)
- **Integration**: Composables provide unified interface to both

### Key Directories

```
├── app/                    # Nuxt application
│   ├── store/             # Pinia stores (client state)
│   ├── queries/           # TanStack Query (server state)  
│   ├── composables/       # Unified state interface
│   ├── services/          # API communication
│   ├── components/        # Vue components
│   └── __test__/          # Tests
├── server/api/            # Hono backend API
├── shared/types/api/      # Auto-generated types (DO NOT EDIT)
├── docs/                  # Documentation
└── .github/workflows/     # CI/CD configuration
```

### Naming Conventions

- **Vue Components**: PascalCase (`HealthStatusDisplayArea.vue`)
- **Composables**: `use` + camelCase (`useHealth.ts`)
- **API Functions**: camelCase + `Api` (`getHealthApi`)
- **Test Files**: `*.spec.ts` or `*.nuxt.spec.ts`

### Testing Patterns

- **describe**: Japanese, describes the file being tested
- **test names**: Japanese, describes the specific behavior
- **DOM selection**: Use `data-testid` attributes
- **Test helpers**: Use `mountComponent` helper for component tests

## Critical Warnings

### NEVER CANCEL Commands

**These commands take significant time - ALWAYS wait for completion**:

- `pnpm install` - 37+ seconds
- `pnpm build` - 14+ seconds  
- `pnpm test` - 10+ seconds
- `pnpm generate-types` - 15+ seconds
- `pnpm lint:fix` - 15+ seconds

**Set timeouts of 120+ seconds** for install, 60+ seconds for all other build/test commands.

### Environment Requirements

- **Node.js**: EXACTLY v22.16.0 (other versions will fail)
- **pnpm**: EXACTLY v10.15.1
- **Package manager**: Use pnpm only, NOT npm or yarn

### Files to Never Edit

- Any files in `shared/types/api/` (auto-generated)
- `public/openapi.yaml` (auto-generated)
- `pnpm-lock.yaml` (managed by pnpm)

## Quick Reference

### Most Used Commands

```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm test             # Run tests
pnpm lint:fix         # Fix all linting issues
pnpm generate-types   # Regenerate API types
```

### Documentation Locations

- **Quickstart**: `docs/quickstart.md`
- **Architecture**: `docs/architecture.md`  
- **API Integration**: `docs/api-integration.md`
- **Testing**: `docs/testing.md`
- **Troubleshooting**: `docs/troubleshooting.md`
- **Code Style**: `.serena/memories/code_style_conventions.md`

### Port Reference

- **App**: 3000
- **API Docs**: 3000/api/swagger
- **OpenAPI**: 3000/api/openapi.yaml
- **Health**: 3000/api/health

Always verify these URLs are accessible after starting the development server.

## コミットメッセージ規約

### 基本構造

`<gitmoji> <type>: <message> (<#issue number>)`

### 例

- ✨ feat: xx 機能を追加
- 🐛 fix: ユーザー登録時のバグを修正
- 🔧 chore: CI の設定を変更
- 📝 docs: コミットメッセージ規約を追加 (#52)

### タイプの一覧

[gitmoji.dev](https://gitmoji.dev/)

- ✨ : 新機能の導入
- 🐛 : バグの修正
- 🚑 : 重大なホットフィックス
- 🔧 : 設定ファイルの追加/更新
- 📝 : ドキュメンテーションの追加/更新
- 🩹 : 軽微な修正
- 🦺 : バリデーションの追加・更新
- ♻️ : コードのリファクタリング
- ⚡️ : パフォーマンス改善
- 👷 : CIビルドシステムの追加/更新
- ✅ : テストの追加/更新/合格
- 🔥 : 不要なコードやファイルの削除
- 🚨 : linterの警告の修正
- 🎨 : コードの構造/形式の改善
- ♿️ : アクセシビリティの改善
- 🏷️ : タグの追加/更新

など

### 注意点

- コミットメッセージは日本語で記述すること
- メッセージは簡潔に、何をしたのかを明確にすること
- 同じ type でも絵文字で粒度を表現してよい（例: 🩹 update: 軽微な修正 / 🦺 update: バリデーションの追加・更新）
- コロン (:) の直後に半角スペースを入れる（例: `feat: 新機能を追加`）
- Issue 番号の前は半角スペースを入れる（例: `... 追加 (#123)`）
- 関連するIssue番号がある場合は必ず記載する（例: `(#123)`）
- Issue番号がない場合は括弧ごと省略する
- 件名末尾に句点（。/.）は付けない
