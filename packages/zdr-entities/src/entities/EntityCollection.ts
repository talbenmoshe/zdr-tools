import type {
  IEntityCollection,
  IEntity,
  AddItemsOptions
} from '../interfaces';
import { EntityCollectionBase } from './EntityCollectionBase';

export class EntityCollection<T extends IEntity>
  extends EntityCollectionBase<T>
  implements IEntityCollection<T> {
  constructor(name: string, items: T[]) {
    super(name, items);
  }

  addItems(items: T[], options?: AddItemsOptions): void {
    this.addBase(items, options);
  }

  getItems(): T[] {
    return this.items;
  }

  protected onItemsAdded(_itemsToAdd: T[]): void {
    // Default implementation does nothing for non-ordered collections
  }

  protected onItemRemoved(_itemToRemove: T): void {
    // Default implementation does nothing for non-ordered collections
  }
}