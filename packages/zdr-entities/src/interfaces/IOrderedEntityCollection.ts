import type { IRestorablePropEventBroker } from './IRestorablePropEventBroker';
import type { Paging } from './Paging';
import type { IEntity } from './IEntity';
import type { IEntityCollectionBase, AddItemsOptions } from './IEntityCollectionBase';

export interface OrderedAddItemsOptions extends AddItemsOptions {
  startIndex?: number;
}

export interface IOrderedEntityCollection<T extends IEntity> extends IEntityCollectionBase<T> {
  order: IRestorablePropEventBroker<string[] | undefined>;

  moveItem(itemId: string, newIndex: number): void;
  getItemAt(index: number): T | undefined;
  getItemOrderIndex(itemId: string): number;
  getPagedItems(page: Paging): T[];
  addItems(items: T[], options?: OrderedAddItemsOptions): void;
  sort(compareFn: (a: T, b: T) => number): void;
}