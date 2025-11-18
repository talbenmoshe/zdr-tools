# React Hook Test Examples

This file contains complete examples of generated test files for React hooks following the testing patterns.

## File Organization

**IMPORTANT**: All tests are created in the `__tests__` folder at package root (sibling to `/src`):

```
packages/
  my-package/
    src/
      hooks/
        useMyHook.ts
        useOtherHook.ts
    __tests__/                # Sibling to src/, NOT inside src/
      useMyHook.spec.tsx
      useOtherHook.spec.tsx
```

## Example 1: Simple Hook Returning Context Value

### Original Hook

**Hook:**
```typescript
// src/hooks/useVelocityReportsFacade.ts
import { useVelocityReportsContext } from './useVelocityReportsContext';

export function useVelocityReportsFacade() {
  const context = useVelocityReportsContext();
  return context.facade!;
}
```

**Context:**
```typescript
// src/context/VelocityReportsContextProvider.tsx
import React, { type FC, type PropsWithChildren } from 'react';
import type { IVelocityReportsFacade } from '@placer/velocity-reports-client';

export interface IVelocityReportsContext {
  facade?: IVelocityReportsFacade;
}

export const VelocityReportsContext = React.createContext<IVelocityReportsContext>({});

export const VelocityReportsContextProvider: FC<PropsWithChildren<Required<IVelocityReportsContext>>> = props => {
  const { children, facade } = props;
  return <VelocityReportsContext.Provider value={{ facade }}>{children}</VelocityReportsContext.Provider>;
};
```

**Fake Context Provider:**
```typescript
// fakes/FakeVelocityReportsContextProvider.tsx
import React, { type FC, type PropsWithChildren } from 'react';
import { VelocityReportsContextProvider, type IVelocityReportsContext } from '../src';
import { FakeVelocityReportsFacadeBuilder } from '@placer/velocity-reports-client/fakes';
import type { IVelocityReportsFacade } from '@placer/velocity-reports-client';

export const FakeVelocityReportsContextProvider: FC<PropsWithChildren<IVelocityReportsContext>> = props => {
  const { children, facade: propsFacade } = props;
  const facade: IVelocityReportsFacade = propsFacade ?? new FakeVelocityReportsFacadeBuilder().build();

  return <VelocityReportsContextProvider facade={facade}>{children}</VelocityReportsContextProvider>;
};
```

### Generated Test File

```typescript
// __tests__/useVelocityReportsFacade.spec.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVelocityReportsFacade } from '../src/hooks/useVelocityReportsFacade';
import { FakeVelocityReportsContextProvider } from '../fakes';
import { FakeVelocityReportsFacadeBuilder } from '@placer/velocity-reports-client/fakes';
import type { IVelocityReportsFacade } from '@placer/velocity-reports-client';

describe('useVelocityReportsFacade', () => {
  function renderUseVelocityReportsFacade(overrides?: {
    facade?: IVelocityReportsFacade;
  }) {
    const facade = overrides?.facade ?? new FakeVelocityReportsFacadeBuilder().build();

    const hookRenderResult = renderHook(() => useVelocityReportsFacade(), {
      wrapper: ({ children }) => (
        <FakeVelocityReportsContextProvider facade={facade}>
          {children}
        </FakeVelocityReportsContextProvider>
      ),
    });

    return {
      hookRenderResult,
      facade,
    };
  }

  it('should return facade from context', () => {
    const expectedFacade = new FakeVelocityReportsFacadeBuilder().build();
    const { hookRenderResult } = renderUseVelocityReportsFacade({
      facade: expectedFacade
    });

    expect(hookRenderResult.result.current).toBe(expectedFacade);
  });

  it('should return facade with default builder when no override provided', () => {
    const { hookRenderResult } = renderUseVelocityReportsFacade();

    expect(hookRenderResult.result.current).toBeDefined();
    expect(hookRenderResult.result.current).toBeInstanceOf(Object);
  });
});
```

## Example 2: Hook with Complex Logic and Multiple Return Values

### Original Hook

