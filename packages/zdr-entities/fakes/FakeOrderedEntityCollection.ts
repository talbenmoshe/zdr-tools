import type {
  IOrderedEntityCollection,
  IEntity,
  IRestorablePropEventBroker,
  OrderedAddItemsOptions,
  Paging
} from '../src/interfaces';
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';
import {
  FakeEntityCollectionBase,
  FakeEntityCollectionBaseBuilder,
  type IFakeEntityCollectionBaseInitialData
} from './FakeEntityCollectionBase';
import { FakeRestorablePropEventBrokerBuilder } from './FakeRestorablePropEventBroker';

export interface IFakeOrderedEntityCollectionInitialData<
  T extends IEntity
> extends IFakeEntityCollectionBaseInitialData<T> {
  orderValueProp: IRestorablePropEventBroker<string[] | undefined, string>;
  getOrderIndexValue: number;
  orderedItemsValue?: T[];
}

export class FakeOrderedEntityCollection<T extends IEntity>
  extends FakeEntityCollectionBase<T>
  implements IOrderedEntityCollection<T> {
  order: IRestorablePropEventBroker<string[] | undefined, string>;

  constructor(
    private orderedCollectionInitialData: IFakeOrderedEntityCollectionInitialData<T>
  ) {
    super(orderedCollectionInitialData);
    this.order = this.orderedCollectionInitialData.orderValueProp;
  }

  getItems = getMockingFunction<() => T[]>(
    () =>
      this.orderedCollectionInitialData.orderedItemsValue ??
      this.orderedCollectionInitialData.anyItems
  );
  addItems = getMockingFunction<(items: T[], options?: OrderedAddItemsOptions) => void>();
  moveItem = getMockingFunction<(itemId: string, newIndex: number) => void>();
  getItemAt = getMockingFunction<(index: number) => T | undefined>(
    () => this.orderedCollectionInitialData.getItemValue
  );
  getItemOrderIndex = getMockingFunction<(itemId: string) => number>(
    () => this.orderedCollectionInitialData.getOrderIndexValue
  );
  getPagedItems = getMockingFunction<(page: Paging) => T[]>(
    () => this.orderedCollectionInitialData.anyItems
  );
  sort = getMockingFunction<(compareFn: (a: T, b: T) => number) => void>();
}

export class FakeOrderedEntityCollectionBuilder<
  T extends IEntity
> extends FakeEntityCollectionBaseBuilder<T> {
  protected orderValueProp: IRestorablePropEventBroker<
    string[] | undefined,
    string
  > = new FakeRestorablePropEventBrokerBuilder<string[] | undefined, string>(
    undefined
  ).build();
  protected orderedItemsValue: T[] = [];
  protected getOrderIndexValue: number = 0;

  withOrderValueProp(
    orderValueProp: IRestorablePropEventBroker<string[] | undefined, string>
  ): this {
    this.orderValueProp = orderValueProp;

    return this;
  }

  withOrderValueItems(orderValueItems: string[] | undefined): this {
    return this.withOrderValueProp(
      new FakeRestorablePropEventBrokerBuilder<string[] | undefined, string>(
        orderValueItems
      ).build()
    );
  }

  withOrderedItemsValue(orderedItemsValue: T[]): this {
    this.orderedItemsValue = orderedItemsValue;

    return this;
  }

  withGetOrderIndexValue(getOrderIndexValue: number): this {
    this.getOrderIndexValue = getOrderIndexValue;

    return this;
  }

  getOrderedCollectionInitialData(): IFakeOrderedEntityCollectionInitialData<T> {
    return {
      ...this.getCollectionBaseInitialData(),
      orderValueProp: this.orderValueProp,
      orderedItemsValue: this.orderedItemsValue,
      getOrderIndexValue: this.getOrderIndexValue
    };
  }

  build(): FakeOrderedEntityCollection<T> {
    return new FakeOrderedEntityCollection<T>(
      this.getOrderedCollectionInitialData()
    );
  }
}