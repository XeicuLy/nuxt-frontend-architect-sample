# Task Completion Checklist

When completing any development task, always run these commands to ensure code quality:

## Required Quality Checks

### 1. Linting and Formatting

```bash
pnpm lint                      # Run all quality checks
# OR run individually:
pnpm eslint                    # Check JavaScript/TypeScript/Vue linting
pnpm biome                     # Check Biome rules
pnpm prettier                  # Check code formatting
```

### 2. Type Checking

```bash
pnpm typecheck                 # Verify TypeScript types
```

### 3. Auto-fix Issues (if needed)

```bash
pnpm lint:fix                  # Fix all auto-fixable issues
# OR fix individually:
pnpm eslint:fix               # Fix ESLint issues
pnpm biome:fix                # Fix Biome issues
pnpm prettier:fix             # Fix formatting
```

### 4. API Type Generation (if API changes made)

```bash
pnpm generate-types           # Regenerate API types from OpenAPI spec
```

### 5. Build Verification (for major changes)

```bash
pnpm build                    # Ensure the project builds successfully
```

## Pre-commit Requirements

- All linting must pass (`pnpm lint`)
- TypeScript must compile without errors (`pnpm typecheck`)
- Code must be properly formatted (Prettier + Biome)
- Build must succeed for production changes

## Development Server

Always test changes with:

```bash
pnpm dev                      # Start development server
```

Visit:

- http://localhost:3000 - Main application
- http://localhost:3000/api/swagger - API documentation

## Key Quality Standards

- **No ESLint errors or warnings**
- **No TypeScript errors**
- **Consistent formatting** (Prettier + Biome)
- **Accessibility compliance** (Vue a11y plugin)
- **TailwindCSS best practices** (TailwindCSS plugin)
