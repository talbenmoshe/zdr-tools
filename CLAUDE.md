# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a pnpm workspace monorepo containing TypeScript packages for a data modeling and reactive programming framework called "ZDR" (Zdr Data Repository). The packages are:

### Core Packages
- **`zdr-native-tools`**: Framework-agnostic utilities (ID generation, array tools, event emitters, etc.)
- **`zdr-entities`**: Entity framework implementation with reactive properties, collections, and core interfaces (contains all TypeScript interfaces and types)
- **`zdr-web-tools`**: Web-specific utilities
- **`zdr-react`**: React hooks and components for the framework

### Testing Packages
- **`zdr-testing-tools`**: Base testing utilities and shared mock implementations
- **`zdr-jest-setup`**: Jest-specific setup and configuration
- **`zdr-vitest-setup`**: Vitest-specific setup and configuration

### Configuration
- **`eslint-config-zdr`**: Shared ESLint configuration
- **`zdr-monorepo`**: Monorepo management utilities

## Key Architecture Concepts

### Entity System
The framework revolves around reactive entities that implement `IEntity`. Core concepts:
- **EntityBase**: Abstract base class for all entities with property change tracking
- **PropEventBroker**: Manages property-level events and validation
- **EntityCollection**: Collections of entities with reactive operations
- **Change Tracking**: Entities track property changes and can commit/restore state

### Event System
Built on EventEmitter pattern with:
- **IEventBroker**: Core event broker interface
- **AdvancedEventEmitter**: Enhanced event emitter with additional functionality
- **Property-level events**: Each property can have its own event broker

### Fake/Mock Testing Pattern
Testing utilities follow a consistent pattern:
- Each interface has a corresponding `Fake*` implementation (e.g., `FakeEntity`, `FakeEventBroker`)
- Fakes use builder pattern with `with*` methods for configuration
- Initial data interfaces contain return values for methods with non-void returns
- Methods are mocked with proper TypeScript generics using `vi.fn<Type>()` (Vitest) or `jest.fn<ReturnType, ParamsArray>()` (Jest)
- **Testing Package Organization**: All fake implementations are now consolidated in `zdr-entities/fakes/` with framework-specific setup packages (`zdr-jest-setup`, `zdr-vitest-setup`) providing test runner configuration

## Common Commands

### Building
```bash
# Build all packages
npm run build
# or
pnpm -r --sort run build

# Build single package
cd packages/[package-name]
pnpm build
```

### Testing
```bash
# Run all tests
npm run test
# or
pnpm -r --no-sort run test

# Run single package tests
cd packages/[package-name]
pnpm test           # Run once
pnpm test:watch     # Watch mode
```

### Linting
```bash
# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix

# Lint single package
cd packages/[package-name]
pnpm lint
pnpm lint:fix
```

### Development
```bash
# Start development mode (specific to package functionality)
cd packages/[package-name]
pnpm start
```

## Package Dependencies

### Dependency Flow
```
zdr-native-tools (utilities)
    ↓
zdr-entities (entity framework + interfaces) ← contains fakes/ and all core interfaces
    ↓
zdr-web-tools, zdr-react (platform-specific)

Testing Infrastructure:
zdr-testing-tools (base testing utilities)
    ↓
zdr-jest-setup, zdr-vitest-setup (test runner specific setups)
```

### Key External Dependencies
- **TypeScript**: Primary language with strict typing
- **eventemitter3**: Event emitter implementation
- **es-toolkit**: Utility functions
- **nanoid**: ID generation
- **vitest**: Testing framework for most packages
- **jest**: Testing framework for Jest-specific testing

## Working with Fake Implementations

When creating or modifying fake implementations for testing:

1. **Interface Structure**: Only include return values for non-void methods in `IFake*InitialData`
2. **Method Implementation**: Define methods in class body using `vi.fn<Type>()` or `jest.fn<ReturnType, ParamsArray>()`
3. **Builder Pattern**: Include `with*` methods for all configurable return values
4. **Event Brokers**: Initialize from initial data in constructor, not as class properties

Example pattern:
```typescript
export interface IFakeEntityInitialData {
  someReturnValue: SomeType;
  // No void method return values
  eventBroker: IEventBroker<EventType>;
}

export class FakeEntity {
  someMethod = vi.fn<() => SomeType>(() => this.initialData.someReturnValue);
  voidMethod = vi.fn<() => void>(); // No initial data reference
}
```

## TypeScript Configuration

All packages use:
- ES modules (`"type": "module"`)
- TypeScript ~5.8.3
- Strict type checking
- Build output to `dist/` with `tsc-esm-fix` for ESM compatibility

## Publishing

Packages are configured to publish to a private registry at `https://talbenmoshe.synology.me:10001/verdaccio/`.