**Hook:**
```typescript
// src/hooks/useReportsList.ts
import { useEventRefresher, useReadableEventRefresher } from '@zdr-tools/zdr-react';
import { useVelocityReportsFacade } from './useVelocityReportsFacade';

export function useReportsList() {
  const facade = useVelocityReportsFacade();
  const loadingState = facade.loadReportsIfNeeded();
  const reports = facade.getModel().reports;
  useEventRefresher(reports.collectionChanged);
  const [[state]] = useReadableEventRefresher(loadingState);

  return {
    loadingState: state,
    reports: reports.getItems()
  };
}
```

### Generated Test File

```typescript
// __tests__/useReportsList.spec.tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReportsList } from '../src/hooks/useReportsList';
import { FakeVelocityReportsContextProvider } from '../fakes';
import { FakeVelocityReportsFacadeBuilder } from '@placer/velocity-reports-client/fakes';
import { FakeVelocityReportsModelBuilder, FakeReportBuilder } from '@placer/velocity-reports-model/fakes';
import { FakesFactory } from '@zdr-tools/zdr-entities/fakes';
import type { IVelocityReportsFacade } from '@placer/velocity-reports-client';
import type { LoadingState } from '@zdr-tools/zdr-entities';

// Mock external hooks from @zdr-tools/zdr-react
vi.mock('@zdr-tools/zdr-react', () => ({
  useEventRefresher: vi.fn(),
  useReadableEventRefresher: vi.fn(() => [['loaded']])
}));

describe('useReportsList', () => {
  function renderUseReportsList(overrides?: {
    facade?: IVelocityReportsFacade;
  }) {
    const facade = overrides?.facade ?? new FakeVelocityReportsFacadeBuilder().build();

    const hookRenderResult = renderHook(() => useReportsList(), {
      wrapper: ({ children }) => (
        <FakeVelocityReportsContextProvider facade={facade}>
          {children}
        </FakeVelocityReportsContextProvider>
      ),
    });

    return {
      hookRenderResult,
      facade,
    };
  }

  it('should return loading state and reports', () => {
    const { hookRenderResult } = renderUseReportsList();

    expect(hookRenderResult.result.current).toEqual({
      loadingState: expect.any(String),
      reports: expect.any(Array)
    });
  });

  it('should call loadReportsIfNeeded on facade', () => {
    const mockFacade = new FakeVelocityReportsFacadeBuilder().build();
    renderUseReportsList({ facade: mockFacade });

    expect(mockFacade.loadReportsIfNeeded).toHaveBeenCalled();
  });

  it('should return reports from facade model', () => {
    const mockReports = [
      new FakeReportBuilder().withId('report-1').withTitle('ReportTemplate 1').build(),
      new FakeReportBuilder().withId('report-2').withTitle('ReportTemplate 2').build()
    ];

    const mockModel = new FakeVelocityReportsModelBuilder()
      .withReports(FakesFactory.createEntityCollection(mockReports))
      .build();

    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withGetModelReturnValue(mockModel)
      .build();

    const { hookRenderResult } = renderUseReportsList({ facade: mockFacade });

    expect(hookRenderResult.result.current.reports).toEqual(mockReports);
  });

  it('should return empty array when no reports exist', () => {
    const mockModel = new FakeVelocityReportsModelBuilder()
      .withReports(FakesFactory.createEntityCollection([]))
      .build();

    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withGetModelReturnValue(mockModel)
      .build();

    const { hookRenderResult } = renderUseReportsList({ facade: mockFacade });

    expect(hookRenderResult.result.current.reports).toEqual([]);
  });

  it('should return loading state as "loaded"', () => {
    const { hookRenderResult } = renderUseReportsList();

    expect(hookRenderResult.result.current.loadingState).toBe('loaded');
  });
});
```

## Example 3: Hook with Parameters

### Original Hook

**Hook:**
```typescript
// src/hooks/useReport.ts
import { useVelocityReportsFacade } from './useVelocityReportsFacade';
import type { IReport } from '@placer/velocity-reports-model';

export function useReport(reportId: string) {
  const facade = useVelocityReportsFacade();
  const report = facade.getReportById(reportId);

  return { report };
}
```

### Generated Test File

