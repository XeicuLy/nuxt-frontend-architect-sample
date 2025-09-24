#!/bin/bash

# Dev Container Setup Script
# このスクリプトはDev Container起動時に実行され、開発環境を最適化します

set -e

echo "🐳 Dev Container Setup Script Starting..."

# Node.js and pnpm version check
echo "📦 Checking Node.js and pnpm versions..."
node_version=$(node --version)
pnpm_version=$(pnpm --version)

echo "✅ Node.js: $node_version"
echo "✅ pnpm: $pnpm_version"

# Expected versions
expected_node="v22.16.0"
expected_pnpm="10.15.1"

if [ "$node_version" != "$expected_node" ]; then
    echo "⚠️  Warning: Expected Node.js $expected_node, but got $node_version"
fi

if [ "$pnpm_version" != "$expected_pnpm" ]; then
    echo "⚠️  Warning: Expected pnpm $expected_pnpm, but got $pnpm_version"
fi

# Set up git configuration for the container
echo "🔧 Setting up Git configuration..."
git config --global --add safe.directory /workspaces/nuxt-frontend-architect-sample || true

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
else
    echo "✅ Dependencies already installed"
fi

# Generate types if needed
if [ ! -d "shared/types/api" ] || [ ! -f "shared/types/api/index.ts" ]; then
    echo "🔧 Generating API types..."
    pnpm generate-types
else
    echo "✅ API types already generated"
fi

# Set up development environment
echo "🛠️  Setting up development environment..."

# Create logs directory if it doesn't exist
mkdir -p logs

# Display helpful information
echo ""
echo "🎉 Dev Container setup completed!"
echo ""
echo "📚 Quick Start Commands:"
echo "  pnpm dev              # Start development server"
echo "  pnpm test             # Run tests"
echo "  pnpm lint:fix         # Fix linting issues"
echo "  pnpm build            # Build for production"
echo ""
echo "🌐 Access URLs (after running 'pnpm dev'):"
echo "  App:              http://localhost:3000"
echo "  API Docs:         http://localhost:3000/api/swagger"
echo "  OpenAPI Spec:     http://localhost:3000/api/openapi.yaml"
echo "  Health Check:     http://localhost:3000/api/health"
echo ""
echo "🚀 Ready for development!"
