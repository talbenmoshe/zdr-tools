import { vi } from 'vitest';
import { setMockingFunction } from '@zdr-tools/zdr-testing-tools';

// Configure the global mocking function to use Vitest's vi.fn
setMockingFunction(vi.fn);