```typescript
// __tests__/useReport.spec.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReport } from '../src/hooks/useReport';
import { FakeVelocityReportsContextProvider } from '../fakes';
import { FakeVelocityReportsFacadeBuilder } from '@placer/velocity-reports-client/fakes';
import { FakeReportBuilder } from '@placer/velocity-reports-model/fakes';
import type { IVelocityReportsFacade } from '@placer/velocity-reports-client';

describe('useReport', () => {
  function renderUseReport(
    params: {
      reportId: string;
    },
    overrides?: {
      facade?: IVelocityReportsFacade;
    }
  ) {
    const facade = overrides?.facade ?? new FakeVelocityReportsFacadeBuilder().build();

    const hookRenderResult = renderHook(() => useReport(params.reportId), {
      wrapper: ({ children }) => (
        <FakeVelocityReportsContextProvider facade={facade}>
          {children}
        </FakeVelocityReportsContextProvider>
      ),
    });

    return {
      hookRenderResult,
      facade,
    };
  }

  it('should call getReportById with correct ID', () => {
    const mockFacade = new FakeVelocityReportsFacadeBuilder().build();
    renderUseReport({ reportId: 'report-123' }, { facade: mockFacade });

    expect(mockFacade.getReportById).toHaveBeenCalledWith('report-123');
  });

  it('should return report from facade', () => {
    const mockReport = new FakeReportBuilder()
      .withId('report-456')
      .withTitle('Test ReportTemplate')
      .build();

    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withGetReportByIdReturnValue(mockReport)
      .build();

    const { hookRenderResult } = renderUseReport(
      { reportId: 'report-456' },
      { facade: mockFacade }
    );

    expect(hookRenderResult.result.current.report).toBe(mockReport);
  });

  it('should return undefined when report does not exist', () => {
    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withGetReportByIdReturnValue(undefined)
      .build();

    const { hookRenderResult } = renderUseReport(
      { reportId: 'nonexistent' },
      { facade: mockFacade }
    );

    expect(hookRenderResult.result.current.report).toBeUndefined();
  });

  it('should handle different report IDs', () => {
    const report1 = new FakeReportBuilder().withId('report-1').build();
    const report2 = new FakeReportBuilder().withId('report-2').build();

    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withGetReportByIdReturnValue(report1)
      .build();

    const { hookRenderResult: result1 } = renderUseReport(
      { reportId: 'report-1' },
      { facade: mockFacade }
    );

    expect(result1.result.current.report).toBe(report1);

    mockFacade.getReportById.mockReturnValue(report2);

    const { hookRenderResult: result2 } = renderUseReport(
      { reportId: 'report-2' },
      { facade: mockFacade }
    );

    expect(result2.result.current.report).toBe(report2);
  });
});
```

## Example 4: Hook with State Management

### Original Hook

**Hook:**
```typescript
// src/hooks/useReportEditor.ts
import { useState } from 'react';
import { useVelocityReportsFacade } from './useVelocityReportsFacade';
import type { IReport } from '@placer/velocity-reports-model';

export function useReportEditor(reportId: string) {
  const facade = useVelocityReportsFacade();
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateReport = (updates: Partial<IReport>) => {
    facade.updateReport(reportId, updates);
    setIsDirty(true);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await facade.saveReport(reportId);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    facade.resetReport(reportId);
    setIsDirty(false);
  };

  return { isDirty, isSaving, updateReport, save, reset };
}
```

### Generated Test File

