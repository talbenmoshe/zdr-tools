import { FakesFactory, FakeEntity } from '../fakes';
import { OrderedEntityCollection } from '../src/entities/OrderedEntityCollection';
import { vi } from 'vitest';

describe('OrderedEntityCollection', () => {
  it('should remove and then add the same item', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const randomId = 'item 1';
    const randomId2 = 'item 2';
    const entity = FakesFactory.createEntityBuilder().withId(randomId).build();
    const entity2 = FakesFactory.createEntityBuilder().withId(randomId2).build();
    collection.addItems([entity, entity2]);
    collection.removeItem(randomId);
    expect(collection.getItems()).toEqual([entity2]);
    collection.addItems([entity], { startIndex: 0 });

    expect(collection.getItems()).toEqual([entity, entity2]);

    collection.removeItem(randomId);
    expect(collection.getItems()).toEqual([entity2]);
    collection.addItems([entity], { startIndex: 0 });

    expect(collection.getItems()).toEqual([entity, entity2]);
  });

  it('should maintain order when adding items', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entity1 = FakesFactory.createEntity();
    const entity2 = FakesFactory.createEntity();
    const entity3 = FakesFactory.createEntity();

    collection.addItems([entity1, entity2]);
    collection.addItems([entity3], { startIndex: 1 });

    expect(collection.getItems()).toEqual([entity1, entity3, entity2]);
  });

  it('should move items correctly', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entity1 = FakesFactory.createEntity();
    const entity2 = FakesFactory.createEntity();
    const entity3 = FakesFactory.createEntity();

    collection.addItems([entity1, entity2, entity3]);
    collection.moveItem(entity1.getId(), 2);

    expect(collection.getItems()).toEqual([entity2, entity3, entity1]);
  });

  it('should get item at specific index', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entity1 = FakesFactory.createEntity();
    const entity2 = FakesFactory.createEntity();
    const entity3 = FakesFactory.createEntity();

    collection.addItems([entity1, entity2, entity3]);

    expect(collection.getItemAt(0)).toBe(entity1);
    expect(collection.getItemAt(1)).toBe(entity2);
    expect(collection.getItemAt(2)).toBe(entity3);
  });

  it('should get item order index', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entity1 = FakesFactory.createEntity();
    const entity2 = FakesFactory.createEntity();
    const entity3 = FakesFactory.createEntity();

    collection.addItems([entity1, entity2, entity3]);

    expect(collection.getItemOrderIndex(entity1.getId())).toBe(0);
    expect(collection.getItemOrderIndex(entity2.getId())).toBe(1);
    expect(collection.getItemOrderIndex(entity3.getId())).toBe(2);
  });

  it('should handle paged items', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entities = Array.from({ length: 10 }, () => FakesFactory.createEntity());

    collection.addItems(entities);

    const page1 = collection.getPagedItems({ offset: 0, limit: 3 });
    const page2 = collection.getPagedItems({ offset: 1, limit: 3 });

    expect(page1).toEqual(entities.slice(0, 3));
    expect(page2).toEqual(entities.slice(3, 6));
  });

  it('should sort items correctly', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entity1 = FakesFactory.createEntityBuilder().withId('Charlie').build();
    const entity2 = FakesFactory.createEntityBuilder().withId('Alice').build();
    const entity3 = FakesFactory.createEntityBuilder().withId('Bob').build();

    collection.addItems([entity1, entity2, entity3]);

    collection.sort((a, b) => a.getId().localeCompare(b.getId()));

    const sortedItems = collection.getItems();
    expect(sortedItems).toEqual([entity2, entity3, entity1]);
  });

  describe('collectionChanged event', () => {
    it('should emit collectionChanged when moving items', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      const entity3 = FakesFactory.createEntity();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2, entity3]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.moveItem(entity1.getId(), 2);

      expect(collectionChangedSpy).toHaveBeenCalledTimes(1);
      expect(collectionChangedSpy).toHaveBeenCalledWith(undefined);
    });

    it('should emit collectionChanged when adding items at specific index', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      const entity3 = FakesFactory.createEntity();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.addItems([entity3], { startIndex: 1 });

      expect(collectionChangedSpy).toHaveBeenCalledTimes(1);
      expect(collectionChangedSpy).toHaveBeenCalledWith(undefined);
    });

    it('should emit collectionChanged when removing items from ordered collection', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.removeItem(entity1.getId());

      expect(collectionChangedSpy).toHaveBeenCalledTimes(1);
      expect(collectionChangedSpy).toHaveBeenCalledWith(undefined);
    });

    it('should emit collectionChanged when sorting items', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntityBuilder().withId('Charlie').build();
      const entity2 = FakesFactory.createEntityBuilder().withId('Alice').build();
      const entity3 = FakesFactory.createEntityBuilder().withId('Bob').build();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2, entity3]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.sort((a, b) => a.getId().localeCompare(b.getId()));

      expect(collectionChangedSpy).toHaveBeenCalledTimes(1);
      expect(collectionChangedSpy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('events', () => {
    it('should fire events in correct order when adding items', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity = FakesFactory.createEntity();
      const eventOrder: string[] = [];

      collection.itemsAdded.register(() => {
        eventOrder.push('itemsAdded');
      });

      collection.collectionChanged.register(() => {
        eventOrder.push('collectionChanged');
      });

      collection.addItems([entity]);

      expect(eventOrder).toEqual(['itemsAdded', 'collectionChanged']);
    });

    it('should ensure getItems returns added item when itemsAdded event fires', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity = FakesFactory.createEntity();
      let itemsFromEvent: FakeEntity[] = [];

      collection.itemsAdded.register(() => {
        itemsFromEvent = collection.getItems();
      });

      collection.addItems([entity]);

      expect(itemsFromEvent).toContain(entity);
      expect(itemsFromEvent.length).toBe(1);
    });

    it('should ensure getItems returns added item when collectionChanged event fires', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity = FakesFactory.createEntity();
      let itemsFromEvent: FakeEntity[] = [];

      collection.collectionChanged.register(() => {
        itemsFromEvent = collection.getItems();
      });

      collection.addItems([entity]);

      expect(itemsFromEvent).toContain(entity);
      expect(itemsFromEvent.length).toBe(1);
    });

    it('should ensure getItems returns all items in correct order when adding multiple items', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      let itemsFromEvent: FakeEntity[] = [];

      collection.addItems([entity1]);

      collection.itemsAdded.register(() => {
        itemsFromEvent = collection.getItems();
      });

      collection.addItems([entity2], { startIndex: 0 });

      expect(itemsFromEvent).toEqual([entity2, entity1]);
      expect(itemsFromEvent.length).toBe(2);
    });

    it('should fire events when adding items with startIndex option', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      const eventOrder: string[] = [];
      let itemsAddedCallCount = 0;
      let collectionChangedCallCount = 0;

      collection.addItems([entity1]);

      collection.itemsAdded.register(() => {
        itemsAddedCallCount++;
        eventOrder.push('itemsAdded');
      });

      collection.collectionChanged.register(() => {
        collectionChangedCallCount++;
        eventOrder.push('collectionChanged');
      });

      collection.addItems([entity2], { startIndex: 0 });

      expect(eventOrder).toEqual(['itemsAdded', 'collectionChanged']);
      expect(itemsAddedCallCount).toBe(1);
      expect(collectionChangedCallCount).toBe(1);
    });

    it('should fire events in correct order when removing items', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      const eventOrder: string[] = [];

      collection.addItems([entity1, entity2]);

      collection.itemRemoved.register(() => {
        eventOrder.push('itemRemoved');
      });

      collection.collectionChanged.register(() => {
        eventOrder.push('collectionChanged');
      });

      collection.removeItem(entity1.getId());

      expect(eventOrder).toEqual(['itemRemoved', 'collectionChanged']);
    });

    it('should ensure itemRemoved event fires with correct item', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      let removedItem: FakeEntity | undefined;

      collection.addItems([entity1, entity2]);

      collection.itemRemoved.register(data => {
        removedItem = data.item;
      });

      collection.removeItem(entity1.getId());

      expect(removedItem).toBe(entity1);
    });

    it('should ensure getItems returns correct state during removal events', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      let itemsFromItemRemovedEvent: FakeEntity[] = [];
      let itemsFromCollectionChangedEvent: FakeEntity[] = [];
      let collectionChangedCallCount = 0;

      collection.addItems([entity1, entity2]);

      collection.itemRemoved.register(() => {
        itemsFromItemRemovedEvent = collection.getItems();
      });

      collection.collectionChanged.register(() => {
        collectionChangedCallCount++;
        // This should work - getItems should return correct state during collectionChanged
        itemsFromCollectionChangedEvent = collection.getItems();
      });

      collection.removeItem(entity1.getId());

      // Both events should see the correct state without the removed item
      expect(itemsFromItemRemovedEvent).toEqual([entity2]);
      expect(itemsFromItemRemovedEvent).not.toContain(entity1);
      expect(itemsFromCollectionChangedEvent).toEqual([entity2]);
      expect(itemsFromCollectionChangedEvent).not.toContain(entity1);
      expect(collectionChangedCallCount).toBe(1);
    });

    it('should ensure getItems returns correct state when collectionChanged event fires after removal', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      let itemsFromEvent: FakeEntity[] = [];

      collection.addItems([entity1, entity2]);

      collection.collectionChanged.register(() => {
        itemsFromEvent = collection.getItems();
      });

      collection.removeItem(entity1.getId());

      expect(itemsFromEvent).toEqual([entity2]);
      expect(itemsFromEvent.length).toBe(1);
      expect(itemsFromEvent).not.toContain(entity1);
    });

    it('should fire events when moving items', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      const entity3 = FakesFactory.createEntity();
      const eventOrder: string[] = [];

      collection.addItems([entity1, entity2, entity3]);

      collection.collectionChanged.register(() => {
        eventOrder.push('collectionChanged');
      });

      collection.moveItem(entity1.getId(), 2);

      expect(eventOrder).toEqual(['collectionChanged']);
    });

    it('should ensure getItems returns correct order when collectionChanged fires after moving', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      const entity3 = FakesFactory.createEntity();
      let itemsFromEvent: FakeEntity[] = [];

      collection.addItems([entity1, entity2, entity3]);

      collection.collectionChanged.register(() => {
        itemsFromEvent = collection.getItems();
      });

      collection.moveItem(entity1.getId(), 2);

      expect(itemsFromEvent).toEqual([entity2, entity3, entity1]);
      expect(itemsFromEvent.length).toBe(3);
    });

    it('should fire events when sorting items', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntityBuilder().withId('Charlie').build();
      const entity2 = FakesFactory.createEntityBuilder().withId('Alice').build();
      const entity3 = FakesFactory.createEntityBuilder().withId('Bob').build();
      const eventOrder: string[] = [];

      collection.addItems([entity1, entity2, entity3]);

      collection.collectionChanged.register(() => {
        eventOrder.push('collectionChanged');
      });

      collection.sort((a, b) => a.getId().localeCompare(b.getId()));

      expect(eventOrder).toEqual(['collectionChanged']);
    });

    it('should ensure getItems returns correct order when collectionChanged fires after sorting', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntityBuilder().withId('Charlie').build();
      const entity2 = FakesFactory.createEntityBuilder().withId('Alice').build();
      const entity3 = FakesFactory.createEntityBuilder().withId('Bob').build();
      let itemsFromEvent: FakeEntity[] = [];

      collection.addItems([entity1, entity2, entity3]);

      collection.collectionChanged.register(() => {
        itemsFromEvent = collection.getItems();
      });

      collection.sort((a, b) => a.getId().localeCompare(b.getId()));

      expect(itemsFromEvent).toEqual([entity2, entity3, entity1]);
      expect(itemsFromEvent.length).toBe(3);
    });

    it('should fire order property change events', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      let orderChangedCount = 0;

      collection.order.register(() => {
        orderChangedCount++;
      });

      collection.addItems([entity1, entity2]);
      expect(orderChangedCount).toBe(1);

      collection.moveItem(entity1.getId(), 1);
      expect(orderChangedCount).toBe(2);

      collection.removeItem(entity1.getId());
      expect(orderChangedCount).toBe(3);
    });

    it('should ensure order property reflects current state during events', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = FakesFactory.createEntity();
      const entity2 = FakesFactory.createEntity();
      let orderFromEvent: string[] = [];

      collection.addItems([entity1]);

      collection.order.register(() => {
        orderFromEvent = collection.order.get() || [];
      });

      collection.addItems([entity2], { startIndex: 0 });

      expect(orderFromEvent).toEqual([entity2.getId(), entity1.getId()]);
    });
  });
});