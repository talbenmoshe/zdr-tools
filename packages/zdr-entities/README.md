# @zdr-tools/zdr-entities

Reactive entity framework with properties that automatically track changes and notify when they update.

## Installation

```bash
npm install @zdr-tools/zdr-entities
```

## Usage

This package lets you build reactive data models where properties automatically notify listeners when they change. Think of it like a more powerful version of React state that works outside of React.

### Basic Property Example

```typescript
import { PropEventBroker, AdvancedEventEmitter } from '@zdr-tools/zdr-entities';

const emitter = new AdvancedEventEmitter();
const userName = new PropEventBroker(emitter, 'John');

// Listen for changes
userName.register(({ value }) => {
  console.log('Name changed to:', value);
});

userName.set('Jane'); // Logs: "Name changed to: Jane"
```

### Building Entities

```typescript
import { Entity, textMinLength } from '@zdr-tools/zdr-entities';

class User extends Entity {
  private _name = this.createPropEventBroker('name', '', {
    validators: [textMinLength(2)]
  });
  private _email = this.createPropEventBroker('email', '');
  private _age = this.createPropEventBroker('age', 0);

  constructor(id?: string) {
    super(id);
  }

  getEntityName() { return 'User'; }

  get name() { return this._name; }
  get email() { return this._email; }
  get age() { return this._age; }
}

const user = new User();
user.name.set('John');
user.email.set('john@example.com');
user.age.set(25);

// Check if entity has unsaved changes
console.log(user.isChanged()); // true

// Save changes
user.commit();
console.log(user.isChanged()); // false
```

## Core Classes

### EventBroker\<T>

Manages events for a specific type of data. This is the foundation everything else builds on.

```typescript
const broker = new EventBroker<string>(emitter);
const unregister = broker.register(data => console.log(data));
broker.emit('hello');
unregister();
```

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `register` | `callback: (data: T) => void` | `() => void` | Listen for events, ensures callback only registered once, returns unregister function |
| `registerOnce` | `callback: (data: T) => void` | `() => void` | Listen once, auto-unregisters after first call |
| `emit` | `data: T` | `void` | Send event to all listeners |
| `unRegister` | `callback: (data: T) => void` | `void` | Remove specific callback |

### PropEventBroker\<T>

A property that holds a value and notifies when it changes. Can include validation.

```typescript
const age = new PropEventBroker(emitter, 25, {
  validators: [{
    validator: (val: number) => val >= 0 ? undefined : { result: 'Must be positive' }
  }]
});

age.set(-5); // Won't change due to validation
console.log(age.isValid()); // false
```

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `get` | - | `T` | Get current value |
| `set` | `value: T, options?: PropSetOptions` | `boolean` | Set new value, returns true if changed |
| `isValid` | - | `boolean` | Check if value passes validation |
| `getViolations` | - | `V[] \| undefined` | Get validation errors |
| `serialize` | - | `string \| undefined` | Serialize value to string |
| `getMetadataValue` | `key: string` | `unknown \| undefined` | Get validator metadata |

**PropSetOptions:**

| Property | Type | Optional | Description |
|----------|------|----------|-------------|
| `silent` | `boolean` | Yes | Don't emit change event when true |

### ReadablePropEventBroker\<T>

Same as PropEventBroker but read-only (no `set` method).

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `get` | - | `T` | Get current value |
| `isValid` | - | `boolean` | Check if value passes validation |
| `getViolations` | - | `V[] \| undefined` | Get validation errors |
| `serialize` | - | `string \| undefined` | Serialize value to string |
| `getMetadataValue` | `key: string` | `unknown \| undefined` | Get validator metadata |

### RestorablePropEventBroker\<T>

Property that can track changes and restore to previous values.