```typescript
// __tests__/useReportEditor.spec.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReportEditor } from '../src/hooks/useReportEditor';
import { FakeVelocityReportsContextProvider } from '../fakes';
import { FakeVelocityReportsFacadeBuilder } from '@placer/velocity-reports-client/fakes';
import type { IVelocityReportsFacade } from '@placer/velocity-reports-client';

describe('useReportEditor', () => {
  function renderUseReportEditor(
    params: {
      reportId: string;
    },
    overrides?: {
      facade?: IVelocityReportsFacade;
    }
  ) {
    const facade = overrides?.facade ?? new FakeVelocityReportsFacadeBuilder().build();

    const hookRenderResult = renderHook(() => useReportEditor(params.reportId), {
      wrapper: ({ children }) => (
        <FakeVelocityReportsContextProvider facade={facade}>
          {children}
        </FakeVelocityReportsContextProvider>
      ),
    });

    return {
      hookRenderResult,
      facade,
    };
  }

  it('should start with isDirty as false', () => {
    const { hookRenderResult } = renderUseReportEditor({ reportId: 'report-1' });

    expect(hookRenderResult.result.current.isDirty).toBe(false);
  });

  it('should start with isSaving as false', () => {
    const { hookRenderResult } = renderUseReportEditor({ reportId: 'report-1' });

    expect(hookRenderResult.result.current.isSaving).toBe(false);
  });

  it('should set isDirty to true when updateReport is called', () => {
    const { hookRenderResult } = renderUseReportEditor({ reportId: 'report-1' });

    act(() => {
      hookRenderResult.result.current.updateReport({ title: 'New Title' });
    });

    expect(hookRenderResult.result.current.isDirty).toBe(true);
  });

  it('should call facade.updateReport with correct parameters', () => {
    const mockFacade = new FakeVelocityReportsFacadeBuilder().build();
    const { hookRenderResult } = renderUseReportEditor(
      { reportId: 'report-1' },
      { facade: mockFacade }
    );

    act(() => {
      hookRenderResult.result.current.updateReport({ title: 'Updated Title' });
    });

    expect(mockFacade.updateReport).toHaveBeenCalledWith('report-1', { title: 'Updated Title' });
  });

  it('should set isSaving to true during save', async () => {
    let resolveSave: () => void;
    const savePromise = new Promise<void>(resolve => {
      resolveSave = resolve;
    });

    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withSaveReportReturnValue(savePromise)
      .build();

    const { hookRenderResult } = renderUseReportEditor(
      { reportId: 'report-1' },
      { facade: mockFacade }
    );

    // Start save (don't await)
    act(() => {
      hookRenderResult.result.current.save();
    });

    // Check that isSaving is true
    expect(hookRenderResult.result.current.isSaving).toBe(true);

    // Resolve the save
    await act(async () => {
      resolveSave!();
      await savePromise;
    });
  });

  it('should set isDirty to false after save completes', async () => {
    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withSaveReportReturnValue(Promise.resolve())
      .build();

    const { hookRenderResult } = renderUseReportEditor(
      { reportId: 'report-1' },
      { facade: mockFacade }
    );

    // Make it dirty first
    act(() => {
      hookRenderResult.result.current.updateReport({ title: 'Updates' });
    });

    expect(hookRenderResult.result.current.isDirty).toBe(true);

    // Save
    await act(async () => {
      await hookRenderResult.result.current.save();
    });

    expect(hookRenderResult.result.current.isDirty).toBe(false);
  });

  it('should set isSaving to false after save completes', async () => {
    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withSaveReportReturnValue(Promise.resolve())
      .build();

    const { hookRenderResult } = renderUseReportEditor(
      { reportId: 'report-1' },
      { facade: mockFacade }
    );

    await act(async () => {
      await hookRenderResult.result.current.save();
    });

    expect(hookRenderResult.result.current.isSaving).toBe(false);
  });

  it('should set isSaving to false even if save fails', async () => {
    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withSaveReportReturnValue(Promise.reject(new Error('Save failed')))
      .build();

    const { hookRenderResult } = renderUseReportEditor(
      { reportId: 'report-1' },
      { facade: mockFacade }
    );

    try {
      await act(async () => {
        await hookRenderResult.result.current.save();
      });
    } catch {
      // Expected to throw
    }

    expect(hookRenderResult.result.current.isSaving).toBe(false);
  });

  it('should call facade.saveReport with correct report ID', async () => {
    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withSaveReportReturnValue(Promise.resolve())
      .build();

    const { hookRenderResult } = renderUseReportEditor(
      { reportId: 'report-999' },
      { facade: mockFacade }
    );

    await act(async () => {
      await hookRenderResult.result.current.save();
    });

    expect(mockFacade.saveReport).toHaveBeenCalledWith('report-999');
  });

  it('should reset report and set isDirty to false when reset is called', () => {
    const mockFacade = new FakeVelocityReportsFacadeBuilder().build();
    const { hookRenderResult } = renderUseReportEditor(
      { reportId: 'report-1' },
      { facade: mockFacade }
    );

    // Make it dirty first
    act(() => {
      hookRenderResult.result.current.updateReport({ title: 'Updates' });
    });

    expect(hookRenderResult.result.current.isDirty).toBe(true);

    // Reset
    act(() => {
      hookRenderResult.result.current.reset();
    });

    expect(hookRenderResult.result.current.isDirty).toBe(false);
    expect(mockFacade.resetReport).toHaveBeenCalledWith('report-1');
  });
});
```

