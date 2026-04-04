import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { describe, expect, it, vi } from 'vitest';
import {
  AdvancedEventEmitter,
  LoadingState,
  LoadingStateBroker,
  PropEventBroker,
  type IPagedList
} from '@zdr-tools/zdr-entities';
import { usePagedList } from '../src/hooks/usePagedList';

class TestPagedList<T> extends AdvancedEventEmitter implements IPagedList<T> {
  readonly items: PropEventBroker<readonly T[]>;
  readonly loadingState: LoadingStateBroker;
  readonly hasMore: PropEventBroker<boolean>;
  readonly error: PropEventBroker<unknown | undefined>;

  readonly loadNextPage = vi.fn(async () => {});
  readonly reset = vi.fn(() => {});
  readonly dispose = vi.fn(() => {});

  constructor(initialItems: readonly T[] = []) {
    super();
    this.items = new PropEventBroker(this, initialItems);
    this.loadingState = new LoadingStateBroker(this);
    this.hasMore = new PropEventBroker(this, true);
    this.error = new PropEventBroker<unknown | undefined>(this, undefined);
  }

  getItems(): readonly T[] {
    return this.items.get();
  }
}

function HookProbe({ pagedList }: { pagedList: IPagedList<string> }) {
  const result = usePagedList(pagedList);

  return (
    <div>
      <div data-hook="items">{result.items.join(',')}</div>
      <div data-hook="loading">{String(result.isLoading)}</div>
      <div data-hook="is-error">{String(result.isError)}</div>
      <div data-hook="error">{String(result.error ?? '')}</div>
      <div data-hook="has-more">{String(result.hasMore)}</div>
      <button data-hook="load-more" onClick={() => void result.loadMore()} />
      <button data-hook="reset" onClick={result.reset} />
    </div>
  );
}

describe('usePagedList', () => {
  it('reads the reactive paged list state and does not auto-load on mount', () => {
    const pagedList = new TestPagedList<string>(['a']);
    const container = document.createElement('div');

    act(() => {
      ReactDOM.render(<HookProbe pagedList={pagedList} />, container);
    });

    expect(container.querySelector('[data-hook="items"]')?.textContent).toBe('a');
    expect(container.querySelector('[data-hook="loading"]')?.textContent).toBe('false');
    expect(container.querySelector('[data-hook="has-more"]')?.textContent).toBe('true');
    expect(pagedList.loadNextPage).not.toHaveBeenCalled();

    ReactDOM.unmountComponentAtNode(container);
  });

  it('re-renders when broker values change, including items changes', () => {
    const pagedList = new TestPagedList<string>(['a']);
    const container = document.createElement('div');

    act(() => {
      ReactDOM.render(<HookProbe pagedList={pagedList} />, container);
    });

    act(() => {
      pagedList.items.set(['a', 'b']);
      pagedList.loadingState.setLoading();
      pagedList.error.set(new Error('boom'));
      pagedList.hasMore.set(false);
    });

    expect(container.querySelector('[data-hook="items"]')?.textContent).toBe('a,b');
    expect(container.querySelector('[data-hook="loading"]')?.textContent).toBe('true');
    expect(container.querySelector('[data-hook="is-error"]')?.textContent).toBe('false');
    expect(container.querySelector('[data-hook="has-more"]')?.textContent).toBe('false');

    act(() => {
      pagedList.loadingState.setError();
    });

    expect(container.querySelector('[data-hook="is-error"]')?.textContent).toBe('true');
    expect(container.querySelector('[data-hook="error"]')?.textContent).toContain('boom');

    ReactDOM.unmountComponentAtNode(container);
  });

  it('delegates load and reset actions to the paged list instance', () => {
    const pagedList = new TestPagedList<string>();
    const container = document.createElement('div');

    act(() => {
      ReactDOM.render(<HookProbe pagedList={pagedList} />, container);
    });

    const loadMoreButton = container.querySelector('[data-hook="load-more"]') as HTMLButtonElement;
    const resetButton = container.querySelector('[data-hook="reset"]') as HTMLButtonElement;

    act(() => {
      loadMoreButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      resetButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(pagedList.loadNextPage).toHaveBeenCalledTimes(1);
    expect(pagedList.reset).toHaveBeenCalledTimes(1);

    ReactDOM.unmountComponentAtNode(container);
  });
});
