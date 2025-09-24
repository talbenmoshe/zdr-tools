# @zdr-tools/zdr-native-web

Web-specific utilities for URL parsing, cookie management, and browser APIs with reactive capabilities.

> **Note**: This package is published as `@zdr-tools/zdr-native-web` but located in the `zdr-web-tools` folder.

## Overview

This package provides web-specific implementations and utilities that extend the ZDR framework for browser environments. It includes comprehensive URL parsing and manipulation tools, cookie management functions, and reactive intersection observer services. These utilities bridge the gap between the framework-agnostic ZDR core and browser-specific functionality, enabling web applications to leverage reactive patterns with native browser APIs.

## Installation

```bash
npm install @zdr-tools/zdr-native-web
```

## URL Manipulation

### UrlParser

Implementation of IUrlParser interface for parsing URL strings into manipulable objects.

**Purpose**: Provides URL string parsing capabilities using the robust URI.js library, converting strings into feature-rich URL objects.

**API**:

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `parse` | `url: string` | `IUrl` | Parses URL string to IUrl object |

**Usage Example**:

```typescript
import { UrlParser } from '@zdr-tools/zdr-native-web';

const parser = new UrlParser();

// Parse various URL formats
const url1 = parser.parse('https://example.com/api/users?page=1&limit=20#results');
const url2 = parser.parse('/relative/path?query=value');
const url3 = parser.parse('//example.com/protocol-relative');

console.log('Protocol:', url1.getProtocol()); // 'https'
console.log('Host:', url1.getHost()); // 'example.com'
console.log('Path:', url1.getPath()); // '/api/users'
```

### Url

Implementation of IUrl interface providing comprehensive URL manipulation capabilities.

**Purpose**: Offers a fluent API for URL construction, parsing, and modification using immutable operations.

**API**:

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `constructor` | `url: string` | - | Creates URL object from string |
| `getProtocol` | - | `string` | Gets protocol (http, https, etc.) |
| `getHost` | - | `string` | Gets full host (hostname:port) |
| `getPort` | - | `string` | Gets port number |
| `getPath` | - | `string` | Gets URL path |
| `getQuery` | - | `string` | Gets query string |
| `getHostName` | - | `string` | Gets hostname without port |
| `getPathSegments` | - | `string[]` | Gets path split into segments |
| `getHash` | - | `string` | Gets URL hash/fragment |
| `getSearchObject` | - | `Record<string, any>` | Gets query as object |
| `setSearch` | `searchObject: Record<string, any>` | `IUrl` | Sets query from object |
| `appendPath` | `path: string` | `IUrl` | Appends to URL path |
| `toUrlString` | - | `string` | Converts to URL string |
| `removeOrigin` | - | `IUrl` | Removes protocol and host |
| `setProtocol` | `protocol: string` | `IUrl` | Sets URL protocol |

**Usage Example**:

```typescript
import { Url } from '@zdr-tools/zdr-native-web';

// Create URL object
const baseUrl = new Url('https://api.example.com');

// Build API endpoint
const apiUrl = baseUrl
  .appendPath('v1')
  .appendPath('users')
  .setSearch({
    page: 1,
    limit: 20,
    sortBy: 'name',
    order: 'asc'
  });

console.log('Final URL:', apiUrl.toUrlString());
// 'https://api.example.com/v1/users?page=1&limit=20&sortBy=name&order=asc'

// Extract URL components
const url = new Url('https://shop.example.com:8080/products/electronics?category=laptops&brand=apple#reviews');

console.log('Protocol:', url.getProtocol()); // 'https'
console.log('Hostname:', url.getHostName()); // 'shop.example.com'
console.log('Port:', url.getPort()); // '8080'
console.log('Full host:', url.getHost()); // 'shop.example.com:8080'
console.log('Path:', url.getPath()); // '/products/electronics'
console.log('Path segments:', url.getPathSegments()); // ['products', 'electronics']
console.log('Query string:', url.getQuery()); // 'category=laptops&brand=apple'
console.log('Query object:', url.getSearchObject()); // { category: 'laptops', brand: 'apple' }
console.log('Hash:', url.getHash()); // 'reviews'

// Modify URLs immutably
const httpsUrl = url.setProtocol('http');
const noOriginUrl = url.removeOrigin(); // '/products/electronics?category=laptops&brand=apple#reviews'

// Chain modifications
const modifiedUrl = url
  .setProtocol('https')
  .appendPath('items')
  .setSearch({ id: 123, view: 'details' });

console.log('Modified:', modifiedUrl.toUrlString());
// 'https://shop.example.com:8080/products/electronics/items?id=123&view=details'
```

