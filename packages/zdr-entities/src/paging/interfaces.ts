import type { IReadablePropEventBroker } from '../interfaces';
import type { LoadingState } from '../EventBrokers';

export interface IPagedResult<T, TPageToken> {
  items: T[];
  nextPageToken: TPageToken | null;
}

export interface IPagedList<T> {
  items: IReadablePropEventBroker<readonly T[]>;
  loadingState: IReadablePropEventBroker<LoadingState>;
  hasMore: IReadablePropEventBroker<boolean>;
  error: IReadablePropEventBroker<unknown | undefined>;

  getItems(): readonly T[];
  loadNextPage(): Promise<void>;
  reset(): void;
  dispose(): void;
}

export interface IOffsetPageToken {
  offset: number;
  limit: number;
}

export interface IOffsetPageResult<T> {
  items: T[];
  hasMore?: boolean;
}
