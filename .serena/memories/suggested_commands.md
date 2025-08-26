# Suggested Commands

## Development Commands

### Package Management

```bash
pnpm install                    # Install dependencies
```

### Development Server

```bash
pnpm dev                       # Start development server on http://localhost:3000
```

### Build Commands

```bash
pnpm build                     # Build for production
pnpm preview                   # Preview production build locally
pnpm generate                  # Generate static site
```

### Code Quality Commands

```bash
pnpm lint                      # Run all linting (ESLint + Biome + Prettier + TypeCheck)
pnpm lint:fix                  # Fix all linting issues automatically

pnpm eslint                    # Run ESLint only
pnpm eslint:fix               # Fix ESLint issues

pnpm biome                     # Run Biome checker only
pnpm biome:fix                # Fix Biome issues
pnpm biome:ci                 # Run Biome in CI mode

pnpm prettier                  # Check Prettier formatting
pnpm prettier:fix             # Fix Prettier issues
pnpm prettier:ci              # Check Prettier in CI mode

pnpm typecheck                # Run TypeScript type checking
```

### API Type Generation

```bash
pnpm generate-types           # Generate TypeScript types from OpenAPI spec
                              # (runs openapi-ts + biome:fix)
```

## Important URLs

- Development server: http://localhost:3000
- API documentation: http://localhost:3000/api/swagger
- OpenAPI spec: http://localhost:3000/api/openapi.json

## System Commands (macOS)

- `ls` - List directory contents
- `cd` - Change directory
- `grep` - Search text patterns
- `find` - Find files and directories
- `git` - Version control

## Package Manager

This project uses **pnpm** as the package manager. All commands should use `pnpm` instead of `npm` or `yarn`.