## Cookie Management

### getCookieByName

Retrieves a specific cookie value by name from the browser's document.cookie.

**Purpose**: Provides a simple, reliable way to extract individual cookie values from the browser's cookie string.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `cookieName` | `string` | Name of the cookie to retrieve |

**Returns**: `string | undefined` - Cookie value or undefined if not found

**Usage Example**:

```typescript
import { getCookieByName } from '@zdr-tools/zdr-native-web';

// Retrieve specific cookies
const sessionId = getCookieByName('sessionId');
const userPreferences = getCookieByName('userPrefs');
const authToken = getCookieByName('authToken');

console.log('Session ID:', sessionId); // "abc123def456" or undefined

// Use in conditional logic
if (sessionId) {
  console.log('User is logged in');
  // Proceed with authenticated requests
} else {
  console.log('User needs to log in');
  // Redirect to login page
}

// Parse JSON cookies
const prefsString = getCookieByName('preferences');
if (prefsString) {
  try {
    const preferences = JSON.parse(prefsString);
    console.log('User preferences:', preferences);
  } catch (error) {
    console.warn('Failed to parse preferences cookie');
  }
}

// Handle missing cookies gracefully
const theme = getCookieByName('theme') ?? 'light';
const language = getCookieByName('language') ?? 'en';

// Create cookie-aware services
class UserService {
  getCurrentUserId(): string | null {
    return getCookieByName('userId') || null;
  }

  isAuthenticated(): boolean {
    return !!getCookieByName('authToken');
  }

  getUserRole(): string {
    return getCookieByName('userRole') || 'guest';
  }
}
```

## Browser APIs

### IntersectionObserverService

Reactive wrapper for the Intersection Observer API with event-driven notifications.

**Purpose**: Provides a reactive interface to the Intersection Observer API, enabling visibility tracking with ZDR's event system integration.

**API**:

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `constructor` | `options?: IIntersectionObserverServiceOptions` | - | Creates observer service |
| `observe` | `element: Element` | `void` | Starts observing element |
| `unobserve` | `element: Element` | `void` | Stops observing element |
| `disconnect` | - | `void` | Disconnects all observations |

**Properties**:
- `intersectionChanged`: Event broker that fires when intersection changes occur

**Types**:
- `IIntersectionObserverServiceOptions`: Extends `IntersectionObserver` with `sensitivity: number`
- `IIntersectionChangedParams`: Contains `entries: IntersectionObserverEntry[]` and `observer: IntersectionObserver`

**Usage Example**:

```typescript
import { IntersectionObserverService } from '@zdr-tools/zdr-native-web';

// Create intersection observer service
const observerService = new IntersectionObserverService({
  sensitivity: 50 // 50px margin for early detection
});

// Listen for intersection changes
observerService.intersectionChanged.register(({ entries, observer }) => {
  entries.forEach(entry => {
    const element = entry.target;
    const isVisible = entry.isIntersecting;

    console.log(`Element ${element.id} is ${isVisible ? 'visible' : 'hidden'}`);

    if (isVisible) {
      // Element became visible
      element.classList.add('visible');

      // Lazy load images
      if (element.tagName === 'IMG' && element.dataset.src) {
        element.src = element.dataset.src;
      }

      // Track analytics
      analytics.track('element_viewed', {
        elementId: element.id,
        elementType: element.tagName
      });
    } else {
      // Element became hidden
      element.classList.remove('visible');
    }
  });
});

// Observe elements
const heroSection = document.querySelector('#hero');
const productCards = document.querySelectorAll('.product-card');
const footer = document.querySelector('#footer');

if (heroSection) observerService.observe(heroSection);
productCards.forEach(card => observerService.observe(card));
if (footer) observerService.observe(footer);

// Cleanup when done
window.addEventListener('beforeunload', () => {
  observerService.disconnect();
});
```

