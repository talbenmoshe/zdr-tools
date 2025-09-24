# Testing with ZDR Entities

This document covers the testing infrastructure provided by `@zdr-tools/zdr-entities`. **The recommended approach is to create custom fakes for your domain entities rather than using the generic base fakes directly.**

## Setup Requirements

**Before using any fakes, you must install the appropriate testing setup package:**

- For Jest: `npm install --save-dev @zdr-tools/zdr-jest-setup`
- For Vitest: `npm install --save-dev @zdr-tools/zdr-vitest-setup`

Then import the setup in your test configuration:

```typescript
// jest.setup.ts
import '@zdr-tools/zdr-jest-setup';

// OR vitest.setup.ts
import '@zdr-tools/zdr-vitest-setup';
```

## Custom Domain Fakes (Recommended Approach)

Create custom fake implementations for your domain entities. This provides type safety and clear, maintainable test code.

The pattern involves extending `FakeEntity` and `FakeEntityBuilder` to create domain-specific fakes that implement your entity interfaces. Your custom fake class handles the entity-specific properties, while inheriting all the base entity behavior (ID, change tracking, etc.) from the base classes.

### Example: Custom User Fake

```typescript
// user.spec.ts - Example test file
import { Entity, textMinLength } from '@zdr-tools/zdr-entities';
import {
  FakeEntity,
  FakeEntityBuilder,
  FakesFactory,
  type IFakeEntityInitialData
} from '@zdr-tools/zdr-entities/fakes';

// Domain entity
interface IUser extends IEntity {
  name: IReadablePropEventBroker<string>;
  email: IReadablePropEventBroker<string>;
  age: IReadablePropEventBroker<number>;
}

class User extends Entity implements IUser {
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

// Custom fake implementation
interface IUserInitialData extends IFakeEntityInitialData {
  name: IReadablePropEventBroker<string>;
  email: IReadablePropEventBroker<string>;
  age: IReadablePropEventBroker<number>;
}

class FakeUser extends FakeEntity implements IUser {
  name: IReadablePropEventBroker<string>;
  email: IReadablePropEventBroker<string>;
  age: IReadablePropEventBroker<number>;

  constructor(initialData: IUserInitialData) {
    super(initialData);
    this.name = initialData.name;
    this.email = initialData.email;
    this.age = initialData.age;
  }
}

class FakeUserBuilder extends FakeEntityBuilder {
  name = FakesFactory.createReadablePropEventBroker('John Doe');
  email = FakesFactory.createReadablePropEventBroker('john@example.com');
  age = FakesFactory.createReadablePropEventBroker(30);

  withNameProp(name: IReadablePropEventBroker<string>): this {
    this.name = name;
    return this;
  }

  withNameValue(name: string): this {
    return this.withNameProp(FakesFactory.createReadablePropEventBroker(name));
  }

  withEmailProp(email: IReadablePropEventBroker<string>): this {
    this.email = email;
    return this;
  }

  withEmailValue(email: string): this {
    return this.withEmailProp(FakesFactory.createReadablePropEventBroker(email));
  }

  withAgeProp(age: IReadablePropEventBroker<number>): this {
    this.age = age;
    return this;
  }

  withAgeValue(age: number): this {
    return this.withAgeProp(FakesFactory.createReadablePropEventBroker(age));
  }

  private getUserInitialData(): IUserInitialData {
    return {
      ...this.getInitialData(),
      name: this.name,
      email: this.email,
      age: this.age
    };
  }

  build(): FakeUser {
    return new FakeUser(this.getUserInitialData());
  }
}

// Test examples
describe('User Service', () => {
  it('should process user data', () => {
    const fakeUser = new FakeUserBuilder()
      .withId('test-user')
      .withNameValue('Jane Smith')
      .withEmailValue('jane@example.com')
      .withAgeValue(25)
      .withIsChanged(false)
      .build();

    expect(fakeUser.getId()).toBe('test-user');
    expect(fakeUser.name.get()).toBe('Jane Smith');
    expect(fakeUser.email.get()).toBe('jane@example.com');
    expect(fakeUser.age.get()).toBe(25);
    expect(fakeUser.isChanged()).toBe(false);
  });

  it('should handle user validation', () => {
    const invalidNameProp = FakesFactory.createReadablePropEventBrokerBuilder('J')
      .withIsValid(false)
      .withGetViolations([{ result: 'Name too short' }])
      .build();

    const fakeUser = new FakeUserBuilder()
      .withNameProp(invalidNameProp)
      .build();

    expect(fakeUser.name.isValid()).toBe(false);
    expect(fakeUser.name.getViolations()).toEqual([{ result: 'Name too short' }]);
  });

  it('should track method calls', () => {
    const fakeUser = new FakeUserBuilder().build();

    fakeUser.commit();
    fakeUser.restore();

    expect(fakeUser.commit).toHaveBeenCalled();
    expect(fakeUser.restore).toHaveBeenCalled();
  });

  it('should work with collections', () => {
    const user1 = new FakeUserBuilder().withNameValue('User 1').build();
    const user2 = new FakeUserBuilder().withNameValue('User 2').build();

    const userCollection = FakesFactory.createEntityCollectionBuilder<IUser>()
      .withGetItems([user1, user2])
      .withIsEmpty(false)
      .build();

    userCollection.addItems([user1, user2]);

    expect(userCollection.getItems()).toEqual([user1, user2]);
    expect(userCollection.isEmpty()).toBe(false);
    expect(userCollection.addItems).toHaveBeenCalledWith([user1, user2]);
  });
});
```

