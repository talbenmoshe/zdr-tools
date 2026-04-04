import type {
  IPagedList,
  IReadablePropEventBroker
} from '../src';
import { LoadingState } from '../src/EventBrokers/LoadingStateBroker';
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';
import { FakeReadablePropEventBrokerBuilder } from './FakeReadablePropEventBroker';

export interface IFakePagedListInitialData<T> {
  items: IReadablePropEventBroker<readonly T[]>;
  loadingState: IReadablePropEventBroker<LoadingState>;
  hasMore: IReadablePropEventBroker<boolean>;
  error: IReadablePropEventBroker<unknown | undefined>;
  getItems: readonly T[];
}

export class FakePagedList<T> implements IPagedList<T> {
  readonly items: IReadablePropEventBroker<readonly T[]>;
  readonly loadingState: IReadablePropEventBroker<LoadingState>;
  readonly hasMore: IReadablePropEventBroker<boolean>;
  readonly error: IReadablePropEventBroker<unknown | undefined>;

  constructor(
    private readonly initialData: IFakePagedListInitialData<T>
  ) {
    this.items = initialData.items;
    this.loadingState = initialData.loadingState;
    this.hasMore = initialData.hasMore;
    this.error = initialData.error;
  }

  getItems = getMockingFunction<() => readonly T[]>(() => {
    return this.initialData.getItems;
  });

  loadNextPage = getMockingFunction<() => Promise<void>>(async () => {});

  reset = getMockingFunction<() => void>(() => {});

  dispose = getMockingFunction<() => void>(() => {});
}

export class FakePagedListBuilder<T> {
  protected itemsValue: readonly T[] = [];
  protected itemsProp?: IReadablePropEventBroker<readonly T[]>;
  protected loadingStateValue!: IReadablePropEventBroker<LoadingState>;
  protected hasMoreValue: IReadablePropEventBroker<boolean> =
    new FakeReadablePropEventBrokerBuilder<boolean>(true).build();
  protected errorValue: IReadablePropEventBroker<unknown | undefined> =
    new FakeReadablePropEventBrokerBuilder<unknown | undefined>(undefined).build();

  withItemsProp(itemsProp: IReadablePropEventBroker<readonly T[]>): this {
    this.itemsProp = itemsProp;
    this.itemsValue = itemsProp.get();

    return this;
  }

  withItems(items: readonly T[]): this {
    this.itemsValue = items;

    return this;
  }

  withLoadingStateProp(loadingStateProp: IReadablePropEventBroker<LoadingState>): this {
    this.loadingStateValue = loadingStateProp;

    return this;
  }

  withHasMoreProp(hasMoreProp: IReadablePropEventBroker<boolean>): this {
    this.hasMoreValue = hasMoreProp;

    return this;
  }

  withHasMoreValue(hasMoreValue: boolean): this {
    this.hasMoreValue = new FakeReadablePropEventBrokerBuilder<boolean>(hasMoreValue).build();

    return this;
  }

  withErrorProp(errorProp: IReadablePropEventBroker<unknown | undefined>): this {
    this.errorValue = errorProp;

    return this;
  }

  withErrorValue(errorValue: unknown | undefined): this {
    this.errorValue = new FakeReadablePropEventBrokerBuilder<unknown | undefined>(errorValue).build();

    return this;
  }

  protected getInitialData(): IFakePagedListInitialData<T> {
    const items = this.itemsValue;
    const itemsProp = this.itemsProp ?? new FakeReadablePropEventBrokerBuilder<readonly T[]>(items).build();

    return {
      items: itemsProp,
      loadingState: this.loadingStateValue ?? new FakeReadablePropEventBrokerBuilder<LoadingState>(LoadingState.IDLE).build(),
      hasMore: this.hasMoreValue,
      error: this.errorValue,
      getItems: items
    };
  }

  build(): FakePagedList<T> {
    return new FakePagedList<T>(this.getInitialData());
  }
}