## Example 5: Hook Without Context (Standalone Hook)

### Original Hook

**Hook:**
```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Generated Test File

```typescript
// __tests__/useDebounce.spec.tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../src/hooks/useDebounce';

describe('useDebounce', () => {
  function renderUseDebounce<T>(params: {
    value: T;
    delay: number;
  }) {
    const hookRenderResult = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: params,
      }
    );

    return {
      hookRenderResult,
    };
  }

  it('should return initial value immediately', () => {
    const { hookRenderResult } = renderUseDebounce({
      value: 'test',
      delay: 500
    });

    expect(hookRenderResult.result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { hookRenderResult } = renderUseDebounce({
      value: 'initial',
      delay: 500
    });

    expect(hookRenderResult.result.current).toBe('initial');

    // Update the value
    hookRenderResult.rerender({ value: 'updates', delay: 500 });

    // Value should still be initial immediately after rerender
    expect(hookRenderResult.result.current).toBe('initial');

    // Wait for debounce delay
    await waitFor(
      () => {
        expect(hookRenderResult.result.current).toBe('updates');
      },
      { timeout: 1000 }
    );
  });

  it('should handle multiple rapid changes', async () => {
    const { hookRenderResult } = renderUseDebounce({
      value: 'value1',
      delay: 300
    });

    // Rapid changes
    hookRenderResult.rerender({ value: 'value2', delay: 300 });
    hookRenderResult.rerender({ value: 'value3', delay: 300 });
    hookRenderResult.rerender({ value: 'value4', delay: 300 });

    // Should still show initial value
    expect(hookRenderResult.result.current).toBe('value1');

    // Wait for debounce - should show last value
    await waitFor(
      () => {
        expect(hookRenderResult.result.current).toBe('value4');
      },
      { timeout: 500 }
    );
  });

  it('should work with different data types', async () => {
    const { hookRenderResult } = renderUseDebounce({
      value: 42,
      delay: 200
    });

    expect(hookRenderResult.result.current).toBe(42);

    hookRenderResult.rerender({ value: 100, delay: 200 });

    await waitFor(
      () => {
        expect(hookRenderResult.result.current).toBe(100);
      },
      { timeout: 400 }
    );
  });

  it('should respect different delay values', async () => {
    const { hookRenderResult } = renderUseDebounce({
      value: 'test',
      delay: 100
    });

    hookRenderResult.rerender({ value: 'updates', delay: 100 });

    // Should update faster with shorter delay
    await waitFor(
      () => {
        expect(hookRenderResult.result.current).toBe('updates');
      },
      { timeout: 200 }
    );
  });
});
```

## Example 6: Hook with Multiple Contexts

### Original Hook

**Hook:**
```typescript
// src/hooks/useReportWithAuth.ts
import { useVelocityReportsFacade } from './useVelocityReportsFacade';
import { useAuth } from './useAuth';
import type { IReport } from '@placer/velocity-reports-model';

export function useReportWithAuth(reportId: string) {
  const facade = useVelocityReportsFacade();
  const { user, permissions } = useAuth();

  const report = facade.getReportById(reportId);
  const canEdit = permissions.includes('edit-reports') && report?.ownerId === user?.id;

  return {
    report,
    canEdit,
    user
  };
}
```

### Generated Test File

```typescript
// __tests__/useReportWithAuth.spec.tsx
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReportWithAuth } from '../src/hooks/useReportWithAuth';
import { FakeVelocityReportsContextProvider } from '../fakes';
import { FakeAuthContextProvider } from '@placer/auth/fakes';
import { FakeVelocityReportsFacadeBuilder } from '@placer/velocity-reports-client/fakes';
import { FakeReportBuilder } from '@placer/velocity-reports-model/fakes';
import { FakeUserBuilder } from '@placer/auth/fakes';
import type { IVelocityReportsFacade } from '@placer/velocity-reports-client';
import type { IUser } from '@placer/auth';

