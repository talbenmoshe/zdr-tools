# @zdr-tools/eslint-config-zdr

Shared ESLint configuration for consistent code style across ZDR projects.

## Overview

This package provides a comprehensive ESLint configuration tailored for ZDR projects, supporting TypeScript, React, and modern JavaScript development. It includes rules for code style, accessibility, React patterns, and testing with both Jest and Vitest. The configuration emphasizes consistent formatting, proper React usage, and accessibility best practices.

## Installation

```bash
npm install @zdr-tools/eslint-config-zdr
```

## Usage

Add to your ESLint configuration:

```javascript
// eslint.config.js
import zdrConfig from '@zdr-tools/eslint-config-zdr';

export default zdrConfig;
```

Or extend in legacy format:

```javascript
// .eslintrc.js
module.exports = {
  extends: ['@zdr-tools/eslint-config-zdr']
};
```

## Configuration Features

### File Support
- **TypeScript**: `.ts`, `.tsx` files
- **JavaScript**: `.js` files
- **React**: JSX and TSX support
- **Ignores**: `dist/**/*` build output

### Language Options
- **ECMAScript**: 2022 features
- **Modules**: ES modules
- **Parser**: TypeScript parser
- **Globals**: Browser, Node.js, Vitest, and Jest

### Plugin Integration

#### React
- Component naming conventions
- JSX formatting and structure
- Props and state best practices
- Self-closing component enforcement

#### Accessibility (jsx-a11y)
- ARIA attributes validation
- Semantic HTML enforcement
- Keyboard navigation support
- Screen reader compatibility

#### React Hooks
- Rules of hooks enforcement
- Dependency array validation (configured as warning)

#### TypeScript
- Type annotation spacing
- Unused variable detection
- TypeScript-specific linting

#### Testing (Vitest/Jest)
- Test file patterns
- Testing best practices
- Framework-specific globals

### Code Style Rules

#### Formatting
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Object curly spacing: `{ key: value }`
- Arrow function parentheses: as needed

#### Structural
- Consistent object/array formatting
- Proper spacing around operators
- Block statement braces required
- Consistent line breaks

#### Code Quality
- No unused variables (with underscore prefix exception)
- Prefer const over let
- No console.log (warn/error allowed)
- Equality operators: strict (===)

## Example Configuration

```typescript
// Your TypeScript/React component will be formatted like this:
import React, { useState, useCallback } from 'react';
import { User } from '../types';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEdit = useCallback(() => {
    onEdit(user);
  }, [user, onEdit]);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>

      {isExpanded && (
        <div className="user-details">
          <p>Email: {user.email}</p>
          <button onClick={handleEdit}>
            Edit User
          </button>
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
    </div>
  );
}
```

## Supported File Patterns

This configuration automatically applies appropriate rules to:
- **Test files**: `**/*.test.{js,ts,tsx}`, `**/*.spec.{js,ts,tsx}`
- **Test directories**: `**/test/**/*`, `**/__tests__/**/*`, `**/tests/**/*`
- **Fake implementations**: `**/fakes/**/*`
- **Config files**: Various build and test configuration files

## Accessibility Features

The configuration includes comprehensive accessibility rules:
- ARIA attribute validation
- Heading structure requirements
- Image alt text guidelines (customizable)
- Keyboard navigation support
- Role and property validation

## Integration with ZDR

This ESLint configuration is specifically tailored for ZDR projects:
- **Recognizes** ZDR fake implementations pattern
- **Supports** ZDR testing infrastructure
- **Enforces** consistent code style across ZDR packages
- **Integrates** with both Jest and Vitest testing frameworks

## Customization

To customize rules for your project:

```javascript
// eslint.config.js
import zdrConfig from '@zdr-tools/eslint-config-zdr';

export default [
  ...zdrConfig,
  {
    rules: {
      // Override specific rules
      'no-console': 'off',
      'react-hooks/exhaustive-deps': 'error'
    }
  }
];
```