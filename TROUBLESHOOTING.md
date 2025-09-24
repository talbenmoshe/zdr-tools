# Troubleshooting

This guide helps resolve common issues when working with ZDR Tools.

## Common Issues

### Mock function errors in tests

**Error:**
```bash
Error: Mock creator not configured
```

**Solution:** Import the appropriate setup package:
```typescript
// For Jest
import '@zdr-tools/zdr-jest-setup';

// For Vitest
import '@zdr-tools/zdr-vitest-setup';
```

### Package name mismatch warnings

Some packages may be published under different names than their folder names. Refer to each package's `package.json` for the correct import name.

### TypeScript compilation errors

Ensure you're using TypeScript ~5.8.3 and have the correct tsconfig settings. Each package includes proper type definitions.

### Development server startup issues

Use the monorepo tool for complex dependency management:
```bash
npx @zdr-tools/zdr-monorepo start -e "your-package"
```

## Getting Help

- Check individual package READMEs for specific guidance
- Review the example patterns in each package's documentation
- Ensure all peer dependencies are installed correctly

## Reporting Issues

If you encounter a bug or have a feature request, please create an issue in the repository with:
- A clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Environment information (Node.js version, package versions, etc.)