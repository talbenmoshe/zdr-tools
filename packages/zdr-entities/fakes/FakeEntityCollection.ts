import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';
import type {
  IEntityCollection,
  IEntity
} from '../src/interfaces';
import {
  FakeEntityCollectionBase,
  FakeEntityCollectionBaseBuilder,
  type IFakeEntityCollectionBaseInitialData
} from './FakeEntityCollectionBase';

export class FakeEntityCollection<T extends IEntity>
  extends FakeEntityCollectionBase<T>
  implements IEntityCollection<T> {
  constructor(
    private orderedCollectionInitialData: IFakeEntityCollectionBaseInitialData<T>
  ) {
    super(orderedCollectionInitialData);
  }

  getItems = getMockingFunction<() => T[]>(
    () =>
      this.orderedCollectionInitialData.getItemsValue
  );
  // Simple unordered entity collection - no additional methods beyond the base
}

export class FakeEntityCollectionBuilder<
  T extends IEntity
> extends FakeEntityCollectionBaseBuilder<T> {
  build(): FakeEntityCollection<T> {
    return new FakeEntityCollection<T>(
      this.getCollectionBaseInitialData()
    );
  }
}