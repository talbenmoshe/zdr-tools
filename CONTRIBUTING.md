# Contributing

Thank you for your interest in contributing to ZDR Tools! We welcome contributions from the community.

## How to Contribute

1. Follow the existing code style and conventions
2. Write tests for new functionality
3. Update documentation when adding new features
4. Run `pnpm lint` and `pnpm test` before submitting changes

## Development Setup

Please refer to the [Development Environment Setup](./README.md#development-environment-setup) section in the README for instructions on setting up your development environment.

## Pull Request Process

1. Fork the repository
2. Create a feature branch from `master`
3. Make your changes following the guidelines above
4. Submit a pull request with a clear description of your changes

## Code Style

This project uses ESLint for code style enforcement. Run `pnpm lint` to check your code and `pnpm lint:fix` to automatically fix many issues.

## Testing

All packages should have comprehensive test coverage. Use the appropriate testing setup for your package:
- For Jest: `@zdr-tools/zdr-jest-setup`
- For Vitest: `@zdr-tools/zdr-vitest-setup`