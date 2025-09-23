# Essential Development Commands

## 🚀 Development & Execution Commands

### Basic Development

```bash
pnpm dev              # Start development server (http://localhost:3000)
pnpm build            # Production build
pnpm generate         # Static site generation (SSG)
pnpm preview          # Production preview
```

### API Type Generation

```bash
pnpm generate-types       # 完全自動化: サーバー起動→スペック取得→型生成→サーバー停止
pnpm generate-types:ci    # CI専用: 型生成のみ（OpenAPIファイル既存前提）
pnpm generate-types:manual # 手動方式: 従来の2ステップ方式
```

### Access URLs

- **App**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/swagger
- **DevTools**: Nuxt DevTools + TanStack Query DevTools + Pinia DevTools

## 🔍 Quality Management Commands

### Lint & Format

```bash
# Comprehensive check
pnpm lint:fix         # ESLint + Biome + Prettier + TypeCheck (full check with auto-fix)
pnpm lint             # ESLint + Biome + Prettier + TypeCheck (check only)

# Individual checks
pnpm eslint           # ESLint check
pnpm eslint:fix       # ESLint fix
pnpm biome            # Biome check
pnpm biome:fix        # Biome fix
pnpm prettier         # Prettier check
pnpm prettier:fix     # Prettier fix
pnpm typecheck        # TypeScript type check

# Format-specific
pnpm format           # Format check (Prettier + Biome)
pnpm format:fix       # Format fix (Prettier + Biome)
```

### CI Commands

```bash
pnpm biome:ci         # Biome CI check
pnpm prettier:ci      # Prettier CI check (warning level log)
pnpm eslint:ci        # ESLint CI check (zero warnings)
```

## 🧪 Test Commands

```bash
pnpm test             # Run all tests
pnpm test:ui          # Vitest UI + coverage
pnpm test:coverage    # Generate coverage report
```

### Test File Formats

- **Unit tests**: `*.{test,spec}.ts`
- **Nuxt tests**: `*.nuxt.{test,spec}.ts`

## 🛠️ System Utilities (macOS)

### File Operations

```bash
ls -la                # File list (detailed)
find . -name "*.ts"   # TypeScript file search
grep -r "pattern" .   # Text search
```

### Git Operations

```bash
git status            # Status check
git add .             # Staging
git commit -m "msg"   # Commit (Gitmoji conventions)
git log --oneline     # Commit history
```

### Process Management

```bash
ps aux | grep node    # Check Node processes
lsof -i :3000         # Check processes using port 3000
kill -9 <PID>         # Force terminate process
```

## 📦 Package Management

### Dependencies

```bash
pnpm install          # Install dependencies
pnpm add <package>    # Add package
pnpm remove <package> # Remove package
pnpm update           # Update dependencies
```

### Environment Management (Volta)

```bash
volta list            # List installed environments
volta install node@22.16.0 # Install specific Node.js version
```

## ⚙️ Project-Specific Operation Commands

### Development Workflow

```bash
# 1. Update type definitions
pnpm generate-types

# 2. Start development
pnpm dev

# 3. Code quality check
pnpm lint:fix

# 4. Run tests
pnpm test

# 5. Verify production build
pnpm build
```

### Error Handling Testing

```bash
# Error simulation (after starting development server)
curl "http://localhost:3000/api/health?simulate=error"
curl "http://localhost:3000/api/health?simulate=timeout"
```

## 🔧 Troubleshooting

### Cache Clear

```bash
rm -rf node_modules .nuxt
pnpm install
```

### Type Definition Refresh

```bash
pnpm generate-types
pnpm typecheck
```

### Port Conflict Resolution

```bash
lsof -i :3000
kill -9 <PID>
pnpm dev
```

## 📊 Performance & Debug

### Coverage Report

```bash
pnpm test:coverage
# Output: ../logs/coverage/
```

### DevTools Usage

- **Nuxt DevTools**: Auto-start (during development)
- **TanStack Query DevTools**: Browser extension or install
- **Pinia DevTools**: Use within Vue DevTools

## 📝 Documentation Management

### Auto-generated

- OpenAPI specification: `public/openapi.yaml` (auto-generated)
- Type definitions: `shared/types/api/` (auto-generated)

### Manual Maintenance

- `docs/`: Detailed documentation
- `README.md`: Project overview

## 🚨 Task Completion Checklist

1. `pnpm lint:fix` - Code quality check with auto-fix
2. `pnpm test` - Test pass verification
3. `pnpm build` - Build success verification
4. Git commit (when necessary)

### Additional Checks for Error Handling Fixes

1. JSDoc appropriateness verification
2. Error code system compliance verification
3. OpenAPI specification synchronization verification
4. Test execution in Swagger