### Advanced IntersectionObserver Usage

```typescript
// Implement scroll-triggered animations
class ScrollAnimationService {
  private observerService: IntersectionObserverService;

  constructor() {
    this.observerService = new IntersectionObserverService({
      sensitivity: 100 // Trigger 100px before element enters viewport
    });

    this.observerService.intersectionChanged.register(({ entries }) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target as HTMLElement);
        }
      });
    });
  }

  observeElement(element: HTMLElement): void {
    // Mark element for animation
    element.classList.add('animate-on-scroll');
    this.observerService.observe(element);
  }

  private animateElement(element: HTMLElement): void {
    // Add animation class
    element.classList.add('animated');

    // Remove from observation after animation
    this.observerService.unobserve(element);
  }

  destroy(): void {
    this.observerService.disconnect();
  }
}

// Implement infinite scrolling
class InfiniteScrollService {
  private observerService: IntersectionObserverService;
  private isLoading = false;

  constructor(private loadMoreCallback: () => Promise<void>) {
    this.observerService = new IntersectionObserverService();
    this.observerService.intersectionChanged.register(({ entries }) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading) {
          this.loadMore();
        }
      });
    });
  }

  setTriggerElement(element: HTMLElement): void {
    // Observe the "load more" trigger element
    this.observerService.observe(element);
  }

  private async loadMore(): Promise<void> {
    this.isLoading = true;
    try {
      await this.loadMoreCallback();
    } finally {
      this.isLoading = false;
    }
  }

  destroy(): void {
    this.observerService.disconnect();
  }
}

// Usage
const infiniteScroll = new InfiniteScrollService(async () => {
  // Load more data
  const newItems = await api.getNextPage();
  renderItems(newItems);
});

const loadMoreTrigger = document.querySelector('#load-more-trigger');
if (loadMoreTrigger) {
  infiniteScroll.setTriggerElement(loadMoreTrigger);
}
```

## Integration Examples

### URL-based Routing with Reactive Properties

```typescript
import { UrlParser, Url } from '@zdr-tools/zdr-native-web';
import { PropEventBroker } from '@zdr-tools/zdr-entities';
import { AdvancedEventEmitter } from '@zdr-tools/zdr-native-tools';

class RouterService extends AdvancedEventEmitter {
  private parser = new UrlParser();
  private _currentUrl = new PropEventBroker(this, window.location.href);
  private _currentRoute = new PropEventBroker(this, '');

  constructor() {
    super();
    this.updateRoute();

    // Listen for URL changes
    this._currentUrl.register(() => {
      this.updateRoute();
    });

    // Listen for browser navigation
    window.addEventListener('popstate', () => {
      this._currentUrl.set(window.location.href);
    });
  }

  get currentUrl() { return this._currentUrl; }
  get currentRoute() { return this._currentRoute; }

  private updateRoute(): void {
    const url = this.parser.parse(this._currentUrl.get());
    const pathSegments = url.getPathSegments();
    const route = pathSegments.join('/') || 'home';
    this._currentRoute.set(route);
  }

  navigate(path: string, queryParams?: Record<string, any>): void {
    const currentUrl = this.parser.parse(this._currentUrl.get());
    let newUrl = currentUrl.setProtocol(window.location.protocol.slice(0, -1))
      .setSearch(queryParams || {});

    // Set new path
    const url = new Url(newUrl.toUrlString());
    for (const segment of path.split('/').filter(Boolean)) {
      newUrl = newUrl.appendPath(segment);
    }

    const finalUrl = newUrl.toUrlString();
    window.history.pushState(null, '', finalUrl);
    this._currentUrl.set(finalUrl);
  }
}
```

