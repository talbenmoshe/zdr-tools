# @zdr-tools/typescript-config-common

Shared TypeScript configuration for all ZDR Tools packages.

## Usage

In your package's `tsconfig.json`:


```json
{
  "extends": "@zdr-tools/typescript-config-common/tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

## Configuration

The base configuration includes:

- **Target**: ESNext
- **Module**: ESNext with Bundler resolution
- **Strict mode**: Enabled
- **JSX**: react-jsx
- **Source maps**: Enabled
- **Declaration files**: Enabled with source maps
