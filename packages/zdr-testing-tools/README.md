# @zdr-tools/zdr-testing-tools

Base testing utilities that make fake implementations work across different testing frameworks.

## Installation

You probably don't need to install this directly. Instead, install one of these:

- For Jest: `npm install --save-dev @zdr-tools/zdr-jest-setup`
- For Vitest: `npm install --save-dev @zdr-tools/zdr-vitest-setup`

If you really want to install this package directly:

```bash
npm install --save-dev @zdr-tools/zdr-testing-tools
```

## Usage

**Important**: All fake implementations in this project depend on this package. To use any fakes, you must install either [@zdr-tools/zdr-jest-setup](../zdr-jest-setup) or [@zdr-tools/zdr-vitest-setup](../zdr-vitest-setup). Without them, your tests will fail.

These setup packages automatically configure everything you need. Just import them in your test setup:

```typescript
// For Jest - in your jest.setup.ts
import '@zdr-tools/zdr-jest-setup';

// For Vitest - in your vitest.setup.ts
import '@zdr-tools/zdr-vitest-setup';
```

## Examples

Once you have the setup packages installed, you can use any ZDR fake in your tests:

```typescript
import { FakeEntityBuilder } from '@zdr-tools/zdr-entities/fakes';

test('user service processes data', () => {
  const fakeUser = new FakeEntityBuilder()
    .withId('test-user')
    .build();

  // The fake automatically uses the right mock functions
  expect(fakeUser.getId()).toBe('test-user');
  expect(fakeUser.getId).toHaveBeenCalled();
});
```

## License

MIT