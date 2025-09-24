# @zdr-tools/zdr-native-tools

Framework-agnostic utility functions and classes for common operations including array manipulation, color processing, ID generation, timing, and enhanced event handling.

## Overview

This package provides a comprehensive collection of utility functions that work across different JavaScript environments. It includes tools for array operations, color calculations and conversions, random value generation, timing utilities, and an enhanced EventEmitter implementation. These utilities form the foundation for higher-level ZDR packages and can be used independently in any TypeScript/JavaScript project.

## Installation

```bash
npm install @zdr-tools/zdr-native-tools
```

## Table of Contents

- [ID Generation](#id-generation)
- [Timing Utilities](#timing-utilities)
- [Array Tools](#array-tools)
- [Color Utilities](#color-utilities)
- [Random Value Generation](#random-value-generation)
- [Event Handling](#event-handling)
- [Constants](#constants)

## Utilities

### ID Generation

#### createSafeRandomId

Generates cryptographically secure random IDs using nanoid.

**Purpose**: Creates unique, URL-safe identifiers for entities, sessions, or any scenario requiring secure random strings.

**API**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `length` | `number?` | `21` | Length of generated ID |

**Returns**: `string` - A secure random ID

**Usage Example**:

```typescript
import { createSafeRandomId } from '@zdr-tools/zdr-native-tools';

// Generate default length ID (21 characters)
const entityId = createSafeRandomId();
console.log(entityId); // "V1StGXR8_Z5jdHi6B-myT"

// Generate custom length ID
const shortId = createSafeRandomId(8);
console.log(shortId); // "V1StGXR8"

// Generate longer ID for high-security scenarios
const longId = createSafeRandomId(32);
console.log(longId); // "V1StGXR8_Z5jdHi6B-myTVKahvjDXk"
```

### Timing Utilities

#### getCurrentTimestamp

Gets the current Unix timestamp in milliseconds.

**Purpose**: Provides a consistent way to get current time for timestamping, performance measurement, and time-based operations.

**Returns**: `number` - Current timestamp in milliseconds

**Usage Example**:

```typescript
import { getCurrentTimestamp } from '@zdr-tools/zdr-native-tools';

const startTime = getCurrentTimestamp();
// ... some operations
const endTime = getCurrentTimestamp();
const duration = endTime - startTime;

console.log(`Operation took ${duration}ms`);

// Timestamping entities
const entity = {
  id: createSafeRandomId(),
  createdAt: getCurrentTimestamp(),
  data: 'some data'
};
```

#### wait

Creates a Promise that resolves after a specified interval.

**Purpose**: Provides async/await compatible delays for testing, animations, or throttling operations.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `interval` | `number` | Delay in milliseconds |

**Returns**: `Promise<void>` - Promise that resolves after the interval

**Usage Example**:

```typescript
import { wait } from '@zdr-tools/zdr-native-tools';

// Simple delay
async function delayedOperation() {
  console.log('Starting operation...');
  await wait(1000); // Wait 1 second
  console.log('Operation completed after delay');
}

// Throttling API calls
async function processItems(items: string[]) {
  for (const item of items) {
    await processItem(item);
    await wait(100); // Wait 100ms between items
  }
}

// Testing with delays
async function testSequence() {
  await triggerAction();
  await wait(500); // Wait for DOM updates
  expect(document.querySelector('.result')).toBeVisible();
}
```

### Array Tools

#### EMPTY_ARRAY

A frozen empty array constant to avoid creating new arrays.

**Purpose**: Provides a reusable empty array reference that prevents unnecessary allocations and mutations.

**Type**: `readonly any[]`

**Usage Example**:

```typescript
import { EMPTY_ARRAY } from '@zdr-tools/zdr-native-tools';

// Use as default value
function getItems(items?: any[]): any[] {
  return items || EMPTY_ARRAY;
}

// Safe to return without fear of mutation
function getEmptyResult(): readonly any[] {
  return EMPTY_ARRAY; // Always returns the same frozen instance
}
```

#### move

Moves an array item from one position to another without mutating the original array.

**Purpose**: Enables reordering of array elements while maintaining immutability principles.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `array` | `any[]` | Source array to move item in |
| `moveIndex` | `number` | Index of item to move |
| `toIndex` | `number` | Target index to move item to |

**Returns**: `any[]` - New array with item moved

**Usage Example**:

```typescript
import { move } from '@zdr-tools/zdr-native-tools';

const originalArray = ['a', 'b', 'c', 'd', 'e'];

// Move item from index 1 to index 3
const reordered = move(originalArray, 1, 3);
console.log(reordered); // ['a', 'c', 'd', 'b', 'e']
console.log(originalArray); // ['a', 'b', 'c', 'd', 'e'] - unchanged

// Move item to beginning
const moveToStart = move(originalArray, 3, 0);
console.log(moveToStart); // ['d', 'a', 'b', 'c', 'e']

// Use with entity collections
const users = [user1, user2, user3, user4];
const reorderedUsers = move(users, 0, 2); // Move first user to third position
```

#### insertAt

Inserts one or more items into an array at a specific index without mutating the original.

**Purpose**: Enables insertion of elements at precise positions while maintaining immutability.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `array` | `any[]` | Source array to insert into |
| `startIndex` | `number` | Index at which to insert items |
| `...itemsToInsert` | `any[]` | Items to insert |

**Returns**: `any[]` - New array with items inserted

**Usage Example**:

```typescript
import { insertAt } from '@zdr-tools/zdr-native-tools';

const numbers = [1, 2, 5, 6];

// Insert single item
const withThree = insertAt(numbers, 2, 3);
console.log(withThree); // [1, 2, 3, 5, 6]

// Insert multiple items
const withMultiple = insertAt(numbers, 2, 3, 4);
console.log(withMultiple); // [1, 2, 3, 4, 5, 6]

// Insert at beginning
const withZero = insertAt(numbers, 0, 0);
console.log(withZero); // [0, 1, 2, 5, 6]

// Insert at end
const withSeven = insertAt(numbers, numbers.length, 7);
console.log(withSeven); // [1, 2, 5, 6, 7]
```

#### removeItem

Removes the first occurrence of an item from an array (mutates the original array).

**Purpose**: Provides a simple way to remove items by value rather than index.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `array` | `any[]` | Array to remove item from |
| `item` | `any` | Item to remove |

**Returns**: `any[]` - The modified array (same reference)

**Usage Example**:

```typescript
import { removeItem } from '@zdr-tools/zdr-native-tools';

const fruits = ['apple', 'banana', 'orange', 'banana'];

// Remove first occurrence
removeItem(fruits, 'banana');
console.log(fruits); // ['apple', 'orange', 'banana']

// Remove non-existent item (no effect)
removeItem(fruits, 'grape');
console.log(fruits); // ['apple', 'orange', 'banana'] - unchanged

// Use with object arrays
const users = [user1, user2, user3];
removeItem(users, user2); // Removes user2 from array
```

### Color Utilities

#### isValidStrictHexColor

Validates if a string is a valid 6-character hex color.

**Purpose**: Ensures color strings match the strict hex format (#RRGGBB) for consistent color handling.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | `string` | Color string to validate |

**Returns**: `boolean` - True if valid hex color

**Usage Example**:

```typescript
import { isValidStrictHexColor } from '@zdr-tools/zdr-native-tools';

console.log(isValidStrictHexColor('#FF0000')); // true
console.log(isValidStrictHexColor('#ff0000')); // true (case insensitive)
console.log(isValidStrictHexColor('#F00')); // false (too short)
console.log(isValidStrictHexColor('FF0000')); // false (missing #)
console.log(isValidStrictHexColor('#GG0000')); // false (invalid characters)

// Use in validation
function setThemeColor(color: string) {
  if (!isValidStrictHexColor(color)) {
    throw new Error('Invalid hex color format');
  }
  // Apply color...
}
```

#### getColorBrightness

Calculates the brightness of a hex color using standard luminance formula.

**Purpose**: Determines the perceived brightness of colors for accessibility and UI decisions.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `hexCode` | `string` | Hex color code (with or without #) |

**Returns**: `number` - Brightness value (0-255, higher = brighter)

**Usage Example**:

```typescript
import { getColorBrightness } from '@zdr-tools/zdr-native-tools';

const redBrightness = getColorBrightness('#FF0000');
console.log(redBrightness); // ~76.245

const whiteBrightness = getColorBrightness('#FFFFFF');
console.log(whiteBrightness); // 255

const blackBrightness = getColorBrightness('#000000');
console.log(blackBrightness); // 0

// Use for accessibility decisions
function getContrastColor(backgroundColor: string): string {
  const brightness = getColorBrightness(backgroundColor);
  return brightness > 128 ? '#000000' : '#FFFFFF';
}
```

#### isDarkColor

Determines if a color is considered dark (brightness < 128).

**Purpose**: Simplifies dark/light color classification for UI theming and accessibility.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `hexColor` | `string` | Hex color code |

**Returns**: `boolean` - True if color is dark

**Usage Example**:

```typescript
import { isDarkColor } from '@zdr-tools/zdr-native-tools';

console.log(isDarkColor('#000000')); // true
console.log(isDarkColor('#FFFFFF')); // false
console.log(isDarkColor('#FF0000')); // true (red is dark)
console.log(isDarkColor('#FFFF00')); // false (yellow is bright)

// Use for automatic text color selection
function getTextColor(backgroundColor: string): string {
  return isDarkColor(backgroundColor) ? 'white' : 'black';
}

// Use for theme detection
function classifyTheme(primaryColor: string): 'dark' | 'light' {
  return isDarkColor(primaryColor) ? 'dark' : 'light';
}
```

#### fromHSLtoHex

Converts HSL color values to hex color string.

**Purpose**: Enables color space conversion from HSL (Hue, Saturation, Lightness) to hex format.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `hsl` | `HSL` | HSL color object |

**Types**:
- `HSL`: `{ h: number, s: number, l: number }`
  - `h`: Hue (0-360)
  - `s`: Saturation (0-100)
  - `l`: Lightness (0-100)

**Returns**: `string` - Hex color string with # prefix

**Usage Example**:

```typescript
import { fromHSLtoHex, HSL } from '@zdr-tools/zdr-native-tools';

// Convert pure red
const red: HSL = { h: 0, s: 100, l: 50 };
const redHex = fromHSLtoHex(red);
console.log(redHex); // '#FF0000'

// Convert pure blue
const blue: HSL = { h: 240, s: 100, l: 50 };
const blueHex = fromHSLtoHex(blue);
console.log(blueHex); // '#0000FF'

// Create color variations
function createColorShades(baseHue: number): string[] {
  const shades = [];
  for (let lightness = 20; lightness <= 80; lightness += 20) {
    const hsl: HSL = { h: baseHue, s: 70, l: lightness };
    shades.push(fromHSLtoHex(hsl));
  }
  return shades;
}

const greenShades = createColorShades(120); // Various green shades
```

### Random Value Generation

#### aRandomIntegerWithRange

Generates a random integer within a specified range (inclusive).

**Purpose**: Provides controlled random number generation for testing, simulations, and random selections.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `min` | `number` | Minimum value (inclusive) |
| `max` | `number` | Maximum value (inclusive) |

**Returns**: `number` - Random integer between min and max

**Usage Example**:

```typescript
import { aRandomIntegerWithRange } from '@zdr-tools/zdr-native-tools';

// Dice roll
const diceRoll = aRandomIntegerWithRange(1, 6);
console.log(diceRoll); // 1, 2, 3, 4, 5, or 6

// Random age
const randomAge = aRandomIntegerWithRange(18, 65);

// Random array index
const array = ['a', 'b', 'c', 'd', 'e'];
const randomIndex = aRandomIntegerWithRange(0, array.length - 1);
const randomItem = array[randomIndex];
```

#### aRandomString

Generates a random string using base-36 encoding.

**Purpose**: Creates random strings for testing, temporary identifiers, or placeholder content.

**Returns**: `string` - Random string

**Usage Example**:

```typescript
import { aRandomString } from '@zdr-tools/zdr-native-tools';

const tempId = aRandomString();
console.log(tempId); // "0.8394739472"

// Use for test data
const testUser = {
  id: aRandomString(),
  name: `User ${aRandomString()}`,
  email: `${aRandomString()}@example.com`
};
```

#### aRandomStringWithLength

Generates a string of specified length filled with '1' characters.

**Purpose**: Creates predictable-length strings for testing layouts, validation, or placeholder content.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `length` | `number` | Desired string length |

**Returns**: `string` - String of '1' characters

**Usage Example**:

```typescript
import { aRandomStringWithLength } from '@zdr-tools/zdr-native-tools';

const shortString = aRandomStringWithLength(5);
console.log(shortString); // "11111"

const longString = aRandomStringWithLength(50);
console.log(longString); // "11111111111111111111111111111111111111111111111111"

// Test input field max lengths
function testMaxLength(maxLength: number) {
  const testValue = aRandomStringWithLength(maxLength + 1);
  inputField.value = testValue;
  // Verify truncation behavior
}
```

#### aRandomStrictHexColor

Generates a random valid 6-character hex color.

**Purpose**: Creates random colors for testing, themes, or placeholder graphics.

**Returns**: `string` - Random hex color (e.g., "#A1B2C3")

**Usage Example**:

```typescript
import { aRandomStrictHexColor } from '@zdr-tools/zdr-native-tools';

const randomColor = aRandomStrictHexColor();
console.log(randomColor); // "#A1B2C3"

// Generate random theme
function generateRandomTheme() {
  return {
    primary: aRandomStrictHexColor(),
    secondary: aRandomStrictHexColor(),
    accent: aRandomStrictHexColor()
  };
}

// Test color handling
function testColorComponents() {
  const colors = Array.from({ length: 10 }, () => aRandomStrictHexColor());
  colors.forEach(color => {
    expect(isValidStrictHexColor(color)).toBe(true);
  });
}
```

#### aRandomInteger

Generates a random integer between 0 and 99.

**Purpose**: Provides a simple random number for general testing and basic random selections.

**Returns**: `number` - Random integer (0-99)

**Usage Example**:

```typescript
import { aRandomInteger } from '@zdr-tools/zdr-native-tools';

const randomScore = aRandomInteger();
console.log(randomScore); // 0-99

// Generate test data
const testResults = Array.from({ length: 100 }, () => ({
  id: createSafeRandomId(),
  score: aRandomInteger(),
  passed: aRandomInteger() > 50
}));
```

#### aRandomBoolean

Generates a random boolean value.

**Purpose**: Provides random true/false values for testing, feature flags, or binary decisions.

**Returns**: `boolean` - Random true or false

**Usage Example**:

```typescript
import { aRandomBoolean } from '@zdr-tools/zdr-native-tools';

const coinFlip = aRandomBoolean();
console.log(coinFlip); // true or false

// Generate test user data
const testUser = {
  id: createSafeRandomId(),
  isActive: aRandomBoolean(),
  hasPermissions: aRandomBoolean(),
  notifications: aRandomBoolean()
};

// Random feature toggles for testing
const featureFlags = {
  newDesign: aRandomBoolean(),
  betaFeatures: aRandomBoolean(),
  analytics: aRandomBoolean()
};
```

#### aRandomGuid

Generates a random GUID/UUID string in standard format.

**Purpose**: Creates UUID-compatible identifiers for systems requiring GUID format.

**Returns**: `string` - Random GUID (e.g., "550e8400-e29b-41d4-a716-446655440000")

**Usage Example**:

```typescript
import { aRandomGuid } from '@zdr-tools/zdr-native-tools';

const sessionId = aRandomGuid();
console.log(sessionId); // "550e8400-e29b-41d4-a716-446655440000"

// Database records
const record = {
  id: aRandomGuid(),
  correlationId: aRandomGuid(),
  data: 'some data'
};

// Test data with GUID requirements
function createTestEntities(count: number) {
  return Array.from({ length: count }, () => ({
    guid: aRandomGuid(),
    name: `Entity ${aRandomInteger()}`
  }));
}
```

#### aRandomLanguageCode

Generates a random ISO language code from a predefined set.

**Purpose**: Provides random language codes for internationalization testing and multi-language scenarios.

**Returns**: `string` - Random language code (e.g., "en", "de", "fr")

**Available codes**: en, de, fr, es, it, pt, nl, pl, ru, ja, ko, zh, ar, tr, he

**Usage Example**:

```typescript
import { aRandomLanguageCode } from '@zdr-tools/zdr-native-tools';

const userLanguage = aRandomLanguageCode();
console.log(userLanguage); // "en", "de", "fr", etc.

// Test internationalization
function testI18n() {
  const languages = Array.from({ length: 5 }, () => aRandomLanguageCode());
  languages.forEach(lang => {
    const translations = loadTranslations(lang);
    expect(translations).toBeDefined();
  });
}

// Generate diverse test users
function createInternationalUsers(count: number) {
  return Array.from({ length: count }, () => ({
    id: createSafeRandomId(),
    preferredLanguage: aRandomLanguageCode(),
    name: `User ${aRandomInteger()}`
  }));
}
```

### Event Handling

#### AdvancedEventEmitter

Enhanced EventEmitter with error handling and improved reliability.

**Purpose**: Provides a more robust event emitter that catches and logs errors during event emission, preventing one failing listener from breaking others.

**Extends**: `EventEmitter` from eventemitter3

**API**: Same as EventEmitter with enhanced error handling in `emit` method

**Usage Example**:

```typescript
import { AdvancedEventEmitter } from '@zdr-tools/zdr-native-tools';

class UserService extends AdvancedEventEmitter {
  private users: User[] = [];

  addUser(user: User) {
    this.users.push(user);
    // Even if one listener throws an error, others will still receive the event
    this.emit('userAdded', user);
  }
}

const userService = new UserService();

// Listener that might throw an error
userService.on('userAdded', (user) => {
  throw new Error('This listener has a bug!');
});

// This listener will still receive events despite the error above
userService.on('userAdded', (user) => {
  console.log('User added successfully:', user.name);
});

// The service continues to work even with buggy listeners
userService.addUser({ id: '1', name: 'John' }); // Error logged but service continues
```

## Constants

### FULL_VALID_COLOR_REGEX

Regular expression pattern for validating 6-character hex colors.

**Pattern**: `/^#[a-f0-9]{6}$/i`

**Usage Example**:

```typescript
import { FULL_VALID_COLOR_REGEX } from '@zdr-tools/zdr-native-tools';

function validateHexColor(color: string): boolean {
  return FULL_VALID_COLOR_REGEX.test(color);
}

console.log(validateHexColor('#FF0000')); // true
console.log(validateHexColor('#ff0000')); // true (case insensitive)
console.log(validateHexColor('#F00')); // false
```

## Testing Support

This package provides a test export with additional utilities for testing scenarios:

```typescript
// Import test utilities
import { /* test utilities */ } from '@zdr-tools/zdr-native-tools/test';
```

## Framework Integration

This package serves as the utility foundation for the ZDR framework:

- **zdr-entities** uses these utilities for internal operations
- **zdr-react** leverages timing and array utilities
- **zdr-web-tools** extends color and utility functions
- All ZDR packages can safely import and use these cross-platform utilities

The utilities are designed to be framework-agnostic and can be used in any TypeScript/JavaScript project, not just within the ZDR ecosystem.