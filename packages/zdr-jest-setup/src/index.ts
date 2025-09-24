import { setMockingFunction } from '@zdr-tools/zdr-testing-tools';

// Configure the global mocking function to use Jest's jest.fn
setMockingFunction(jest.fn);