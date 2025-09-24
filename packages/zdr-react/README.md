# @zdr-tools/zdr-react

React hooks and components for seamless integration with the ZDR reactive entity framework.

## Overview

This package provides React-specific utilities that bridge the gap between ZDR's reactive entity system and React components. It includes custom hooks for managing reactive properties, event brokers, form fields, and visibility tracking, along with utility components for common React patterns. These tools enable React applications to leverage ZDR's reactive capabilities while maintaining optimal performance through proper React patterns like debouncing, throttling, and automatic cleanup.

## Installation

```bash
npm install @zdr-tools/zdr-react
```

## Requirements

- React 18+
- React DOM 18+

## React Hooks

### usePropBrokerValue&lt;T&gt;

Reactive hook that subscribes to a property broker and triggers React updates when the value changes.

**Purpose**: Connects ZDR reactive properties to React's rendering system with optional performance optimizations through throttling and debouncing.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `broker` | `IPropEventBroker<T>` | Property broker to observe |
| `options` | `IPropEventBrokerOptions?` | Optional timing configuration |

**Options**:
- `timing.wait`: Wait time in milliseconds
- `timing.throttle`: Throttle settings for high-frequency updates
- `timing.debounce`: Debounce settings for delayed updates

**Returns**: `T` - Current value of the property broker

**Usage Example**:

```typescript
import { usePropBrokerValue } from '@zdr-tools/zdr-react';
import { PropEventBroker } from '@zdr-tools/zdr-entities';

function UserProfile({ user }: { user: User }) {
  // Basic usage - updates on every change
  const name = usePropBrokerValue(user.name);
  const email = usePropBrokerValue(user.email);

  // Throttled updates - max once per 100ms
  const description = usePropBrokerValue(user.description, {
    timing: {
      wait: 100,
      throttle: { leading: true, trailing: true }
    }
  });

  // Debounced updates - waits 300ms after last change
  const searchQuery = usePropBrokerValue(user.searchQuery, {
    timing: {
      wait: 300,
      debounce: { leading: false, trailing: true }
    }
  });

  return (
    <div>
      <h1>{name}</h1>
      <p>Email: {email}</p>
      <p>Description: {description}</p>
      <p>Search: {searchQuery}</p>
    </div>
  );
}

// Real-time counter with throttling
function LiveCounter({ counter }: { counter: PropEventBroker<number> }) {
  const count = usePropBrokerValue(counter, {
    timing: {
      wait: 50, // Update max every 50ms
      throttle: { leading: true, trailing: true }
    }
  });

  return <div>Count: {count}</div>;
}
```

### useEventRefresher

Hook that subscribes to multiple event brokers and triggers React updates when any of them emit events.

**Purpose**: Enables React components to reactively update based on various ZDR events, with automatic cleanup and null safety.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `...props` | `(IEventBroker \| undefined)[]` | Event brokers to observe |

**Returns**: `void` - Causes component re-render when events fire

**Usage Example**:

```typescript
import { useEventRefresher } from '@zdr-tools/zdr-react';

function UserDashboard({ user, notifications, settings }: Props) {
  // Re-render when user properties change, notifications arrive, or settings update
  useEventRefresher(
    user.propertyChanged,
    notifications.newMessage,
    settings.themeChanged,
    user.avatar?.updated // Safe to pass undefined
  );

  return (
    <div>
      <h1>Welcome {user.name.get()}</h1>
      <p>Notifications: {notifications.getUnreadCount()}</p>
      <p>Theme: {settings.theme.get()}</p>
      {user.avatar && <img src={user.avatar.url.get()} />}
    </div>
  );
}

// Entity collection updates
function UserList({ userCollection }: { userCollection: EntityCollection<User> }) {
  useEventRefresher(
    userCollection.itemsAdded,
    userCollection.itemRemoved,
    userCollection.collectionChanged
  );

  const users = userCollection.getItems();

  return (
    <ul>
      {users.map(user => (
        <li key={user.getId()}>{user.name.get()}</li>
      ))}
    </ul>
  );
}
```

