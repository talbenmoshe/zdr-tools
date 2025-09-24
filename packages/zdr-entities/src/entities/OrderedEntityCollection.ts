import type {
  IOrderedEntityCollection,
  IRestorablePropEventBroker,
  IdChangedEventData,
  Paging,
  IEntityChangedProps,
  OrderedAddItemsOptions,
  IEntity
} from '../interfaces';
import { isNumber } from 'es-toolkit/compat';
import { insertAt, move } from '@zdr-tools/zdr-native-tools';
import { EntityCollectionBase } from './EntityCollectionBase';

export class OrderedEntityCollection<T extends IEntity>
  extends EntityCollectionBase<T>
  implements IOrderedEntityCollection<T> {
  order: IRestorablePropEventBroker<string[] | undefined>;

  constructor(name: string, items: T[]) {
    super(name, items);

    this.order = this.createPropEventBroker<string[] | undefined>(
      'order',
      items?.map(item => item.getId())
    );

    this.order.register(() => {
      this.collectionChanged.emit(undefined);
    });
  }

  getPagedItems(page: Paging): T[] {
    const orderedItems = this.getItems();
    const startIndex = page.offset * page.limit;
    const endIndex = startIndex + page.limit;

    return orderedItems.slice(startIndex, endIndex);
  }

  getItems(): T[] {
    const allItems = this.items ?? [];
    const order = this.order.get() ?? [];

    return order.map(id => {
      const orderedItem = allItems.find(item => {
        return item.checkId(id);
      });

      if (!orderedItem) {
        throw new Error(`getItems - item not found for id: ${id}`);
      }

      return orderedItem;
    });
  }

  getItemAt(index: number): T | undefined {
    const order = this.order.get() ?? [];
    const itemId = order[index];

    return this.getItem(itemId);
  }

  addItems(items: T[], options?: OrderedAddItemsOptions): void {
    if (items.length) {
      const insertStartIndex = options?.startIndex ?? this.getOrder().length;
      const itemsToAdd = this.addBase(items, options);

      if (itemsToAdd.length > 0) {
        const itemsOrder = itemsToAdd.map(item => item.getId());
        const newOrder = insertAt(
          this.getOrder(),
          insertStartIndex,
          ...itemsOrder
        );

        this.order.set(newOrder);
      }
    }
  }

  moveItem(itemId: string, newIndex: number): void {
    const currentOrder = this.order.get()!;
    const currentIndex = currentOrder?.findIndex(item => item === itemId);
    const newOrder = move(currentOrder, currentIndex, newIndex);
    this.order.set(newOrder);
  }

  private getOrder(): string[] {
    return this.order.get() ?? [];
  }

  getItemOrderIndex(itemId: string): number {
    return this.order.get()!.findIndex(tab => tab === itemId);
  }

  sort(compareFn: (a: T, b: T) => number): void {
    const sortedItems = this.getItems().sort(compareFn);
    const newOrder = sortedItems.map(item => item.getId());
    this.order.set(newOrder);
  }

  removeItem(id: string): T {
    const itemToRemove = super.removeItem(id);
    const currentItemsOrder = this.getOrder();
    const newOrder = currentItemsOrder.filter(itemId => itemId !== id);
    this.order.set(newOrder);

    return itemToRemove;
  }

  protected onItemIdChanged(data: IdChangedEventData): void {
    const currentOrder = this.getOrder();
    const newTabsOrder = currentOrder.map(id =>
      id === data.oldId ? data.newId : id
    );

    this.order.set(newTabsOrder);
  }

  getChangedProps(): IEntityChangedProps[] {
    const changedProps = super.getChangedProps();

    const subItemsChangedProps = this.getItems().flatMap(
      (item, index) => {
        return item.getChangedProps().map(entityChangedProp => {
          if (!isNumber(entityChangedProp.order)) {
            return { ...entityChangedProp, order: index };
          }

          return entityChangedProp;
        });
      }
    );

    return [...changedProps, ...subItemsChangedProps];
  }
}