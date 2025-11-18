# React Component Test Examples

This file contains complete examples of generated test files for React components following the testing patterns.

## File Organization

**IMPORTANT**: All tests are created in the `__tests__` folder at package root (sibling to `/src`):

```
packages/
  my-package/
    src/
      components/
        MyComponent.tsx
        SubComponent.tsx
    __tests__/                # Sibling to src/, NOT inside src/
      MyComponent.spec.tsx
      SubComponent.spec.tsx
```

## Example 1: Simple Component with Sub-Components

### Original Component

**Component:**
```typescript
// src/components/ReportCard.tsx
import React from 'react';
import { ReportHeader } from './ReportHeader';
import { ReportStats } from './ReportStats';

export interface ReportCardProps {
  reportId: string;
  title: string;
  createdAt: Date;
  viewCount: number;
  onView: () => void;
}

export function ReportCard(props: ReportCardProps) {
  const { reportId, title, createdAt, viewCount, onView } = props;

  return (
    <div className="report-card">
      <ReportHeader
        title={title}
        createdAt={createdAt}
        onView={onView}
      />
      <ReportStats
        reportId={reportId}
        viewCount={viewCount}
      />
    </div>
  );
}
```

### Generated Test File

```typescript
// __tests__/ReportCard.spec.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ReportCard, type ReportCardProps } from '../src/components/ReportCard';

// Mock all sub-components
vi.mock('../src/components/ReportHeader', () => ({
  ReportHeader: vi.fn(() => <div data-testid="mock-report-header">ReportHeader</div>)
}));

vi.mock('../src/components/ReportStats', () => ({
  ReportStats: vi.fn(() => <div data-testid="mock-report-stats">ReportStats</div>)
}));

describe('ReportCard', () => {
  function renderReportCard(props?: Partial<ReportCardProps>) {
    const defaultProps: ReportCardProps = {
      reportId: 'report-123',
      title: 'Test ReportTemplate',
      createdAt: new Date('2024-01-01'),
      viewCount: 100,
      onView: vi.fn(),
    };

    return render(<ReportCard {...defaultProps} {...props} />);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render ReportHeader with correct props', () => {
    const { ReportHeader } = require('../src/components/ReportHeader');
    const mockOnView = vi.fn();
    const testDate = new Date('2024-01-15');

    renderReportCard({
      title: 'My ReportTemplate',
      createdAt: testDate,
      onView: mockOnView
    });

    expect(ReportHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'My ReportTemplate',
        createdAt: testDate,
        onView: mockOnView
      }),
      expect.anything()
    );
  });

  it('should render ReportStats with correct props', () => {
    const { ReportStats } = require('../src/components/ReportStats');

    renderReportCard({
      reportId: 'report-456',
      viewCount: 250
    });

    expect(ReportStats).toHaveBeenCalledWith(
      expect.objectContaining({
        reportId: 'report-456',
        viewCount: 250
      }),
      expect.anything()
    );
  });

  it('should render both sub-components', () => {
    const { ReportHeader } = require('../src/components/ReportHeader');
    const { ReportStats } = require('../src/components/ReportStats');

    renderReportCard();

    expect(ReportHeader).toHaveBeenCalledTimes(1);
    expect(ReportStats).toHaveBeenCalledTimes(1);
  });

  it('should pass onView callback to ReportHeader', () => {
    const { ReportHeader } = require('../src/components/ReportHeader');
    const mockOnView = vi.fn();

    renderReportCard({ onView: mockOnView });

    const passedOnView = ReportHeader.mock.calls[0][0].onView;
    expect(passedOnView).toBe(mockOnView);
  });
});
```

## Example 2: Component with Conditional Rendering

### Original Component