### useTextField

Specialized hook for reactive text fields with validation metadata extraction.

**Purpose**: Provides a complete interface for text inputs with built-in validation state, length constraints, and violation handling.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `textBroker` | `IReadablePropEventBroker<string>` | Text property broker |

**Returns**: `ITextFieldResult` with:
- `text`: Current text value
- `minLength`: Minimum length from validator metadata
- `maxLength`: Maximum length from validator metadata
- `violations`: Current validation violations

**Usage Example**:

```typescript
import { useTextField } from '@zdr-tools/zdr-react';
import { textMinLength, textMaxLength } from '@zdr-tools/zdr-entities';

function UserForm({ user }: { user: User }) {
  const nameField = useTextField(user.name); // Has min/max length validators
  const emailField = useTextField(user.email);
  const bioField = useTextField(user.biography);

  return (
    <form>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={nameField.text}
          onChange={e => user.name.set(e.target.value)}
          maxLength={nameField.maxLength}
          placeholder={`Minimum ${nameField.minLength} characters`}
          style={{
            borderColor: nameField.violations ? 'red' : 'initial'
          }}
        />
        {nameField.violations && (
          <div className="error">
            {nameField.violations.map(v => v.result).join(', ')}
          </div>
        )}
        <small>
          {nameField.text.length}
          {nameField.maxLength && `/${nameField.maxLength}`} characters
        </small>
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          value={emailField.text}
          onChange={e => user.email.set(e.target.value)}
          style={{
            borderColor: emailField.violations ? 'red' : 'initial'
          }}
        />
        {emailField.violations && (
          <div className="error">Invalid email format</div>
        )}
      </div>

      <div>
        <label>Biography:</label>
        <textarea
          value={bioField.text}
          onChange={e => user.biography.set(e.target.value)}
          maxLength={bioField.maxLength}
          rows={4}
        />
        <small>
          {bioField.text.length}/{bioField.maxLength} characters
        </small>
      </div>
    </form>
  );
}

// Dynamic form validation
function ContactForm() {
  const [message] = useState(() => new PropEventBroker(
    new AdvancedEventEmitter(),
    '',
    {
      validators: [
        textMinLength(10),
        textMaxLength(500)
      ]
    }
  ));

  const messageField = useTextField(message);
  const isValid = !messageField.violations;

  return (
    <div>
      <textarea
        value={messageField.text}
        onChange={e => message.set(e.target.value)}
        placeholder={`Write at least ${messageField.minLength} characters...`}
        maxLength={messageField.maxLength}
      />
      <div>
        Characters: {messageField.text.length}/{messageField.maxLength}
        {messageField.minLength && messageField.text.length < messageField.minLength && (
          <span> (need {messageField.minLength - messageField.text.length} more)</span>
        )}
      </div>
      <button disabled={!isValid}>Send Message</button>
    </div>
  );
}
```

### useOpenClose

Hook providing boolean state management with open/close functionality.

**Purpose**: Simplifies modal, dropdown, and toggle state management with optimized callbacks.

**Returns**: `[boolean, () => void, () => void]` - `[isOpen, open, close]`

**Usage Example**:

```typescript
import { useOpenClose } from '@zdr-tools/zdr-react';

function DropdownMenu({ items }: { items: string[] }) {
  const [isOpen, open, close] = useOpenClose();

  return (
    <div className="dropdown">
      <button onClick={open}>
        Menu {isOpen ? '▲' : '▼'}
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {items.map(item => (
            <div key={item} onClick={close}>
              {item}
            </div>
          ))}
          <div className="dropdown-backdrop" onClick={close} />
        </div>
      )}
    </div>
  );
}

// Modal dialog
function UserEditModal({ user }: { user: User }) {
  const [isOpen, open, close] = useOpenClose();

  return (
    <>
      <button onClick={open}>Edit User</button>
      {isOpen && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit User</h2>
            <UserForm user={user} />
            <button onClick={close}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

// Collapsible section
function CollapsibleSection({ title, children }: PropsWithChildren<{ title: string }>) {
  const [isExpanded, expand, collapse] = useOpenClose();

  return (
    <div className="collapsible">
      <button onClick={isExpanded ? collapse : expand}>
        {title} {isExpanded ? '−' : '+'}
      </button>
      {isExpanded && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
}
```