### Cookie-based User Preferences

```typescript
import { getCookieByName } from '@zdr-tools/zdr-native-web';
import { PropEventBroker } from '@zdr-tools/zdr-entities';
import { AdvancedEventEmitter } from '@zdr-tools/zdr-native-tools';

interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  notifications: boolean;
}

class UserPreferencesService extends AdvancedEventEmitter {
  private _preferences = new PropEventBroker<UserPreferences>(this, {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    notifications: true
  });

  constructor() {
    super();
    this.loadFromCookies();

    // Save preferences when they change
    this._preferences.register(() => {
      this.saveToCookies();
    });
  }

  get preferences() { return this._preferences; }

  private loadFromCookies(): void {
    const stored = getCookieByName('userPreferences');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this._preferences.set({ ...this._preferences.get(), ...parsed });
      } catch (error) {
        console.warn('Failed to parse user preferences from cookie');
      }
    }

    // Load individual preference cookies
    const theme = getCookieByName('theme') as 'light' | 'dark';
    const language = getCookieByName('language');
    if (theme || language) {
      this._preferences.set({
        ...this._preferences.get(),
        ...(theme && { theme }),
        ...(language && { language })
      });
    }
  }

  private saveToCookies(): void {
    const prefs = this._preferences.get();
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // 1 year

    document.cookie = `userPreferences=${JSON.stringify(prefs)}; expires=${expires.toUTCString()}; path=/`;
    document.cookie = `theme=${prefs.theme}; expires=${expires.toUTCString()}; path=/`;
    document.cookie = `language=${prefs.language}; expires=${expires.toUTCString()}; path=/`;
  }

  updateTheme(theme: 'light' | 'dark'): void {
    const current = this._preferences.get();
    this._preferences.set({ ...current, theme });
  }

  updateLanguage(language: string): void {
    const current = this._preferences.get();
    this._preferences.set({ ...current, language });
  }
}
```

## Browser Compatibility

### IntersectionObserver Support

The `IntersectionObserverService` automatically detects browser support:

```typescript
// Service gracefully handles missing IntersectionObserver
const observerService = new IntersectionObserverService();

// Check if observation is supported
if (typeof IntersectionObserver !== 'undefined') {
  observerService.observe(element);
} else {
  // Fallback for older browsers
  console.warn('IntersectionObserver not supported, using fallback');

  // Implement scroll-based visibility detection
  window.addEventListener('scroll', () => {
    checkElementVisibility(element);
  });
}
```

### URL Manipulation Compatibility

The URL utilities work across all modern browsers and provide consistent behavior:

```typescript
// Works with relative URLs
const relativeUrl = new Url('/api/users');
console.log(relativeUrl.getPath()); // '/api/users'

// Works with absolute URLs
const absoluteUrl = new Url('https://api.example.com/users');
console.log(absoluteUrl.getHost()); // 'api.example.com'

// Works with complex URLs
const complexUrl = new Url('https://user:pass@example.com:8080/path?query=value#hash');
console.log(complexUrl.getProtocol()); // 'https'
console.log(complexUrl.getHost()); // 'user:pass@example.com:8080'
```

## Framework Integration

This package integrates seamlessly with the ZDR ecosystem:

- **Implements** URL interfaces from `@zdr-tools/zdr-interfaces`
- **Uses** event brokers from `@zdr-tools/zdr-entities`
- **Provides** web-specific reactive services for browser environments
- **Supports** reactive patterns for web applications
- **Enables** URL-based routing and state management

The web tools package bridges framework-agnostic ZDR core functionality with browser-specific APIs, providing reactive interfaces for common web development patterns.