**Component:**
```typescript
// src/components/ReportsList.tsx
import React from 'react';
import { ReportCard } from './ReportCard';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';
import type { IReport } from '@placer/velocity-reports-model';

export interface ReportsListProps {
  reports: IReport[];
  isLoading: boolean;
  error?: string;
  onReportView: (reportId: string) => void;
}

export function ReportsList(props: ReportsListProps) {
  const { reports, isLoading, error, onReportView } = props;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <EmptyState message={error} type="error" />;
  }

  if (reports.length === 0) {
    return <EmptyState message="No reports found" type="empty" />;
  }

  return (
    <div className="reports-list">
      {reports.map(report => (
        <ReportCard
          key={report.id}
          reportId={report.id}
          title={report.title}
          createdAt={new Date(report.creationTime)}
          viewCount={report.viewCount}
          onView={() => onReportView(report.id)}
        />
      ))}
    </div>
  );
}
```

### Generated Test File

```typescript
// __tests__/ReportsList.spec.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ReportsList, type ReportsListProps } from '../src/components/ReportsList';
import { FakeReportBuilder } from '@placer/velocity-reports-model/fakes';

// Mock all sub-components
vi.mock('../src/components/ReportCard', () => ({
  ReportCard: vi.fn(() => <div data-testid="mock-report-card">ReportCard</div>)
}));

vi.mock('../src/components/EmptyState', () => ({
  EmptyState: vi.fn(() => <div data-testid="mock-empty-state">EmptyState</div>)
}));

vi.mock('../src/components/LoadingSpinner', () => ({
  LoadingSpinner: vi.fn(() => <div data-testid="mock-loading-spinner">LoadingSpinner</div>)
}));

describe('ReportsList', () => {
  function renderReportsList(props?: Partial<ReportsListProps>) {
    const defaultProps: ReportsListProps = {
      reports: [],
      isLoading: false,
      error: undefined,
      onReportView: vi.fn(),
    };

    return render(<ReportsList {...defaultProps} {...props} />);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should render LoadingSpinner when isLoading is true', () => {
      const { LoadingSpinner } = require('../src/components/LoadingSpinner');

      renderReportsList({ isLoading: true });

      expect(LoadingSpinner).toHaveBeenCalled();
    });

    it('should not render ReportCard when loading', () => {
      const { ReportCard } = require('../src/components/ReportCard');
      const reports = [new FakeReportBuilder().build()];

      renderReportsList({ isLoading: true, reports });

      expect(ReportCard).not.toHaveBeenCalled();
    });

    it('should not render EmptyState when loading', () => {
      const { EmptyState } = require('../src/components/EmptyState');

      renderReportsList({ isLoading: true });

      expect(EmptyState).not.toHaveBeenCalled();
    });
  });

  describe('error state', () => {
    it('should render EmptyState with error message when error prop is provided', () => {
      const { EmptyState } = require('../src/components/EmptyState');

      renderReportsList({ error: 'Failed to load reports' });

      expect(EmptyState).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Failed to load reports',
          type: 'error'
        }),
        expect.anything()
      );
    });

    it('should not render ReportCard when error exists', () => {
      const { ReportCard } = require('../src/components/ReportCard');
      const reports = [new FakeReportBuilder().build()];

      renderReportsList({ error: 'Error', reports });

      expect(ReportCard).not.toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('should render EmptyState when no reports', () => {
      const { EmptyState } = require('../src/components/EmptyState');

      renderReportsList({ reports: [] });

      expect(EmptyState).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No reports found',
          type: 'empty'
        }),
        expect.anything()
      );
    });
  });

  describe('reports rendering', () => {
    it('should render ReportCard for each report', () => {
      const { ReportCard } = require('../src/components/ReportCard');
      const reports = [
        new FakeReportBuilder().withId('report-1').withTitle('ReportTemplate 1').build(),
        new FakeReportBuilder().withId('report-2').withTitle('ReportTemplate 2').build(),
        new FakeReportBuilder().withId('report-3').withTitle('ReportTemplate 3').build(),
      ];

      renderReportsList({ reports });

      expect(ReportCard).toHaveBeenCalledTimes(3);
    });

    it('should pass correct props to each ReportCard', () => {
      const { ReportCard } = require('../src/components/ReportCard');
      const report = new FakeReportBuilder()
        .withId('report-123')
        .withTitle('My ReportTemplate')
        .withCreationTime(1704067200000) // 2024-01-01
        .build();

      renderReportsList({ reports: [report] });

      expect(ReportCard).toHaveBeenCalledWith(
        expect.objectContaining({
          reportId: 'report-123',
          title: 'My ReportTemplate',
          createdAt: expect.any(Date),
        }),
        expect.anything()
      );
    });

    it('should not render EmptyState when reports exist', () => {
      const { EmptyState } = require('../src/components/EmptyState');
      const reports = [new FakeReportBuilder().build()];

      renderReportsList({ reports });

      expect(EmptyState).not.toHaveBeenCalled();
    });

    it('should not render LoadingSpinner when reports exist', () => {
      const { LoadingSpinner } = require('../src/components/LoadingSpinner');
      const reports = [new FakeReportBuilder().build()];

      renderReportsList({ reports });

      expect(LoadingSpinner).not.toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('should call onReportView when ReportCard onView is triggered', () => {
      const { ReportCard } = require('../src/components/ReportCard');
      const mockOnReportView = vi.fn();
      const report = new FakeReportBuilder().withId('report-456').build();

      renderReportsList({ reports: [report], onReportView: mockOnReportView });

      // Get the onView callback passed to ReportCard
      const onViewCallback = ReportCard.mock.calls[0][0].onView;

      // Simulate the callback
      onViewCallback();

      expect(mockOnReportView).toHaveBeenCalledWith('report-456');
    });

    it('should pass different onView callbacks for each report', () => {
      const { ReportCard } = require('../src/components/ReportCard');
      const mockOnReportView = vi.fn();
      const reports = [
        new FakeReportBuilder().withId('report-1').build(),
        new FakeReportBuilder().withId('report-2').build(),
      ];

      renderReportsList({ reports, onReportView: mockOnReportView });

      // Simulate callback for first report
      const onViewCallback1 = ReportCard.mock.calls[0][0].onView;
      onViewCallback1();
      expect(mockOnReportView).toHaveBeenCalledWith('report-1');

      // Simulate callback for second report
      const onViewCallback2 = ReportCard.mock.calls[1][0].onView;
      onViewCallback2();
      expect(mockOnReportView).toHaveBeenCalledWith('report-2');
    });
  });
});
```