```typescript
const email = new RestorablePropEventBroker(emitter, 'old@example.com');
email.commit(); // Save current value

email.set('new@example.com');
console.log(email.isChanged()); // true

email.restore(); // Go back to saved value
console.log(email.get()); // 'old@example.com'
```

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `get` | - | `T` | Get current value |
| `set` | `value: T, options?: RestorablePropSetOptions` | `boolean` | Set new value, returns true if changed |
| `isValid` | - | `boolean` | Check if value passes validation |
| `getViolations` | - | `V[] \| undefined` | Get validation errors |
| `isChanged` | - | `boolean` | Check if different from saved value |
| `commit` | - | `void` | Save current value |
| `restore` | - | `void` | Go back to saved value |
| `resetToDefault` | - | `void` | Reset to initial default value |
| `getStoredValue` | - | `T` | Get committed value |

**RestorablePropSetOptions extends PropSetOptions:**

| Property | Type | Optional | Description |
|----------|------|----------|-------------|
| `silent` | `boolean` | Yes | Don't emit change event when true |
| `commit` | `boolean` | Yes | Set value and immediately commit it |

### Entity

Base class for creating reactive entities with multiple properties and collections.

```typescript
class Product extends Entity {
  private _name = this.createPropEventBroker('name', '');
  private _price = this.createPropEventBroker('price', 0);

  constructor(id?: string) {
    super(id);
  }

  getEntityName() { return 'Product'; }
  get name() { return this._name; }
  get price() { return this._price; }
}
```

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `getId` | - | `string` | Get entity ID |
| `setId` | `newId: string` | `void` | Set entity ID |
| `checkId` | `id: string` | `boolean` | Check if entity matches ID |
| `isNew` | - | `boolean` | Check if entity has no real ID yet |
| `isChanged` | - | `boolean` | Check if any properties changed |
| `commit` | - | `void` | Save all property changes |
| `restore` | - | `void` | Restore all properties |
| `getChangedProps` | - | `IEntityChangedProps[]` | Get list of what changed |
| `getChangeablePropsCount` | - | `number` | Get count of changeable properties |

**Protected Methods:**

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `createPropEventBroker` | `propName: string, initialValue: T, options?: IPropEventBrokerOptions<T, V>` | `IRestorablePropEventBroker<T, V>` | Create a reactive property |
| `createEntityCollection` | `name: string, initialItems: T[]` | `IEntityCollection<T>` | Create an unordered collection |
| `createOrderedEntityCollection` | `name: string, initialItems: T[]` | `IOrderedEntityCollection<T>` | Create an ordered collection |

**Events:**

| Property | Type | Description |
|----------|------|-------------|
| `propertyChanged` | `IEventBroker<IPropertyChangedEventData>` | Fires when any property changes |
| `idChanged` | `IEventBroker<IdChangedEventData>` | Fires when entity ID changes |

### EntityCollection\<T>

Holds multiple entities and notifies when items are added/removed.

```typescript
const users = new EntityCollection<User>('Users', []);

users.itemsAdded.register(({ items }) => {
  console.log('Added users:', items.length);
});

users.addItems([user1, user2]);
const allUsers = users.getItems();
```

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `addItems` | `items: T[], options?: AddItemsOptions` | `void` | Add multiple entities |
| `getItems` | - | `T[]` | Get all entities |
| `getItem` | `id: string` | `T \| undefined` | Get entity by ID |
| `removeItem` | `id: string` | `T` | Remove and return entity |
| `isEmpty` | - | `boolean` | Check if empty |
| `removeAllItems` | - | `void` | Clear all items |
| `replaceAllItems` | `items: T[]` | `void` | Replace all items |
| `getNewItems` | - | `T[]` | Get uncommitted items |
| `getOldItems` | - | `T[]` | Get committed items |

**AddItemsOptions:**

| Property | Type | Optional | Description |
|----------|------|----------|-------------|
| `silent` | `boolean` | Yes | Don't emit events when true |

**Events:**