describe('useReportWithAuth', () => {
  function renderUseReportWithAuth(
    params: {
      reportId: string;
    },
    overrides?: {
      facade?: IVelocityReportsFacade;
      user?: IUser;
      permissions?: string[];
    }
  ) {
    const facade = overrides?.facade ?? new FakeVelocityReportsFacadeBuilder().build();
    const user = overrides?.user ?? new FakeUserBuilder().build();
    const permissions = overrides?.permissions ?? [];

    const hookRenderResult = renderHook(() => useReportWithAuth(params.reportId), {
      wrapper: ({ children }) => (
        <FakeAuthContextProvider user={user} permissions={permissions}>
          <FakeVelocityReportsContextProvider facade={facade}>
            {children}
          </FakeVelocityReportsContextProvider>
        </FakeAuthContextProvider>
      ),
    });

    return {
      hookRenderResult,
      facade,
      user,
    };
  }

  it('should return report from facade', () => {
    const mockReport = new FakeReportBuilder()
      .withId('report-1')
      .build();

    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withGetReportByIdReturnValue(mockReport)
      .build();

    const { hookRenderResult } = renderUseReportWithAuth(
      { reportId: 'report-1' },
      { facade: mockFacade }
    );

    expect(hookRenderResult.result.current.report).toBe(mockReport);
  });

  it('should return canEdit as true when user has permission and owns the report', () => {
    const user = new FakeUserBuilder().withId('user-1').build();
    const report = new FakeReportBuilder()
      .withId('report-1')
      .withOwnerId('user-1')
      .build();

    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withGetReportByIdReturnValue(report)
      .build();

    const { hookRenderResult } = renderUseReportWithAuth(
      { reportId: 'report-1' },
      {
        facade: mockFacade,
        user,
        permissions: ['edit-reports']
      }
    );

    expect(hookRenderResult.result.current.canEdit).toBe(true);
  });

  it('should return canEdit as false when user lacks permission', () => {
    const user = new FakeUserBuilder().withId('user-1').build();
    const report = new FakeReportBuilder()
      .withId('report-1')
      .withOwnerId('user-1')
      .build();

    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withGetReportByIdReturnValue(report)
      .build();

    const { hookRenderResult } = renderUseReportWithAuth(
      { reportId: 'report-1' },
      {
        facade: mockFacade,
        user,
        permissions: [] // No permissions
      }
    );

    expect(hookRenderResult.result.current.canEdit).toBe(false);
  });

  it('should return canEdit as false when user does not own the report', () => {
    const user = new FakeUserBuilder().withId('user-1').build();
    const report = new FakeReportBuilder()
      .withId('report-1')
      .withOwnerId('user-2') // Different owner
      .build();

    const mockFacade = new FakeVelocityReportsFacadeBuilder()
      .withGetReportByIdReturnValue(report)
      .build();

    const { hookRenderResult } = renderUseReportWithAuth(
      { reportId: 'report-1' },
      {
        facade: mockFacade,
        user,
        permissions: ['edit-reports']
      }
    );

    expect(hookRenderResult.result.current.canEdit).toBe(false);
  });

  it('should return user from auth context', () => {
    const user = new FakeUserBuilder()
      .withId('user-123')
      .withName('John Doe')
      .build();

    const { hookRenderResult } = renderUseReportWithAuth(
      { reportId: 'report-1' },
      { user }
    );

    expect(hookRenderResult.result.current.user).toBe(user);
  });
});
```

## Key Patterns Summary

1. **Test Location**: Always in `__tests__/` folder (sibling to `src/`)
2. **File Naming**: Exact hook name with `.spec.tsx` extension, e.g., `useMyHook.spec.tsx`
3. **Imports**: Import React, vitest utilities, renderHook, the hook, and Fake providers
4. **Main Structure**: One main describe → `renderMyHook` helper → test cases
5. **renderMyHook**: Accepts params and overrides, returns object with hookRenderResult and dependencies
6. **Wrapper Pattern**: Use Fake context providers in the wrapper option of renderHook
7. **Test Independence**: Each test uses `renderMyHook`, no shared instances
8. **Fake Usage**: Configure fakes in `renderMyHook` call using builder pattern
9. **State Updates**: Use `act()` for any state changes in tests
10. **Async Testing**: Use `await act(async () => ...)` for async operations
11. **Assertions**: Access hook result via `hookRenderResult.result.current`
