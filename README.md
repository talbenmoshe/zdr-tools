# ZDR Tools

ZDR Tools is a comprehensive TypeScript framework for reactive data modeling and entity management. It provides a robust foundation for building applications with reactive entities, event-driven architectures, and type-safe data handling.

## Key Features

- 🔄 **Reactive Properties**: Automatic property change tracking and event emission
- 📦 **Entity Collections**: Manage groups of entities with ordering and filtering
- 🎯 **Event System**: Comprehensive event broker architecture for decoupled communication
- ✅ **Built-in Validation**: Property-level validation with customizable validators
- 🧪 **Testing Support**: Complete mock and fake implementations for all interfaces
- ⚛️ **React Integration**: Custom hooks for seamless React integration
- 🌐 **Web Utilities**: URL parsing, cookies, and browser-specific tools
- 📱 **Cross-Platform**: Framework-agnostic core with platform-specific extensions

## Development Environment Setup

### Prerequisites

- **Node.js** (version 18 or higher)
- **pnpm** (version 10.11.0 or higher)

### Installation

1. Clone the repository:
```bash
git clone git@github.com:talbenmoshe/zdr-tools.git
cd zdr-tools
```

2. Install dependencies:
```bash
pnpm install
```

3. Build all packages:
```bash
pnpm build
```

### Development Commands

```bash
# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## Package Overview

This monorepo contains the following packages organized by functionality:

### Core Framework Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| [`zdr-interfaces`](./packages/zdr-interfaces/README.md) | Core TypeScript interfaces and types for the entire framework | [📖 Docs](./packages/zdr-interfaces/README.md) |
| [`zdr-native-tools`](./packages/zdr-native-tools/README.md) | Framework-agnostic utilities (ID generation, array tools, event emitters) | [📖 Docs](./packages/zdr-native-tools/README.md) |
| [`zdr-entities`](./packages/zdr-entities/README.md) | Entity framework implementation with reactive properties and collections | [📖 Docs](./packages/zdr-entities/README.md) |

### Platform-Specific Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| [`zdr-web-tools`](./packages/zdr-web-tools/README.md) | Web-specific utilities (URL parsing, cookies, intersection observers) | [📖 Docs](./packages/zdr-web-tools/README.md) |
| [`zdr-react`](./packages/zdr-react/README.md) | React hooks and components for seamless integration | [📖 Docs](./packages/zdr-react/README.md) |

### Testing Infrastructure

| Package | Description | Documentation |
|---------|-------------|---------------|
| [`zdr-testing-tools`](./packages/zdr-testing-tools/README.md) | Base testing utilities and shared testing infrastructure | [📖 Docs](./packages/zdr-testing-tools/README.md) |
| [`zdr-jest-setup`](./packages/zdr-jest-setup/README.md) | Jest-specific setup and configuration for ZDR projects | [📖 Docs](./packages/zdr-jest-setup/README.md) |
| [`zdr-vitest-setup`](./packages/zdr-vitest-setup/README.md) | Vitest-specific setup and configuration for ZDR projects | [📖 Docs](./packages/zdr-vitest-setup/README.md) |

### Development Tools

| Package | Description | Documentation |
|---------|-------------|---------------|
| [`eslint-config-zdr`](./packages/eslint-config-zdr/README.md) | Shared ESLint configuration for consistent code style | [📖 Docs](./packages/eslint-config-zdr/README.md) |
| [`zdr-monorepo`](./packages/zdr-monorepo/README.md) | Monorepo management utilities and scripts | [📖 Docs](./packages/zdr-monorepo/README.md) |

## Quick Start Example

Here's a simple example of creating a reactive entity with ZDR:

```typescript
import { Entity, type IReadablePropEventBroker, type IPropEventBroker } from '@zdr-tools/zdr-entities';

class Person extends Entity {
    name: IReadablePropEventBroker<string>;
    age: IPropEventBroker<number>;

    constructor(id: string, name: string, age: number) {
        super(id);

        this.name = this.createPropEventBroker('name', name);
        this.age = this.createPropEventBroker('age', age);
    }

    applyBirthday() {
        this.age.set(this.age.get() + 1);
    }

    getEntityName(): string {
        return 'Person';
    }
}

const john = new Person('75c1b011-5a77-51e9-8737-d6dcba60e3bd', 'John', 30);
john.name.get() === 'John'; // true
john.age.get() === 30; // true
const unregister = john.age.register((eventData) => {
    eventData.value === 31; // true
});
john.applyBirthday();
unregister();
```

## Architecture

The ZDR framework follows a layered architecture:

```
┌─────────────────────────────────────────┐
│           Platform Layer                │
│     (zdr-react, zdr-web-tools)          │
├─────────────────────────────────────────┤
│           Entity Layer                  │
│          (zdr-entities)                 │
├─────────────────────────────────────────┤
│           Utilities Layer               │
│        (zdr-native-tools)               │
├─────────────────────────────────────────┤
│           Interfaces Layer              │
│         (zdr-interfaces)                │
└─────────────────────────────────────────┘
```


## License

ISC License - see individual package.json files for details.