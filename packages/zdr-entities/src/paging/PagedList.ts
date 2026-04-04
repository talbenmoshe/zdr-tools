import { AdvancedEventEmitter } from '@zdr-tools/zdr-native-tools';
import {
  LoadingState,
  LoadingStateBroker,
  PropEventBroker
} from '../EventBrokers';
import type {
  IPagedList,
  IPagedResult
} from './interfaces';

function createReadonlyItems<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export abstract class PagedList<T, TPageToken>
  extends AdvancedEventEmitter
  implements IPagedList<T> {
  readonly items: PropEventBroker<readonly T[]>;
  readonly loadingState: LoadingStateBroker;
  readonly hasMore: PropEventBroker<boolean>;
  readonly error: PropEventBroker<unknown | undefined>;

  private nextPageToken: TPageToken | null;
  private inFlightPromise?: Promise<void>;
  private generation = 0;
  private isDisposed = false;

  constructor() {
    super();

    this.items = new PropEventBroker(this, createReadonlyItems<T>([]));
    this.loadingState = new LoadingStateBroker(this);
    this.hasMore = new PropEventBroker(this, true);
    this.error = new PropEventBroker<unknown | undefined>(this, undefined);
    this.nextPageToken = null;
  }

  protected abstract fetchPage(pageToken: TPageToken | null): Promise<IPagedResult<T, TPageToken>>;

  protected getInitialPageToken(): TPageToken | null {
    return null;
  }

  protected onReset(): void {
    // Subclasses can override to clear transport-level state.
  }

  protected onDispose(): void {
    // Subclasses can override to release transport-level resources.
  }

  getItems(): readonly T[] {
    return createReadonlyItems(this.items.get());
  }

  loadNextPage(): Promise<void> {
    if (this.isDisposed || !this.hasMore.get()) {
      return Promise.resolve();
    }

    if (this.inFlightPromise) {
      return this.inFlightPromise;
    }

    this.error.set(undefined);
    this.loadingState.setLoading();

    const requestGeneration = this.generation;
    const requestPageToken = this.nextPageToken;
    const requestPromise = this.fetchPage(requestPageToken)
      .then(result => {
        if (this.shouldIgnoreRequestResult(requestGeneration)) {
          return;
        }

        this.items.set(
          createReadonlyItems([
            ...this.items.get(),
            ...result.items
          ])
        );
        this.nextPageToken = result.nextPageToken;
        this.hasMore.set(result.nextPageToken !== null);
        this.loadingState.setDone();
      })
      .catch(error => {
        if (this.shouldIgnoreRequestResult(requestGeneration)) {
          return;
        }

        this.error.set(error);
        this.loadingState.setError();
        throw error;
      })
      .finally(() => {
        if (this.inFlightPromise === requestPromise) {
          this.inFlightPromise = undefined;
        }
      });

    this.inFlightPromise = requestPromise;

    return requestPromise;
  }

  reset(): void {
    if (this.isDisposed) {
      return;
    }

    this.generation++;
    this.nextPageToken = this.getInitialPageToken();
    this.items.set(createReadonlyItems<T>([]));
    this.hasMore.set(true);
    this.error.set(undefined);
    this.loadingState.setIdle();
    this.onReset();
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.generation++;
    this.isDisposed = true;
    this.inFlightPromise = undefined;
    this.loadingState.setIdle();
    this.onDispose();
  }

  private shouldIgnoreRequestResult(requestGeneration: number): boolean {
    return this.isDisposed || this.generation !== requestGeneration;
  }
}