### useTimestamp

Hook for reactive timestamp management with manual update capability.

**Purpose**: Provides current timestamp state with ability to refresh, useful for time-based displays and cache busting.

**Returns**: `{ timestamp: number, setCurrentTimestamp: () => void }`

**Usage Example**:

```typescript
import { useTimestamp } from '@zdr-tools/zdr-react';

function LiveClock() {
  const { timestamp, setCurrentTimestamp } = useTimestamp();

  useEffect(() => {
    const interval = setInterval(setCurrentTimestamp, 1000);
    return () => clearInterval(interval);
  }, [setCurrentTimestamp]);

  return (
    <div>
      Current time: {new Date(timestamp).toLocaleTimeString()}
    </div>
  );
}

// Cache-busting for API calls
function RefreshableData() {
  const { timestamp, setCurrentTimestamp } = useTimestamp();
  const [data, setData] = useState(null);

  // Refresh data when timestamp changes
  useEffect(() => {
    fetchData(timestamp).then(setData);
  }, [timestamp]);

  return (
    <div>
      <button onClick={setCurrentTimestamp}>Refresh Data</button>
      <small>Last updated: {new Date(timestamp).toLocaleString()}</small>
      <div>{data && <DataDisplay data={data} />}</div>
    </div>
  );
}

// Session timeout warning
function SessionManager({ user }: { user: User }) {
  const { timestamp, setCurrentTimestamp } = useTimestamp();
  const lastActivity = usePropBrokerValue(user.lastActivity);
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    const interval = setInterval(setCurrentTimestamp, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [setCurrentTimestamp]);

  const timeSinceActivity = timestamp - lastActivity;
  const isNearTimeout = timeSinceActivity > sessionTimeout - 5 * 60 * 1000; // 5 min warning

  if (isNearTimeout) {
    return (
      <div className="session-warning">
        Your session will expire soon.
        <button onClick={() => user.updateActivity()}>Stay Logged In</button>
      </div>
    );
  }

  return null;
}
```

### useIncrement

Internal hook providing increment functionality for triggering React updates.

**Purpose**: Foundation hook used by other ZDR React hooks to force component re-renders when reactive values change.

**Returns**: `{ currentNumber: number, increment: () => void }`

**Usage Example**:

```typescript
import { useIncrement } from '@zdr-tools/zdr-react';

// Custom reactive hook
function useCustomEventBroker<T>(broker: IEventBroker<T>) {
  const { increment } = useIncrement();

  useEffect(() => {
    return broker.register(() => {
      increment(); // Force re-render
    });
  }, [broker, increment]);
}

// Manual refresh trigger
function ManualRefreshComponent({ dataSource }: { dataSource: DataSource }) {
  const { increment } = useIncrement();

  const refreshData = useCallback(() => {
    dataSource.refresh().then(() => {
      increment(); // Force component update after async operation
    });
  }, [dataSource, increment]);

  return (
    <button onClick={refreshData}>
      Refresh Data
    </button>
  );
}
```

### useIsVisible

Hook for tracking element visibility using Intersection Observer.

**Purpose**: Provides visibility detection with customizable triggering behavior and ref management.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `{ triggerVisibleOnlyOnce?: boolean }` | Visibility options |

**Returns**: `{ wrapperRef: RefObject<T>, isVisible: boolean }`

**Usage Example**:

