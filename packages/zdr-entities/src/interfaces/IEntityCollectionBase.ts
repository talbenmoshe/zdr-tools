import type { IEventBroker } from './IEventBroker';
import type { IEntity, IdChangedEventData } from './IEntity';

export interface IItemEventData<T> {
  item: T;
}

export interface IItemsEventData<T> {
  items: T[];
}

export interface IItemIdChangedEventData<T> extends IItemEventData<T> {
  data: IdChangedEventData;
}

export interface AddItemsOptions {
  keepExistingItems?: boolean;
}

export interface IEntityCollectionBase<T extends IEntity> extends IEntity {
  itemChanged: IEventBroker<IItemEventData<T>>;
  itemIdChanged: IEventBroker<IItemIdChangedEventData<T>>;
  itemRemoved: IEventBroker<IItemEventData<T>>;
  itemsAdded: IEventBroker<IItemsEventData<T>>;
  collectionChanged: IEventBroker;

  getItem(id: string): T | undefined;
  getItems(): T[];
  getNewItems(): T[];
  getOldItems(): T[];
  addItems(items: T[], options?: AddItemsOptions): void;
  removeItem(id: string): T;
  isEmpty(): boolean;
  removeAllItems(): void;
  replaceAllItems(items: T[]): void;
}