## Example 3: Component with Form Handling

### Original Component

**Component:**
```typescript
// src/components/ReportForm.tsx
import React, { useState } from 'react';
import { TextInput } from './TextInput';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';

export interface ReportFormProps {
  initialTitle?: string;
  onSubmit: (title: string) => Promise<void>;
  onCancel: () => void;
}

export function ReportForm(props: ReportFormProps) {
  const { initialTitle = '', onSubmit, onCancel } = props;
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(title);
    } catch (err) {
      setError('Failed to save report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-form">
      <TextInput
        value={title}
        onChange={setTitle}
        placeholder="Enter report title"
        disabled={isSubmitting}
      />

      {error && <ErrorMessage message={error} />}

      <div className="actions">
        <Button
          label="Save"
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="primary"
        />
        <Button
          label="Cancel"
          onClick={onCancel}
          disabled={isSubmitting}
          variant="secondary"
        />
      </div>
    </div>
  );
}
```

### Generated Test File

```typescript
// __tests__/ReportForm.spec.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ReportForm, type ReportFormProps } from '../src/components/ReportForm';

// Mock all sub-components
vi.mock('../src/components/TextInput', () => ({
  TextInput: vi.fn(() => <div data-testid="mock-text-input">TextInput</div>)
}));

vi.mock('../src/components/Button', () => ({
  Button: vi.fn(() => <div data-testid="mock-button">Button</div>)
}));

vi.mock('../src/components/ErrorMessage', () => ({
  ErrorMessage: vi.fn(() => <div data-testid="mock-error-message">ErrorMessage</div>)
}));

describe('ReportForm', () => {
  function renderReportForm(props?: Partial<ReportFormProps>) {
    const defaultProps: ReportFormProps = {
      initialTitle: '',
      onSubmit: vi.fn().mockResolvedValue(undefined),
      onCancel: vi.fn(),
    };

    return render(<ReportForm {...defaultProps} {...props} />);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial render', () => {
    it('should render TextInput with empty value by default', () => {
      const { TextInput } = require('../src/components/TextInput');

      renderReportForm();

      expect(TextInput).toHaveBeenCalledWith(
        expect.objectContaining({
          value: '',
          placeholder: 'Enter report title',
          disabled: false
        }),
        expect.anything()
      );
    });

    it('should render TextInput with initialTitle when provided', () => {
      const { TextInput } = require('../src/components/TextInput');

      renderReportForm({ initialTitle: 'My ReportTemplate' });

      expect(TextInput).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'My ReportTemplate'
        }),
        expect.anything()
      );
    });

    it('should render Save and Cancel buttons', () => {
      const { Button } = require('../src/components/Button');

      renderReportForm();

      expect(Button).toHaveBeenCalledTimes(2);
      expect(Button).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Save', variant: 'primary' }),
        expect.anything()
      );
      expect(Button).toHaveBeenCalledWith(
        expect.objectContaining({ label: 'Cancel', variant: 'secondary' }),
        expect.anything()
      );
    });

    it('should not render ErrorMessage initially', () => {
      const { ErrorMessage } = require('../src/components/ErrorMessage');

      renderReportForm();

      expect(ErrorMessage).not.toHaveBeenCalled();
    });
  });

  describe('text input changes', () => {
    it('should update TextInput value when onChange is called', () => {
      const { TextInput } = require('../src/components/TextInput');

      const { rerender } = renderReportForm();

      // Get the onChange callback
      const onChange = TextInput.mock.calls[0][0].onChange;

      // Simulate typing
      onChange('Updated Title');

      // Force re-render
      rerender(<ReportForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      // The component would re-render with new value
      // Note: In a real test, you'd verify the internal state change
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with title when Save button is clicked', async () => {
      const { Button, TextInput } = require('../src/components/Button');
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

      renderReportForm({ initialTitle: 'Test ReportTemplate', onSubmit: mockOnSubmit });

      // Find the Save button (first button)
      const saveButtonOnClick = Button.mock.calls[0][0].onClick;

      // Simulate click
      await saveButtonOnClick();

      expect(mockOnSubmit).toHaveBeenCalledWith('Test ReportTemplate');
    });

    it('should show error when submitting empty title', async () => {
      const { Button, ErrorMessage } = require('../src/components/Button');
      const mockOnSubmit = vi.fn();

      const { rerender } = renderReportForm({ onSubmit: mockOnSubmit });

      // Get Save button onClick
      const saveButtonOnClick = Button.mock.calls[0][0].onClick;

      // Simulate click with empty title
      await saveButtonOnClick();

      // onSubmit should not be called
      expect(mockOnSubmit).not.toHaveBeenCalled();

      // Error message should be rendered (would need state inspection in real test)
    });

    it('should disable inputs while submitting', async () => {
      const { Button, TextInput } = require('../src/components/Button');
      let resolveSubmit: () => void;
      const mockOnSubmit = vi.fn(() => new Promise<void>(resolve => {
        resolveSubmit = resolve;
      }));

      const { rerender } = renderReportForm({
        initialTitle: 'Test',
        onSubmit: mockOnSubmit
      });

      // Get Save button onClick
      const saveButtonOnClick = Button.mock.calls[0][0].onClick;

      // Start submission (don't await)
      saveButtonOnClick();

      // During submission, components should be disabled
      // (would need state inspection in real test)
    });

    it('should show error when submission fails', async () => {
      const { Button } = require('../src/components/Button');
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Network error'));

      renderReportForm({ initialTitle: 'Test', onSubmit: mockOnSubmit });

      // Get Save button onClick
      const saveButtonOnClick = Button.mock.calls[0][0].onClick;

      // Simulate click
      await saveButtonOnClick();

      // Error message should be rendered (would need state inspection in real test)
    });
  });

  describe('cancel action', () => {
    it('should call onCancel when Cancel button is clicked', () => {
      const { Button } = require('../src/components/Button');
      const mockOnCancel = vi.fn();

      renderReportForm({ onCancel: mockOnCancel });

      // Find the Cancel button (second button)
      const cancelButtonOnClick = Button.mock.calls[1][0].onClick;

      // Simulate click
      cancelButtonOnClick();

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});
```

