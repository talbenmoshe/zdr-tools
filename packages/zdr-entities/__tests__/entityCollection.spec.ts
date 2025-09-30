import { FakeEntityBuilder, FakeEntity } from '../fakes';
import { EntityCollection } from '../src/entities/EntityCollection';

describe('EntityCollection', () => {
  it('should be an unordered collection', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const entity1 = new FakeEntityBuilder().build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().build();

    collection.addItems([entity1, entity2, entity3]);
    const allItems = collection.getItems();

    expect(allItems).toEqual([entity1, entity2, entity3]);
    expect(allItems.length).toBe(3);
  });

  it('should add multiple batches of items', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const entity1 = new FakeEntityBuilder().build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().build();

    collection.addItems([entity1]);
    collection.addItems([entity2, entity3]);

    const allItems = collection.getItems();
    expect(allItems).toEqual([entity1, entity2, entity3]);
  });

  it('should handle empty collection correctly', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);

    expect(collection.isEmpty()).toBe(true);
    expect(collection.getItems()).toEqual([]);
    expect(collection.getNewItems()).toEqual([]);
    expect(collection.getOldItems()).toEqual([]);
  });

  it('should return a clone of items array', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const entityId = 'entity-1';
    const entity1 = new FakeEntityBuilder().withId(entityId).build();
    const entity2 = new FakeEntityBuilder().build();

    collection.addItems([entity1, entity2]);
    const itemsBeforeRemove = collection.getItems();

    collection.removeItem(entityId);

    expect(itemsBeforeRemove).toEqual([entity1, entity2]);
    expect(collection.getItems()).toEqual([entity2]);
  });
});