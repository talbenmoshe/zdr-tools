import { FakeEntityBuilder, FakeEntity } from '../fakes';
import { OrderedEntityCollection } from '../src/entities/OrderedEntityCollection';
import { vi } from 'vitest';

describe('OrderedEntityCollection', () => {
  it('should remove and then add the same item', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const randomId = 'item 1';
    const randomId2 = 'item 2';
    const entity = new FakeEntityBuilder().withId(randomId).build();
    const entity2 = new FakeEntityBuilder().withId(randomId2).build();
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
    const entity1 = new FakeEntityBuilder().build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().build();

    collection.addItems([entity1, entity2]);
    collection.addItems([entity3], { startIndex: 1 });

    expect(collection.getItems()).toEqual([entity1, entity3, entity2]);
  });

  it('should move items correctly', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entity1 = new FakeEntityBuilder().build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().build();

    collection.addItems([entity1, entity2, entity3]);
    collection.moveItem(entity1.getId(), 2);

    expect(collection.getItems()).toEqual([entity2, entity3, entity1]);
  });

  it('should get item at specific index', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entity1 = new FakeEntityBuilder().build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().build();

    collection.addItems([entity1, entity2, entity3]);

    expect(collection.getItemAt(0)).toBe(entity1);
    expect(collection.getItemAt(1)).toBe(entity2);
    expect(collection.getItemAt(2)).toBe(entity3);
  });

  it('should get item order index', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entity1 = new FakeEntityBuilder().build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().build();

    collection.addItems([entity1, entity2, entity3]);

    expect(collection.getItemOrderIndex(entity1.getId())).toBe(0);
    expect(collection.getItemOrderIndex(entity2.getId())).toBe(1);
    expect(collection.getItemOrderIndex(entity3.getId())).toBe(2);
  });

  it('should handle paged items', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entities = Array.from({ length: 10 }, () => new FakeEntityBuilder().build());

    collection.addItems(entities);

    const page1 = collection.getPagedItems({ offset: 0, limit: 3 });
    const page2 = collection.getPagedItems({ offset: 1, limit: 3 });

    expect(page1).toEqual(entities.slice(0, 3));
    expect(page2).toEqual(entities.slice(3, 6));
  });

  it('should sort items correctly', () => {
    const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
    const entity1 = new FakeEntityBuilder().withId('Charlie').build();
    const entity2 = new FakeEntityBuilder().withId('Alice').build();
    const entity3 = new FakeEntityBuilder().withId('Bob').build();

    collection.addItems([entity1, entity2, entity3]);

    collection.sort((a, b) => a.getId().localeCompare(b.getId()));

    const sortedItems = collection.getItems();
    expect(sortedItems).toEqual([entity2, entity3, entity1]);
  });

  describe('collectionChanged event', () => {
    it('should emit collectionChanged when moving items', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().build();
      const entity3 = new FakeEntityBuilder().build();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2, entity3]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.moveItem(entity1.getId(), 2);

      expect(collectionChangedSpy).toHaveBeenCalledTimes(1);
      expect(collectionChangedSpy).toHaveBeenCalledWith(undefined);
    });

    it('should emit collectionChanged when adding items at specific index', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().build();
      const entity3 = new FakeEntityBuilder().build();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.addItems([entity3], { startIndex: 1 });

      expect(collectionChangedSpy).toHaveBeenCalledTimes(2);
      expect(collectionChangedSpy).toHaveBeenCalledWith(undefined);
    });

    it('should emit collectionChanged when removing items from ordered collection', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().build();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.removeItem(entity1.getId());

      expect(collectionChangedSpy).toHaveBeenCalledTimes(2);
      expect(collectionChangedSpy).toHaveBeenCalledWith(undefined);
    });

    it('should emit collectionChanged when sorting items', () => {
      const collection = new OrderedEntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().withId('Charlie').build();
      const entity2 = new FakeEntityBuilder().withId('Alice').build();
      const entity3 = new FakeEntityBuilder().withId('Bob').build();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2, entity3]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.sort((a, b) => a.getId().localeCompare(b.getId()));

      expect(collectionChangedSpy).toHaveBeenCalledTimes(1);
      expect(collectionChangedSpy).toHaveBeenCalledWith(undefined);
    });
  });
});