```typescript
import { useIsVisible } from '@zdr-tools/zdr-react';

// Lazy loading images
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const { wrapperRef, isVisible } = useIsVisible<HTMLDivElement>({
    triggerVisibleOnlyOnce: true
  });

  return (
    <div ref={wrapperRef}>
      {isVisible ? (
        <img src={src} alt={alt} />
      ) : (
        <div className="image-placeholder">Loading...</div>
      )}
    </div>
  );
}

// Analytics tracking
function AnalyticsTracker({ eventName, data }: { eventName: string; data: any }) {
  const { wrapperRef, isVisible } = useIsVisible<HTMLDivElement>({
    triggerVisibleOnlyOnce: true
  });

  useEffect(() => {
    if (isVisible) {
      analytics.track(eventName, data);
    }
  }, [isVisible, eventName, data]);

  return <div ref={wrapperRef} style={{ height: 1, width: 1 }} />;
}

// Infinite scroll trigger
function InfiniteScrollTrigger({ onVisible }: { onVisible: () => void }) {
  const { wrapperRef, isVisible } = useIsVisible<HTMLDivElement>({
    triggerVisibleOnlyOnce: false // Trigger every time it becomes visible
  });

  useEffect(() => {
    if (isVisible) {
      onVisible();
    }
  }, [isVisible, onVisible]);

  return (
    <div ref={wrapperRef} style={{ height: 20 }}>
      Loading more...
    </div>
  );
}
```

### useIsMobileWidth

Hook for responsive design based on viewport width.

**Purpose**: Provides reactive mobile/desktop detection for responsive behavior.

**Returns**: `boolean` - True if viewport is mobile width

**Usage Example**:

```typescript
import { useIsMobileWidth } from '@zdr-tools/zdr-react';

function ResponsiveNavigation() {
  const isMobile = useIsMobileWidth();

  return (
    <nav className={isMobile ? 'mobile-nav' : 'desktop-nav'}>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
    </nav>
  );
}

// Conditional rendering
function ProductGrid({ products }: { products: Product[] }) {
  const isMobile = useIsMobileWidth();
  const itemsPerRow = isMobile ? 1 : 3;

  return (
    <div className="product-grid" style={{
      gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`
    }}>
      {products.map(product => (
        <ProductCard key={product.getId()} product={product} compact={isMobile} />
      ))}
    </div>
  );
}
```

### useThrottledEventRefresher

Hook that subscribes to event brokers with throttling to limit update frequency.

**Purpose**: Provides reactive updates with performance optimization for high-frequency events.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `throttleMs` | `number` | Throttle interval in milliseconds |
| `...eventBrokers` | `IEventBroker[]` | Event brokers to observe |

**Usage Example**:

```typescript
import { useThrottledEventRefresher } from '@zdr-tools/zdr-react';

// High-frequency updates from real-time data
function LiveStockTicker({ stockPrices }: { stockPrices: EntityCollection<Stock> }) {
  // Throttle updates to once per 100ms max
  useThrottledEventRefresher(
    100,
    stockPrices.collectionChanged,
    stockPrices.itemChanged
  );

  const stocks = stockPrices.getItems();

  return (
    <div className="stock-ticker">
      {stocks.map(stock => (
        <div key={stock.getId()}>
          {stock.symbol.get()}: ${stock.price.get()}
        </div>
      ))}
    </div>
  );
}
```

### usePropEventRefresher

Hook that subscribes to property event brokers for reactive updates.

**Purpose**: Simplified reactive updates for property-specific events.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `...propBrokers` | `IPropEventBroker[]` | Property brokers to observe |

**Usage Example**:

```typescript
import { usePropEventRefresher } from '@zdr-tools/zdr-react';

function UserSummary({ user }: { user: User }) {
  // Re-render when specific properties change
  usePropEventRefresher(
    user.name,
    user.email,
    user.avatar
  );

  return (
    <div>
      <h2>{user.name.get()}</h2>
      <p>{user.email.get()}</p>
      {user.avatar.get() && <img src={user.avatar.get()} />}
    </div>
  );
}
```

### useReadableEventRefresher

Hook that subscribes to readable property brokers and returns current values with violations.

**Purpose**: Provides both value and validation state for reactive properties.

**API**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `broker` | `IReadablePropEventBroker<T, V>` | Readable property broker |

**Returns**: `[[T, OptionalViolations<V>]]` - Tuple of value and violations

**Usage Example**:

```typescript
import { useReadableEventRefresher } from '@zdr-tools/zdr-react';

