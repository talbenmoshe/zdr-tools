import type {
  IEntityCollectionBase,
  IEventBroker,
  IPropertyChangedEventData,
  IItemEventData,
  IItemsEventData,
  IItemIdChangedEventData,
  AddItemsOptions,
  CollisionStrategyCallback,
  IEntity,
  IdChangedEventData
} from '../interfaces';
import { EventBroker } from '../EventBrokers';
import { EntityBase } from './EntityBase';

export abstract class EntityCollectionBase<T extends IEntity>
  extends EntityBase
  implements IEntityCollectionBase<T> {
  protected items: T[];
  private boundHandleIdChanged: (data: IdChangedEventData) => void;

  itemChanged: IEventBroker<IItemEventData<T>>;
  itemIdChanged: IEventBroker<IItemIdChangedEventData<T>>;
  itemRemoved: IEventBroker<IItemEventData<T>>;
  itemsAdded: IEventBroker<IItemsEventData<T>>;
  collectionChanged: IEventBroker;

  constructor(private name: string, items: T[]) {
    super(name);

    this.boundHandleIdChanged = this.handleIdChanged.bind(this);
    this.items = items;
    this.itemChanged = new EventBroker(this);
    this.itemIdChanged = new EventBroker(this);
    this.itemRemoved = new EventBroker(this);
    this.itemsAdded = new EventBroker(this);
    this.collectionChanged = new EventBroker(this);

    this.attachEvents();
  }

  getEntityName(): string {
    return this.name;
  }

  removeAllItems(): void {
    const allIds = this.items.map(item => item.getId());
    allIds.forEach(id => {
      this.removeItem(id);
    });
  }

  replaceAllItems(items: T[]): void {
    this.removeAllItems();
    this.addItems(items);
  }

  private throwCollisionStrategy(existingItem: T, _newItem: T): T {
    throw new Error(`Item with id ${existingItem.getId()} already exists`);
  }

  private keepCollisionStrategy(existingItem: T, _newItem: T): T {
    return existingItem;
  }

  private replaceCollisionStrategy(_existingItem: T, newItem: T): T {
    return newItem;
  }

  private normalizeCollisionStrategy(
    options?: AddItemsOptions<T>
  ): CollisionStrategyCallback<T> {
    // Convert keepExistingItems to collisionStrategy for backward compatibility
    const strategy = options?.collisionStrategy ?? (options?.keepExistingItems ? 'keep' : 'throw');
    let result: CollisionStrategyCallback<T>;

    // If it's a custom function, use it directly
    if (typeof strategy === 'function') {
      result = strategy;
    } else {
      // Map string strategies to their corresponding methods
      switch (strategy) {
        case 'keep':
          result = this.keepCollisionStrategy;
          break;

        case 'replace':
          result = this.replaceCollisionStrategy;
          break;

        case 'throw':
          result = this.throwCollisionStrategy;
          break;

        default:
          // This should never happen due to TypeScript type checking
          result = this.throwCollisionStrategy;
      }
    }

    return result;
  }

  protected addBase(items: T[], options?: AddItemsOptions<T>): T[] {
    let result: T[] = [];

    if (items.length > 0) {
      const collisionStrategy = this.normalizeCollisionStrategy(options);
      const itemsToAdd: T[] = [];
      const itemsToReplace: { index: number; item: T }[] = [];

      // Process each item to determine if it should be added or replaced
      for (const newItem of items) {
        const itemId = newItem.getId();
        const existingItem = this.getItem(itemId);

        if (existingItem) {
          // Collision detected - use strategy
          const resolvedItem = collisionStrategy(existingItem, newItem);

          // Validate that the resolved item has the same ID
          if (resolvedItem.getId() !== itemId) {
            throw new Error(
              `Collision strategy must return an item with the same ID. Expected: ${itemId}, Got: ${resolvedItem.getId()}`
            );
          }

          // Determine what to do based on which item was returned
          if (resolvedItem !== existingItem) {
            // Replace existing item
            const existingIndex = this.items.findIndex(item => item.getId() === itemId);
            itemsToReplace.push({ index: existingIndex, item: resolvedItem });
          }
          // If resolvedItem === existingItem, keep existing - do nothing
        } else {
          // No collision - add new item
          itemsToAdd.push(newItem);
        }
      }

      // Only process if there are items to add or replace
      if (itemsToAdd.length > 0 || itemsToReplace.length > 0) {
        // Process replacements
        for (const { index, item } of itemsToReplace) {
          const oldItem = this.items[index];
          this.detachEntityEvents(oldItem);
          oldItem.propertyChanged.unRegister(this.handleItemPropertyChanged);
          oldItem.idChanged.unRegister(this.boundHandleIdChanged);

          this.items[index] = item;
          this.attachItemEvents(item);
        }

        // Process additions
        if (itemsToAdd.length > 0) {
          this.items = [...this.items, ...itemsToAdd];
          itemsToAdd.forEach(item => {
            this.attachItemEvents(item);
          });
        }

        // Notify about all changed items (both added and replaced)
        const allChangedItems = [...itemsToAdd, ...itemsToReplace.map(r => r.item)];

        this.onItemsAdded(allChangedItems, options);

        this.itemsAdded.emit({ items: allChangedItems });
        this.collectionChanged.emit(undefined);

        result = allChangedItems;
      }
    }

    return result;
  }

  abstract addItems(items: T[], options?: AddItemsOptions<T>): void;

  protected abstract onItemsAdded(itemsToAdd: T[], options?: AddItemsOptions<T>): void;

  protected abstract onItemRemoved(itemToRemove: T): void;

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  removeItem(id: string): T | undefined {
    const removedIndex = this.items.findIndex(item => item.getId() === id);
    let result: T | undefined = undefined;

    // Only process if item exists
    if (removedIndex !== -1) {
      const itemToRemove = this.items[removedIndex];
      this.detachEntityEvents(itemToRemove);
      itemToRemove.propertyChanged.unRegister(this.handleItemPropertyChanged);
      itemToRemove.idChanged.unRegister(this.boundHandleIdChanged);
      this.items.splice(removedIndex, 1);

      this.onItemRemoved(itemToRemove);

      this.itemRemoved.emit({ item: itemToRemove });
      this.collectionChanged.emit(undefined);

      result = itemToRemove;
    }

    return result;
  }

  private handleItemPropertyChanged = (data: IPropertyChangedEventData) => {
    this.itemChanged.emit({ item: data._this as T });
  };

  private handleIdChanged(data: IdChangedEventData) {
    const item = this.getItem(data.newId)!;
    this.itemIdChanged.emit({ item, data });
    this.onItemIdChanged(data);
  }

  protected onItemIdChanged(_data: IdChangedEventData): void {
    // Default implementation does nothing
    // Subclasses can override this to handle ID changes
  }

  protected attachItemEvents(item: T) {
    this.combineEntityEvents(item);
    item.propertyChanged.register(this.handleItemPropertyChanged);
    item.idChanged.register(this.boundHandleIdChanged);
  }

  private attachEvents() {
    this.items.forEach(item => this.attachItemEvents(item));
  }

  getItem(id: string): T | undefined {
    return this.items.find(item => item.getId() === id);
  }

  restore(): void {
    super.restore();
    this.items.forEach(item => item.restore());
  }

  commit(): void {
    super.commit();
    this.items.forEach(item => item.commit());
  }

  abstract getItems(): T[];

  getNewItems(): T[] {
    return this.items.filter(item => item.isNew());
  }

  getOldItems(): T[] {
    return this.items.filter(item => !item.isNew());
  }

  isChanged(): boolean {
    const areItemsChanged = this.items.some(item => item.isChanged());

    return super.isChanged() || areItemsChanged;
  }

  // Abstract method that subclasses may override for order-specific functionality
  protected getItemAt?(index: number): T | undefined;
}