import type {
  IEntityCollection,
  IEntity
} from '../src/interfaces';
import {
  FakeEntityCollectionBase,
  FakeEntityCollectionBaseBuilder
} from './FakeEntityCollectionBase';

export class FakeEntityCollection<T extends IEntity>
  extends FakeEntityCollectionBase<T>
  implements IEntityCollection<T> {
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