function ValidatedInput({ broker }: { broker: IReadablePropEventBroker<string> }) {
  const [[value, violations]] = useReadableEventRefresher(broker);

  return (
    <div>
      <input
        value={value}
        onChange={e => broker.set?.(e.target.value)}
        style={{ borderColor: violations ? 'red' : 'green' }}
      />
      {violations && (
        <div className="error">
          {violations.map(v => v.result).join(', ')}
        </div>
      )}
    </div>
  );
}
```

## React Components

### VisibilityPixel

Invisible component that triggers callbacks when it becomes visible.

**Purpose**: Provides visibility tracking for analytics, lazy loading triggers, and scroll-based actions.

**Props**:
- `onVisibilityChanged: (isVisible: boolean) => void` - Callback when visibility changes
- `triggerVisibleOnlyOnce?: boolean` - Only trigger once (default: true)
- `dataAid?: string` - Data attribute for testing
- `className?: string` - CSS class name

**Usage Example**:

```typescript
import { VisibilityPixel } from '@zdr-tools/zdr-react';

function AnalyticsSection({ sectionName }: { sectionName: string }) {
  const handleVisibilityChange = useCallback((isVisible: boolean) => {
    if (isVisible) {
      analytics.track('section_viewed', { section: sectionName });
    }
  }, [sectionName]);

  return (
    <section>
      <h2>{sectionName}</h2>
      <p>Section content...</p>
      <VisibilityPixel
        onVisibilityChanged={handleVisibilityChange}
        dataAid={`${sectionName}-visibility-tracker`}
      />
    </section>
  );
}

// Infinite scroll implementation
function InfiniteScrollList({ items, loadMore }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = useCallback(async (isVisible: boolean) => {
    if (isVisible && !isLoading) {
      setIsLoading(true);
      await loadMore();
      setIsLoading(false);
    }
  }, [isLoading, loadMore]);

  return (
    <div>
      {items.map(item => (
        <ItemComponent key={item.id} item={item} />
      ))}
      {!isLoading && (
        <VisibilityPixel
          onVisibilityChanged={handleLoadMore}
          triggerVisibleOnlyOnce={false}
        />
      )}
      {isLoading && <div>Loading more items...</div>}
    </div>
  );
}
```

### ClickPropagationPreventer

Component that prevents click event propagation to parent elements.

**Purpose**: Simplifies event handling in complex component hierarchies by stopping unwanted click bubbling.

**Props**:
- `as?: string | React.ComponentType<any>` - Component type to render (default: 'div')
- `children: ReactNode` - Child content

**Usage Example**:

```typescript
import { ClickPropagationPreventer } from '@zdr-tools/zdr-react';

function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <ClickPropagationPreventer className="modal-content">
        {children}
        <button onClick={onClose}>Close</button>
      </ClickPropagationPreventer>
    </div>
  );
}

// Dropdown menu
function DropdownMenu({ items, onItemClick }: Props) {
  const [isOpen, open, close] = useOpenClose();

  return (
    <div className="dropdown" onClick={close}>
      <button onClick={open}>Menu</button>
      {isOpen && (
        <ClickPropagationPreventer as="ul" className="dropdown-menu">
          {items.map(item => (
            <li key={item.id} onClick={() => onItemClick(item)}>
              {item.name}
            </li>
          ))}
        </ClickPropagationPreventer>
      )}
    </div>
  );
}

