import type {
  IEntityCollectionBase,
  IEventBroker,
  IPropertyChangedEventData,
  IItemEventData,
  IItemsEventData,
  IItemIdChangedEventData,
  AddItemsOptions,
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

  private validateItemsDoNotExist(items: T[]): void {
    items.forEach(item => {
      const itemExists = this.getItem(item.getId());

      if (itemExists) {
        throw new Error(`Item with id ${item.getId()} already exists`);
      }
    });
  }

  protected addBase(items: T[], options?: AddItemsOptions): T[] {
    if (items.length === 0) {
      return [];
    }

    const keepExisting = options?.keepExistingItems ?? false;
    let itemsToAdd = items;

    if (keepExisting) {
      itemsToAdd = items.filter(item => {
        const itemId = item.getId();
        const itemExists = !!this.getItem(itemId);

        return !itemExists;
      });
    }

    if (itemsToAdd.length === 0) {
      return [];
    }

    this.validateItemsDoNotExist(itemsToAdd);
    this.items = [...this.items, ...itemsToAdd];

    itemsToAdd.forEach(item => {
      this.attachItemEvents(item);
    });
    this.itemsAdded.emit({ items: itemsToAdd });
    this.collectionChanged.emit(undefined);

    return itemsToAdd;
  }

  abstract addItems(items: T[], options?: AddItemsOptions): void;

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  removeItem(id: string): T {
    const removedIndex = this.items.findIndex(item => item.getId() === id);
    const itemToRemove = this.items[removedIndex];
    this.detachEntityEvents(itemToRemove);
    itemToRemove.propertyChanged.unRegister(this.handleItemPropertyChanged);
    itemToRemove.idChanged.unRegister(this.boundHandleIdChanged);
    this.items.splice(removedIndex, 1);
    this.itemRemoved.emit({ item: itemToRemove });
    this.collectionChanged.emit(undefined);

    return itemToRemove;
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