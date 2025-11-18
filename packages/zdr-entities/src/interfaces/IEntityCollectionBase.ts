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

export type CollisionStrategyCallback<T extends IEntity> = (
  existingItem: T,
  newItem: T
) => T;

export interface AddItemsOptions<T extends IEntity = IEntity> {
  /**
   * @deprecated Use `collisionStrategy: 'keep'` instead. This property is maintained for backward compatibility.
   * - `keepExistingItems: true` is equivalent to `collisionStrategy: 'keep'`
   * - `keepExistingItems: false` is equivalent to `collisionStrategy: 'throw'`
   */
  keepExistingItems?: boolean;
  collisionStrategy?: 'throw' | 'replace' | 'keep' | CollisionStrategyCallback<T>;
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
  addItems(items: T[], options?: AddItemsOptions<T>): void;
  removeItem(id: string): T | undefined;
  isEmpty(): boolean;
  removeAllItems(): void;
  replaceAllItems(items: T[]): void;
}