## FakesFactory

**Use FakesFactory for creating property fakes and collections** - it provides consistent configuration and simplifies fake creation.

### Available Factory Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `createEventBroker<T>()` | `FakeEventBroker<T>` | Create event broker fake |
| `createEventBrokerBuilder<T>()` | `FakeEventBrokerBuilder<T>` | Create event broker builder |
| `createReadablePropEventBroker<T>(value)` | `FakeReadablePropEventBroker<T>` | Create readable property fake |
| `createPropEventBroker<T>(value)` | `FakePropEventBroker<T>` | Create property fake |
| `createFakeRestorablePropEventBroker<T>(value)` | `FakeRestorablePropEventBroker<T>` | Create restorable property fake |
| `createEntityCollection<T>()` | `FakeEntityCollection<T>` | Create entity collection fake |
| `createOrderedEntityCollection<T>()` | `FakeOrderedEntityCollection<T>` | Create ordered collection fake |

```typescript
import { FakesFactory } from '@zdr-tools/zdr-entities/fakes';

// Simple creation
const fakeProp = FakesFactory.createPropEventBroker('initial value');
const fakeCollection = FakesFactory.createEntityCollection<User>();

// With builders for more control
const customProp = FakesFactory.createPropEventBrokerBuilder('value')
  .withIsValid(false)
  .withGetViolations([{ result: 'Custom error' }])
  .build();
```

## Reference: Available Builders

For reference, these builders are available through FakesFactory (shown in the Custom User Fake example above):

### Property Fakes
- `FakeEventBroker<T>` - Basic event broker
- `FakeReadablePropEventBroker<T>` - Read-only property with validation
- `FakePropEventBroker<T>` - Read/write property with validation
- `FakeRestorablePropEventBroker<T>` - Property with change tracking

### Collection Fakes
- `FakeEntityCollection<T>` - Basic entity collection
- `FakeOrderedEntityCollection<T>` - Ordered entity collection with indexing

**Note:** These base fakes should primarily be used as building blocks within custom domain fakes, not directly in tests.

## Best Practices

1. **Create custom domain fakes** - Build specific fakes for your entities rather than using generic base fakes
2. **Use FakesFactory for properties** - Leverage the factory for creating property fakes and collections
3. **Follow the builder pattern** - Provide both `withProp()` and `withValue()` methods for flexibility
4. **Test validation scenarios** - Use builders to create properties with specific validation states
5. **Keep fakes simple** - Only implement what you need for your specific tests
6. **Extend base fake classes** - Inherit from `FakeEntity` and `FakeEntityBuilder` for consistency

## Troubleshooting

**Error: "Mock creator not configured"**
Install and import either `@zdr-tools/zdr-jest-setup` or `@zdr-tools/zdr-vitest-setup`.

**Type errors with custom fakes**
Ensure your custom fake interfaces extend `IFakeEntityInitialData` and implement the correct entity interface.