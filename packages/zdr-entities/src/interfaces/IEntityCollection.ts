import type { IEntity } from './IEntity';
import type { IEntityCollectionBase } from './IEntityCollectionBase';

export interface IEntityCollection<T extends IEntity> extends IEntityCollectionBase<T> {
  // Simple unordered entity collection - no additional methods beyond the base
}