| Property | Type | Description |
|----------|------|-------------|
| `itemsAdded` | `IEventBroker<IItemsEventData<T>>` | When items are added |
| `itemRemoved` | `IEventBroker<IItemEventData<T>>` | When item is removed |
| `itemChanged` | `IEventBroker<IItemEventData<T>>` | When item properties change |
| `itemIdChanged` | `IEventBroker<IItemIdChangedEventData<T>>` | When item ID changes |
| `collectionChanged` | `IEventBroker` | When collection changes |

### OrderedEntityCollection\<T>

Like EntityCollection but maintains explicit ordering.

```typescript
const orderedUsers = new OrderedEntityCollection<User>('Users', []);
orderedUsers.addItems([user1, user2]);
orderedUsers.moveItem(user1.getId(), 1); // Move to second position

const firstUser = orderedUsers.getItemAt(0);
```

**Additional Methods (extends EntityCollection):**

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `moveItem` | `itemId: string, newIndex: number` | `void` | Change item position |
| `getItemAt` | `index: number` | `T \| undefined` | Get item by position |
| `getItemOrderIndex` | `itemId: string` | `number` | Get item's index |
| `sort` | `compareFn: (a: T, b: T) => number` | `void` | Sort the collection |
| `getPagedItems` | `page: Paging` | `T[]` | Get paginated items |
| `addItems` | `items: T[], options?: OrderedAddItemsOptions` | `void` | Add items at specific position |

**OrderedAddItemsOptions extends AddItemsOptions:**

| Property | Type | Optional | Description |
|----------|------|----------|-------------|
| `silent` | `boolean` | Yes | Don't emit events when true |
| `startIndex` | `number` | Yes | Position to start adding items |

**Additional Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `order` | `IRestorablePropEventBroker<string[]>` | Reactive property managing item order |

## Built-in Validators

| Validator | Parameters | Description |
|-----------|------------|-------------|
| `textMinLength` | `minLength: number` | Ensures text is at least a certain length |
| `textMaxLength` | `maxLength: number` | Ensures text doesn't exceed a length |
| `isDefined` | - | Ensures value is not null or undefined |

```typescript
const name = new PropEventBroker(emitter, '', {
  validators: [
    isDefined(),
    textMinLength(2),
    textMaxLength(50)
  ]
});
```

## Examples

### Complete User Management

```typescript
class UserList extends Entity {
  private _users = this.createEntityCollection('users', []);
  private _searchTerm = this.createPropEventBroker('searchTerm', '');

  constructor() {
    super();
  }

  getEntityName() { return 'UserList'; }
  get users() { return this._users; }
  get searchTerm() { return this._searchTerm; }

  addUser(name: string, email: string) {
    const user = new User();
    user.name.set(name);
    user.email.set(email);
    this.users.addItems([user]);
  }

  getFilteredUsers() {
    const term = this.searchTerm.get().toLowerCase();
    return this.users.getItems().filter(user =>
      user.name.get().toLowerCase().includes(term)
    );
  }
}

const userList = new UserList();

// Listen for any changes
userList.propertyChanged.register(() => {
  console.log('Something in the user list changed');
});

userList.addUser('John', 'john@example.com');
userList.searchTerm.set('jo'); // Triggers change event
```

## Testing

All classes have comprehensive fake implementations for testing. **First, install either `@zdr-tools/zdr-jest-setup` or `@zdr-tools/zdr-vitest-setup`**.

```typescript
import { FakeEntityBuilder, FakesFactory } from '@zdr-tools/zdr-entities/fakes';

// Using builder pattern
const fakeUser = new FakeEntityBuilder()
  .withId('test-user')
  .withIsChanged(false)
  .build();

// Using factory for convenience
const fakeProp = FakesFactory.createPropEventBroker('initial value');

expect(fakeUser.getId()).toBe('test-user');
expect(fakeProp.get()).toBe('initial value');
```

For comprehensive testing documentation including all fakes, builders, and examples, see [Testing.md](./Testing.md).

## License

MIT