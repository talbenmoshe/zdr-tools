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
  orderValue: IRestorablePropEventBroker<string[] | undefined, string>;
  getOrderIndexValue: number;
}

export class FakeOrderedEntityCollection<T extends IEntity>
  extends FakeEntityCollectionBase<T>
  implements IOrderedEntityCollection<T> {
  order: IRestorablePropEventBroker<string[] | undefined, string>;

  constructor(
    private orderedCollectionInitialData: IFakeOrderedEntityCollectionInitialData<T>
  ) {
    super(orderedCollectionInitialData);
    this.order = this.orderedCollectionInitialData.orderValue;
  }

  getItems = getMockingFunction<() => T[]>(
    () =>
      this.orderedCollectionInitialData.getItemsValue
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
    () => this.orderedCollectionInitialData.getItemsValue
  );
  sort = getMockingFunction<(compareFn: (a: T, b: T) => number) => void>();
}

export class FakeOrderedEntityCollectionBuilder<
  T extends IEntity
> extends FakeEntityCollectionBaseBuilder<T> {
  protected orderValue: IRestorablePropEventBroker<
    string[] | undefined,
    string
  > = new FakeRestorablePropEventBrokerBuilder<string[] | undefined, string>(
    undefined
  ).build();
  protected getOrderIndexValue: number = 0;

  withOrderValueProp(
    orderValueProp: IRestorablePropEventBroker<string[] | undefined, string>
  ): this {
    this.orderValue = orderValueProp;

    return this;
  }

  withOrderValueItems(orderValueItems: string[] | undefined): this {
    return this.withOrderValueProp(
      new FakeRestorablePropEventBrokerBuilder<string[] | undefined, string>(
        orderValueItems
      ).build()
    );
  }

  withGetOrderIndexValue(getOrderIndexValue: number): this {
    this.getOrderIndexValue = getOrderIndexValue;

    return this;
  }

  getOrderedCollectionInitialData(): IFakeOrderedEntityCollectionInitialData<T> {
    return {
      ...this.getCollectionBaseInitialData(),
      orderValue: this.orderValue,
      getOrderIndexValue: this.getOrderIndexValue
    };
  }

  build(): FakeOrderedEntityCollection<T> {
    return new FakeOrderedEntityCollection<T>(
      this.getOrderedCollectionInitialData()
    );
  }
}