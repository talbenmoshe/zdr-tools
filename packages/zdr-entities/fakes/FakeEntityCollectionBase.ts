import type {
  IEntityCollectionBase,
  IEntity,
  IEventBroker,
  IItemEventData,
  IItemIdChangedEventData,
  IItemsEventData,
  AddItemsOptions
} from '../src/interfaces';
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';
import {
  FakeEntity,
  FakeEntityBuilder,
  type IFakeEntityInitialData
} from './FakeEntity';
import { FakeEventBrokerBuilder } from './FakeEventBroker';

export interface IFakeEntityCollectionBaseInitialData<
  T extends IEntity
> extends IFakeEntityInitialData {
  getItemValue: T | undefined;
  anyItems: T[];
  removeItemValue: T;
  isEmptyValue: boolean;

  // Optional for specific items testing
  getNewItemsValue?: T[];
  getOldItemsValue?: T[];
}

export abstract class FakeEntityCollectionBase<T extends IEntity>
  extends FakeEntity
  implements IEntityCollectionBase<T> {
  itemChanged: IEventBroker<IItemEventData<T>> = new FakeEventBrokerBuilder<IItemEventData<T>>().build();
  itemIdChanged: IEventBroker<IItemIdChangedEventData<T>> =
    new FakeEventBrokerBuilder<IItemIdChangedEventData<T>>().build();
  itemRemoved: IEventBroker<IItemEventData<T>> = new FakeEventBrokerBuilder<IItemEventData<T>>().build();
  itemsAdded: IEventBroker<IItemsEventData<T>> = new FakeEventBrokerBuilder<IItemsEventData<T>>().build();
  collectionChanged: IEventBroker = new FakeEventBrokerBuilder<any>().build();

  constructor(
    protected collectionInitialData: IFakeEntityCollectionBaseInitialData<T>
  ) {
    super(collectionInitialData);
  }

  getItem = getMockingFunction<(id: string) => T | undefined>(
    () => this.collectionInitialData.getItemValue
  );
  getNewItems = getMockingFunction<() => T[]>(
    () =>
      this.collectionInitialData.getNewItemsValue ??
      this.collectionInitialData.anyItems
  );
  addItems = getMockingFunction<(items: T[], options?: AddItemsOptions) => void>();
  removeItem = getMockingFunction<(id: string) => T>(
    () => this.collectionInitialData.removeItemValue
  );
  getItems = getMockingFunction<() => T[]>(
    () => this.collectionInitialData.anyItems
  );
  getOldItems = getMockingFunction<() => T[]>(
    () =>
      this.collectionInitialData.getOldItemsValue ??
      this.collectionInitialData.anyItems
  );
  isEmpty = getMockingFunction<() => boolean>(() => this.collectionInitialData.isEmptyValue);
  removeAllItems = getMockingFunction<() => void>();
  replaceAllItems = getMockingFunction<(items: T[]) => void>();
}

export abstract class FakeEntityCollectionBaseBuilder<
  T extends IEntity
> extends FakeEntityBuilder {
  protected getItemValue: T | undefined;
  protected anyItems: T[] = [];
  protected getNewItemsValue: T[] = [];
  protected getOldItemsValue: T[] = [];
  // @ts-ignore
  protected removeItemValue: T;
  protected isEmptyValue: boolean = false;

  withGetItemValue(getItemValue: T | undefined): this {
    this.getItemValue = getItemValue;

    return this;
  }

  withAnyItems(anyItems: T[]): this {
    this.anyItems = anyItems;

    return this;
  }

  withGetNewItemsValue(getNewItemsValue: T[]): this {
    this.getNewItemsValue = getNewItemsValue;

    return this;
  }

  withGetOldItemsValue(getOldItemsValue: T[]): this {
    this.getOldItemsValue = getOldItemsValue;

    return this;
  }

  withRemoveItemValue(removeItemValue: T): this {
    this.removeItemValue = removeItemValue;

    return this;
  }

  withIsEmptyValue(isEmptyValue: boolean): this {
    this.isEmptyValue = isEmptyValue;

    return this;
  }

  getCollectionBaseInitialData(): IFakeEntityCollectionBaseInitialData<T> {
    return {
      ...this.getInitialData(),
      getItemValue: this.getItemValue,
      anyItems: this.anyItems,
      removeItemValue: this.removeItemValue,
      isEmptyValue: this.isEmptyValue,
      getNewItemsValue: this.getNewItemsValue,
      getOldItemsValue: this.getOldItemsValue
    };
  }
}