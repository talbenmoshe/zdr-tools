// Type definitions for normalized mock functions - intersection of common mock functionality
export type MockedFunction<T extends (...args: any[]) => any> = T & {
  mock: {
    calls: Parameters<T>[];
    results: Array<{
      type: 'return' | 'throw';
      value: ReturnType<T>;
    }>;
  };
  mockReturnValue: (value: ReturnType<T>) => any;
  mockImplementation: (fn: T) => any;
  mockResolvedValue: ReturnType<T> extends Promise<infer U> ? (value: U) => any : never;
  mockRejectedValue: ReturnType<T> extends Promise<any> ? (value: any) => any : never;
  mockClear: () => void;
  mockReset: () => void;
  mockRestore: () => void;
};

// Type for the mock creation function (vi.fn or jest.fn)
// Using any here because the exact return types are different between vi.fn and jest.fn
export type MockCreator = <T extends (...args: any[]) => any>(implementation?: T) => any;

// Global mock creator storage
let globalMockCreator: MockCreator | null = null;

/**
 * Sets the global mock creation function (vi.fn or jest.fn)
 * This should be called once during test setup
 */
export function setMockingFunction(mockCreator: MockCreator): void {
  globalMockCreator = mockCreator;
}

/**
 * Gets a normalized mock function using the configured mock creator
 * @param implementation Optional implementation function
 * @returns A mocked version of the function with normalized interface
 */
export function getMockingFunction<T extends (...args: any[]) => any>(
  implementation?: T
): any {
  if (!globalMockCreator) {
    throw new Error(
      'Mock creator not configured. Install @zdr-tools/zdr-jest-setup or @zdr-tools/zdr-vitest-setup to fix this. See: https://github.com/talbenmoshe/zdr-tools/tree/master/packages/zdr-testing-tools#readme'
    );
  }

  return globalMockCreator(implementation);
}

/**
 * Resets the global mock creator (mainly for testing)
 */
export function resetMockingFunction(): void {
  globalMockCreator = null;
}