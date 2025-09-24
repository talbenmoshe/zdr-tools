# @zdr-tools/zdr-monorepo

Monorepo management utilities and dependency-aware development server orchestration.

## Overview

This package provides intelligent dependency management for monorepo development, enabling parallel development servers that start dependencies in the correct order. It analyzes package.json dependencies, creates a dependency graph, and starts development servers in topological order to ensure all dependencies are available when needed.

## Installation

```bash
npm install @zdr-tools/zdr-monorepo
```

## CLI Usage

### Start Command

Starts development servers for specified packages and their dependencies in correct order.

```bash
npx zdr-monorepo start -e "package1 package2" -t 10000
```

**Options**:
- `-e, --entries <entries>` (required): Entry point packages to start
- `-t, --timeout <timeout>` (optional): Wait timeout in milliseconds (default: 10000)

## How It Works

1. **Dependency Analysis**: Scans all packages in the monorepo using `pnpm list`
2. **Graph Creation**: Builds a dependency graph based on package.json dependencies
3. **Topological Ordering**: Determines correct startup order using dependency resolution
4. **Parallel Execution**: Starts packages in parallel within each dependency level
5. **File Watching**: Waits for build outputs before proceeding to dependent packages

## Features

### Intelligent Dependency Resolution
- Analyzes both `dependencies` and `devDependencies`
- Creates topological ordering of packages
- Handles complex dependency graphs with multiple entry points

### Parallel Development
- Starts independent packages simultaneously
- Waits for dependencies before starting dependents
- Manages development server lifecycle

### Build Output Management
- Cleans previous build outputs
- Waits for `dist/index.js` files to be ready
- Provides colored console output for monitoring

## Example Usage

### Basic Development Setup

```bash
# Start a single package with dependencies
npx zdr-monorepo start -e "@my-org/app"

# Start multiple packages
npx zdr-monorepo start -e "@my-org/web @my-org/mobile"

# Custom timeout for slow builds
npx zdr-monorepo start -e "@my-org/app" -t 30000
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "zdr-monorepo start -e '@my-org/app'",
    "dev:all": "zdr-monorepo start -e '@my-org/web @my-org/mobile @my-org/api'",
    "dev:web": "zdr-monorepo start -e '@my-org/web' -t 15000"
  }
}
```

## Dependency Graph Example

Given this package structure:
```
@my-org/app → @my-org/ui-components → @my-org/design-tokens
@my-org/app → @my-org/api-client → @my-org/shared-types
@my-org/mobile → @my-org/ui-components
```

Running `start -e "@my-org/app"` will:
1. **Level 1**: Start `@my-org/design-tokens` and `@my-org/shared-types`
2. **Level 2**: Start `@my-org/ui-components` and `@my-org/api-client`
3. **Level 3**: Start `@my-org/app`

## Console Output

The tool provides detailed console output:

```bash
Starting @my-org/app with dependencies

Handling sequence: ["@my-org/design-tokens", "@my-org/shared-types"]
Deleted File: packages/design-tokens/dist/index.js
Deleted File: packages/shared-types/dist/index.js
All files are ready: ["@my-org/design-tokens", "@my-org/shared-types"]

Handling sequence: ["@my-org/ui-components", "@my-org/api-client"]
All files are ready: ["@my-org/ui-components", "@my-org/api-client"]

Handling sequence: ["@my-org/app"]
All files are ready: ["@my-org/app"]
```

## Requirements

### Package Structure
- Packages must have `pnpm start` script
- Build outputs expected at `dist/index.js`
- Standard package.json with dependencies

### Environment
- **pnpm**: For workspace management and package listing
- **Node.js**: For CLI execution

## API

### start(options)

Programmatic API for starting development servers.

**Parameters**:
- `options.entries`: Space-separated string of package names
- `options.timeout`: Timeout string (e.g., "10000")

```typescript
import { start } from '@zdr-tools/zdr-monorepo';

await start({
  entries: '@my-org/app @my-org/mobile',
  timeout: '15000'
});
```

## Integration with ZDR

This package supports ZDR monorepo development:
- **Manages** ZDR package dependencies automatically
- **Starts** development servers in correct order
- **Handles** complex ZDR package interdependencies
- **Supports** hot reloading and development workflows

## Configuration

### Package Scripts

Each package should have a `start` script:

```json
{
  "scripts": {
    "start": "tsc -w --incremental",
    "build": "rm -rf dist && tsc && tsc-esm-fix dist"
  }
}
```

### Development Workflow

1. Run `zdr-monorepo start -e "entry-package"`
2. Tool analyzes dependencies and starts packages in order
3. Development servers run with hot reloading
4. Build outputs trigger dependent package updates

This tool enables efficient development across complex monorepos by ensuring dependencies are always available and up-to-date.