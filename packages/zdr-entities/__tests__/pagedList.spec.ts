import { describe, expect, it, vi } from 'vitest';
import {
  CursorPagedList,
  LoadingState,
  OffsetPagedList,
  type IOffsetPageResult,
  type IOffsetPageToken,
  type IPagedResult
} from '../src';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error?: unknown) => void;

  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  return {
    promise,
    resolve,
    reject
  };
}

class TestCursorPagedList extends CursorPagedList<string> {
  readonly fetchPageByCursor = vi.fn<(cursor: string | null) => Promise<IPagedResult<string, string>>>();
  onResetSpy = vi.fn();
  onDisposeSpy = vi.fn();

  protected override onReset(): void {
    this.onResetSpy();
  }

  protected override onDispose(): void {
    this.onDisposeSpy();
  }
}

class TestOffsetPagedList extends OffsetPagedList<string> {
  readonly fetchPageByOffset = vi.fn<(page: IOffsetPageToken) => Promise<IOffsetPageResult<string>>>();

  constructor(pageSize = 2) {
    super(pageSize);
  }
}

describe('PagedList', () => {
  it('starts with the expected initial state', () => {
    const pagedList = new TestCursorPagedList();

    expect(pagedList.getItems()).toEqual([]);
    expect(pagedList.items.get()).toEqual([]);
    expect(pagedList.loadingState.get()).toBe(LoadingState.IDLE);
    expect(pagedList.hasMore.get()).toBe(true);
    expect(pagedList.error.get()).toBeUndefined();
  });

  it('loads and accumulates cursor pages', async () => {
    const pagedList = new TestCursorPagedList();
    pagedList.fetchPageByCursor
      .mockResolvedValueOnce({ items: ['a', 'b'], nextPageToken: 'page-2' })
      .mockResolvedValueOnce({ items: ['c'], nextPageToken: null });

    await pagedList.loadNextPage();
    await pagedList.loadNextPage();

    expect(pagedList.fetchPageByCursor.mock.calls).toEqual([[null], ['page-2']]);
    expect(pagedList.getItems()).toEqual(['a', 'b', 'c']);
    expect(pagedList.loadingState.get()).toBe(LoadingState.DONE);
    expect(pagedList.hasMore.get()).toBe(false);
  });

  it('returns the same promise while a request is in flight', async () => {
    const pagedList = new TestCursorPagedList();
    const deferred = createDeferred<IPagedResult<string, string>>();
    pagedList.fetchPageByCursor.mockReturnValue(deferred.promise);

    const firstPromise = pagedList.loadNextPage();
    const secondPromise = pagedList.loadNextPage();

    expect(firstPromise).toBe(secondPromise);
    expect(pagedList.fetchPageByCursor).toHaveBeenCalledTimes(1);

    deferred.resolve({ items: ['a'], nextPageToken: null });
    await firstPromise;
  });

  it('preserves the page token on failure so the next call retries the same page', async () => {
    const pagedList = new TestCursorPagedList();
    pagedList.fetchPageByCursor
      .mockResolvedValueOnce({ items: ['a'], nextPageToken: 'page-2' })
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ items: ['b'], nextPageToken: null });

    await pagedList.loadNextPage();
    await expect(pagedList.loadNextPage()).rejects.toThrow('boom');
    await pagedList.loadNextPage();

    expect(pagedList.fetchPageByCursor.mock.calls).toEqual([[null], ['page-2'], ['page-2']]);
    expect(pagedList.getItems()).toEqual(['a', 'b']);
    expect(pagedList.error.get()).toBeUndefined();
    expect(pagedList.loadingState.get()).toBe(LoadingState.DONE);
  });

  it('reset clears state, calls the hook, and ignores stale results', async () => {
    const pagedList = new TestCursorPagedList();
    const deferred = createDeferred<IPagedResult<string, string>>();
    pagedList.fetchPageByCursor.mockReturnValue(deferred.promise);

    const loadPromise = pagedList.loadNextPage();
    pagedList.reset();

    expect(pagedList.onResetSpy).toHaveBeenCalledTimes(1);
    expect(pagedList.getItems()).toEqual([]);
    expect(pagedList.loadingState.get()).toBe(LoadingState.IDLE);
    expect(pagedList.hasMore.get()).toBe(true);
    expect(pagedList.error.get()).toBeUndefined();

    deferred.resolve({ items: ['late-item'], nextPageToken: null });
    await loadPromise;

    expect(pagedList.getItems()).toEqual([]);
    expect(pagedList.loadingState.get()).toBe(LoadingState.IDLE);
  });

  it('dispose ignores late results, calls the hook, and makes future loads a no-op', async () => {
    const pagedList = new TestCursorPagedList();
    const deferred = createDeferred<IPagedResult<string, string>>();
    pagedList.fetchPageByCursor.mockReturnValue(deferred.promise);

    const loadPromise = pagedList.loadNextPage();
    pagedList.dispose();

    expect(pagedList.onDisposeSpy).toHaveBeenCalledTimes(1);
    expect(pagedList.loadingState.get()).toBe(LoadingState.IDLE);

    deferred.resolve({ items: ['late-item'], nextPageToken: null });
    await loadPromise;
    await pagedList.loadNextPage();

    expect(pagedList.getItems()).toEqual([]);
    expect(pagedList.fetchPageByCursor).toHaveBeenCalledTimes(1);
  });
});

describe('OffsetPagedList', () => {
  it('starts from offset 0 and advances by the page size actually returned', async () => {
    const pagedList = new TestOffsetPagedList(2);
    pagedList.fetchPageByOffset
      .mockResolvedValueOnce({ items: ['a', 'b'] })
      .mockResolvedValueOnce({ items: ['c'] });

    await pagedList.loadNextPage();
    await pagedList.loadNextPage();

    expect(pagedList.fetchPageByOffset.mock.calls).toEqual([
      [{ offset: 0, limit: 2 }],
      [{ offset: 2, limit: 2 }]
    ]);
    expect(pagedList.getItems()).toEqual(['a', 'b', 'c']);
    expect(pagedList.hasMore.get()).toBe(true);
  });

  it('stops when the offset result explicitly says there is no more data', async () => {
    const pagedList = new TestOffsetPagedList(3);
    pagedList.fetchPageByOffset.mockResolvedValueOnce({
      items: ['a', 'b'],
      hasMore: false
    });

    await pagedList.loadNextPage();
    await pagedList.loadNextPage();

    expect(pagedList.fetchPageByOffset).toHaveBeenCalledTimes(1);
    expect(pagedList.hasMore.get()).toBe(false);
  });

  it('uses an empty page as a safety stop', async () => {
    const pagedList = new TestOffsetPagedList(2);
    pagedList.fetchPageByOffset.mockResolvedValueOnce({ items: [] });

    await pagedList.loadNextPage();

    expect(pagedList.hasMore.get()).toBe(false);
  });
});
