import { useCallback } from 'react';
import type { IPagedList } from '@zdr-tools/zdr-entities';
import { LoadingState } from '@zdr-tools/zdr-entities';
import { useReadableEventRefresher } from './useReadableEventRefresher';

export interface UsePagedListResult<T> {
  items: readonly T[];
  isLoading: boolean;
  isError: boolean;
  error: unknown | undefined;
  hasMore: boolean;
  loadMore(): Promise<void>;
  reset(): void;
}

export function usePagedList<T>(pagedList: IPagedList<T>): UsePagedListResult<T> {
  const [[items], [loadingState], [hasMore], [error]] = useReadableEventRefresher(
    pagedList.items,
    pagedList.loadingState,
    pagedList.hasMore,
    pagedList.error
  );

  const loadMore = useCallback(() => {
    return pagedList.loadNextPage();
  }, [pagedList]);

  const reset = useCallback(() => {
    pagedList.reset();
  }, [pagedList]);

  return {
    items,
    isLoading: loadingState === LoadingState.LOADING,
    isError: loadingState === LoadingState.ERROR,
    error,
    hasMore,
    loadMore,
    reset
  };
}