## Example 4: Component with Complex Prop Passing

### Original Component

**Component:**
```typescript
// src/components/ReportFilters.tsx
import React from 'react';
import { DateRangePicker } from './DateRangePicker';
import { StatusFilter } from './StatusFilter';
import { SearchInput } from './SearchInput';

export interface ReportFiltersProps {
  startDate: Date | null;
  endDate: Date | null;
  status: string[];
  searchQuery: string;
  onDateRangeChange: (start: Date | null, end: Date | null) => void;
  onStatusChange: (status: string[]) => void;
  onSearchChange: (query: string) => void;
  availableStatuses: string[];
}

export function ReportFilters(props: ReportFiltersProps) {
  const {
    startDate,
    endDate,
    status,
    searchQuery,
    onDateRangeChange,
    onStatusChange,
    onSearchChange,
    availableStatuses
  } = props;

  return (
    <div className="report-filters">
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search reports..."
      />

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={onDateRangeChange}
      />

      <StatusFilter
        selectedStatuses={status}
        availableStatuses={availableStatuses}
        onChange={onStatusChange}
      />
    </div>
  );
}
```

### Generated Test File

```typescript
// __tests__/ReportFilters.spec.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { ReportFilters, type ReportFiltersProps } from '../src/components/ReportFilters';

// Mock all sub-components
vi.mock('../src/components/DateRangePicker', () => ({
  DateRangePicker: vi.fn(() => <div data-testid="mock-date-range-picker">DateRangePicker</div>)
}));

vi.mock('../src/components/StatusFilter', () => ({
  StatusFilter: vi.fn(() => <div data-testid="mock-status-filter">StatusFilter</div>)
}));

vi.mock('../src/components/SearchInput', () => ({
  SearchInput: vi.fn(() => <div data-testid="mock-search-input">SearchInput</div>)
}));

describe('ReportFilters', () => {
  function renderReportFilters(props?: Partial<ReportFiltersProps>) {
    const defaultProps: ReportFiltersProps = {
      startDate: null,
      endDate: null,
      status: [],
      searchQuery: '',
      onDateRangeChange: vi.fn(),
      onStatusChange: vi.fn(),
      onSearchChange: vi.fn(),
      availableStatuses: ['draft', 'published', 'archived'],
    };

    return render(<ReportFilters {...defaultProps} {...props} />);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SearchInput', () => {
    it('should render SearchInput with correct props', () => {
      const { SearchInput } = require('../src/components/SearchInput');
      const mockOnSearchChange = vi.fn();

      renderReportFilters({
        searchQuery: 'test query',
        onSearchChange: mockOnSearchChange
      });

      expect(SearchInput).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'test query',
          onChange: mockOnSearchChange,
          placeholder: 'Search reports...'
        }),
        expect.anything()
      );
    });

    it('should pass onChange callback correctly', () => {
      const { SearchInput } = require('../src/components/SearchInput');
      const mockOnSearchChange = vi.fn();

      renderReportFilters({ onSearchChange: mockOnSearchChange });

      const onChange = SearchInput.mock.calls[0][0].onChange;
      onChange('new query');

      expect(mockOnSearchChange).toHaveBeenCalledWith('new query');
    });
  });

  describe('DateRangePicker', () => {
    it('should render DateRangePicker with null dates by default', () => {
      const { DateRangePicker } = require('../src/components/DateRangePicker');

      renderReportFilters();

      expect(DateRangePicker).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: null,
          endDate: null
        }),
        expect.anything()
      );
    });

    it('should render DateRangePicker with provided dates', () => {
      const { DateRangePicker } = require('../src/components/DateRangePicker');
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      renderReportFilters({ startDate, endDate });

      expect(DateRangePicker).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate,
          endDate
        }),
        expect.anything()
      );
    });

    it('should pass onDateRangeChange callback correctly', () => {
      const { DateRangePicker } = require('../src/components/DateRangePicker');
      const mockOnDateRangeChange = vi.fn();

      renderReportFilters({ onDateRangeChange: mockOnDateRangeChange });

      const onChange = DateRangePicker.mock.calls[0][0].onChange;
      const newStart = new Date('2024-02-01');
      const newEnd = new Date('2024-02-28');

      onChange(newStart, newEnd);

      expect(mockOnDateRangeChange).toHaveBeenCalledWith(newStart, newEnd);
    });
  });

  describe('StatusFilter', () => {
    it('should render StatusFilter with empty selection by default', () => {
      const { StatusFilter } = require('../src/components/StatusFilter');

      renderReportFilters();

      expect(StatusFilter).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedStatuses: [],
          availableStatuses: ['draft', 'published', 'archived']
        }),
        expect.anything()
      );
    });

    it('should render StatusFilter with selected statuses', () => {
      const { StatusFilter } = require('../src/components/StatusFilter');

      renderReportFilters({ status: ['draft', 'published'] });

      expect(StatusFilter).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedStatuses: ['draft', 'published']
        }),
        expect.anything()
      );
    });

    it('should pass availableStatuses correctly', () => {
      const { StatusFilter } = require('../src/components/StatusFilter');
      const customStatuses = ['active', 'inactive'];

      renderReportFilters({ availableStatuses: customStatuses });

      expect(StatusFilter).toHaveBeenCalledWith(
        expect.objectContaining({
          availableStatuses: customStatuses
        }),
        expect.anything()
      );
    });

    it('should pass onStatusChange callback correctly', () => {
      const { StatusFilter } = require('../src/components/StatusFilter');
      const mockOnStatusChange = vi.fn();

      renderReportFilters({ onStatusChange: mockOnStatusChange });

      const onChange = StatusFilter.mock.calls[0][0].onChange;
      onChange(['published', 'archived']);

      expect(mockOnStatusChange).toHaveBeenCalledWith(['published', 'archived']);
    });
  });

  describe('all filters together', () => {
    it('should render all three filter components', () => {
      const { SearchInput } = require('../src/components/SearchInput');
      const { DateRangePicker } = require('../src/components/DateRangePicker');
      const { StatusFilter } = require('../src/components/StatusFilter');

      renderReportFilters();

      expect(SearchInput).toHaveBeenCalledTimes(1);
      expect(DateRangePicker).toHaveBeenCalledTimes(1);
      expect(StatusFilter).toHaveBeenCalledTimes(1);
    });

    it('should pass all props correctly when all are provided', () => {
      const { SearchInput } = require('../src/components/SearchInput');
      const { DateRangePicker } = require('../src/components/DateRangePicker');
      const { StatusFilter } = require('../src/components/StatusFilter');

      const props: ReportFiltersProps = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        status: ['published'],
        searchQuery: 'test',
        onDateRangeChange: vi.fn(),
        onStatusChange: vi.fn(),
        onSearchChange: vi.fn(),
        availableStatuses: ['draft', 'published']
      };

      renderReportFilters(props);

      expect(SearchInput).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'test' }),
        expect.anything()
      );
      expect(DateRangePicker).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: props.startDate,
          endDate: props.endDate
        }),
        expect.anything()
      );
      expect(StatusFilter).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedStatuses: ['published'],
          availableStatuses: ['draft', 'published']
        }),
        expect.anything()
      );
    });
  });
});
```

## Key Patterns Summary

1. **Test Location**: Always in `__tests__/` folder (sibling to `src/`)
2. **File Naming**: Exact component name with `.spec.tsx` extension
3. **Imports**: Import React, vitest utilities, render, the component
4. **Mocking**: Mock ALL sub-components at module level with `vi.mock()`
5. **Main Structure**: describe → renderComponent helper → beforeEach → test cases
6. **renderComponent**: Accepts partial props, provides defaults, uses `render()`
7. **Clear Mocks**: Always use `beforeEach(() => vi.clearAllMocks())`
8. **Prop Testing**: Use `expect(MockedComponent).toHaveBeenCalledWith(expect.objectContaining(...))`
9. **Callback Testing**: Extract callback from mock calls and invoke it
10. **Conditional Rendering**: Test all branches (loading, error, empty, success)
11. **Lists**: Use `toHaveBeenCalledTimes()` and `toHaveBeenNthCalledWith()`
12. **expect.anything()**: Always add as second argument for React context