// Card with clickable content
function UserCard({ user, onUserClick, onActionClick }: Props) {
  return (
    <div className="user-card" onClick={() => onUserClick(user)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>

      <ClickPropagationPreventer as="div" className="card-actions">
        <button onClick={() => onActionClick('edit', user)}>Edit</button>
        <button onClick={() => onActionClick('delete', user)}>Delete</button>
      </ClickPropagationPreventer>
    </div>
  );
}
```

### ReactDiv100Vh

Component that provides 100vh height with mobile browser compatibility.

**Purpose**: Handles mobile browser viewport height issues by providing true 100vh experience.

**Usage Example**:

```typescript
import { ReactDiv100Vh } from '@zdr-tools/zdr-react';

function FullScreenApp() {
  return (
    <ReactDiv100Vh>
      <header>App Header</header>
      <main style={{ flex: 1, overflow: 'auto' }}>
        <AppContent />
      </main>
      <footer>App Footer</footer>
    </ReactDiv100Vh>
  );
}

// Mobile-friendly modal
function FullScreenModal({ children }: { children: ReactNode }) {
  return (
    <ReactDiv100Vh className="modal-fullscreen">
      <div className="modal-header">
        <button>Close</button>
      </div>
      <div className="modal-body">
        {children}
      </div>
    </ReactDiv100Vh>
  );
}
```

## Advanced Usage Patterns

### Entity Form Management

```typescript
import {
  usePropBrokerValue,
  useTextField,
  useEventRefresher
} from '@zdr-tools/zdr-react';

function EntityForm<T extends IEntity>({ entity, onSave }: Props<T>) {
  // Track entity changes
  useEventRefresher(entity.propertyChanged);

  const isValid = !entity.getChangedProps().some(change =>
    change.changedProps.some(prop => prop.violations)
  );

  const hasChanges = entity.isChanged();

  const handleSave = useCallback(async () => {
    if (isValid && hasChanges) {
      await onSave(entity);
      entity.commit();
    }
  }, [entity, onSave, isValid, hasChanges]);

  const handleReset = useCallback(() => {
    entity.restore();
  }, [entity]);

  return (
    <form>
      <FormFields entity={entity} />

      <div className="form-actions">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || !hasChanges}
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasChanges}
        >
          Reset
        </button>
      </div>
    </form>
  );
}
```

### Collection Management

```typescript
function EntityCollectionManager<T extends IEntity>({
  collection,
  renderItem
}: Props<T>) {
  useEventRefresher(
    collection.itemsAdded,
    collection.itemRemoved,
    collection.collectionChanged
  );

  const items = collection.getItems();
  const newItems = collection.getNewItems();
  const hasChanges = collection.isChanged();

  return (
    <div>
      <div className="collection-stats">
        Total: {items.length} | New: {newItems.length}
        {hasChanges && <span className="unsaved">Unsaved changes</span>}
      </div>

      <div className="collection-items">
        {items.map(item => (
          <div key={item.getId()}>
            {renderItem(item)}
            <button onClick={() => collection.removeItem(item.getId())}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <button onClick={() => collection.commit()}>
        Save All Changes
      </button>
    </div>
  );
}
```

## Performance Considerations

### Optimizing Re-renders

```typescript
// Use throttling for high-frequency updates
const throttledValue = usePropBrokerValue(fastChangingProperty, {
  timing: { wait: 100, throttle: { leading: true, trailing: true } }
});

// Use debouncing for search inputs
const searchQuery = usePropBrokerValue(searchProperty, {
  timing: { wait: 300, debounce: { leading: false, trailing: true } }
});

// Selective event subscription
useEventRefresher(
  entity.propertyChanged, // Only for this entity
  // Don't subscribe to collection.itemChanged if not needed
);
```

### Memoization Patterns

```typescript
const EntityComponent = memo(function EntityComponent({ entity }: Props) {
  const name = usePropBrokerValue(entity.name);
  const email = usePropBrokerValue(entity.email);

  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
});

// Use entity ID as React key for optimal reconciliation
{entities.map(entity => (
  <EntityComponent key={entity.getId()} entity={entity} />
))}
```

## Framework Integration

This package provides the React layer of the ZDR framework:

- **Bridges** ZDR reactive entities with React's rendering system
- **Provides** performance optimizations through throttling and debouncing
- **Maintains** automatic subscription cleanup and memory management
- **Enables** reactive forms, collections, and real-time updates
- **Supports** modern React patterns like hooks and concurrent features

The React integration allows developers to build highly reactive user interfaces that automatically stay in sync with ZDR entity state changes while maintaining optimal performance.