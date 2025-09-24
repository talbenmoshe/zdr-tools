import { aRandomString } from '@zdr-tools/zdr-native-tools';
import { FakeEntityBuilder, FakeEntity } from '../fakes';
import { EntityCollection } from '../src/entities/EntityCollection';
import { vi } from 'vitest';

describe('EntityCollectionBase', () => {
  it('should add a single item', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const entity = new FakeEntityBuilder().build();
    collection.addItems([entity]);
    const allItems = collection.getItems();

    expect(allItems).toEqual([entity]);
  });

  it('should add multiple items', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const entity = new FakeEntityBuilder().build();
    const entity1 = new FakeEntityBuilder().build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().build();
    collection.addItems([entity, entity1, entity2, entity3]);
    const allItems = collection.getItems();

    expect(allItems).toEqual([
      entity,
      entity1,
      entity2,
      entity3
    ]);
  });

  it('should return new entities', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const entity = new FakeEntityBuilder().build();
    const entity1 = new FakeEntityBuilder().withIsNew(true).build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().withIsNew(true).build();
    collection.addItems([entity, entity1, entity2, entity3]);
    const allItems = collection.getNewItems();

    expect(allItems).toEqual([entity1, entity3]);
  });

  it('should return old entities', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const entity = new FakeEntityBuilder().build();
    const entity1 = new FakeEntityBuilder().withIsNew(true).build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().withIsNew(true).build();
    collection.addItems([entity, entity1, entity2, entity3]);
    const allItems = collection.getOldItems();

    expect(allItems).toEqual([entity, entity2]);
  });

  it('should remove item', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const randomId = aRandomString();
    const entity = new FakeEntityBuilder().withId(randomId).build();
    const entity1 = new FakeEntityBuilder().withIsNew(true).build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().withIsNew(true).build();
    collection.addItems([entity, entity1, entity2, entity3]);
    collection.removeItem(randomId);
    const allItems = collection.getItems();

    expect(allItems).toEqual([
      entity1,
      entity2,
      entity3
    ]);
  });

  it('should remove all items', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const entity = new FakeEntityBuilder().build();
    const entity1 = new FakeEntityBuilder().withIsNew(true).build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().withIsNew(true).build();
    collection.addItems([entity, entity1, entity2, entity3]);
    collection.removeAllItems();
    const allItems = collection.getItems();

    expect(allItems).toEqual([]);
  });

  it('should replace items', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const entity = new FakeEntityBuilder().build();
    const entity1 = new FakeEntityBuilder().withIsNew(true).build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().withIsNew(true).build();
    collection.addItems([entity, entity1]);
    collection.replaceAllItems([entity2, entity3]);
    const allItems = collection.getItems();

    expect(allItems).toEqual([entity2, entity3]);
  });

  it('should throw on items already exists', () => {
    const collection = new EntityCollection<FakeEntity>('myName', []);
    const entity = new FakeEntityBuilder().build();
    const entity2 = new FakeEntityBuilder().build();
    const entity3 = new FakeEntityBuilder().build();
    const entity4 = new FakeEntityBuilder().build();
    const entity5 = new FakeEntityBuilder().build();

    collection.addItems([entity, entity2, entity3, entity4, entity5]);

    const shouldThrow = () => {
      collection.addItems([entity2, entity3]);
    };

    expect(shouldThrow).toThrowError(`Item with id ${entity2.getId()} already exists`);
  });

  describe('collectionChanged event', () => {
    it('should emit collectionChanged when adding items', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity = new FakeEntityBuilder().build();
      const collectionChangedSpy = vi.fn();

      collection.collectionChanged.register(collectionChangedSpy);
      collection.addItems([entity]);

      expect(collectionChangedSpy).toHaveBeenCalledTimes(1);
      expect(collectionChangedSpy).toHaveBeenCalledWith(undefined);
    });

    it('should emit collectionChanged when removing items', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity = new FakeEntityBuilder().build();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.removeItem(entity.getId());

      expect(collectionChangedSpy).toHaveBeenCalledTimes(1);
      expect(collectionChangedSpy).toHaveBeenCalledWith(undefined);
    });

    it('should emit collectionChanged when removing all items', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().build();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.removeAllItems();

      expect(collectionChangedSpy).toHaveBeenCalledTimes(2);
    });

    it('should emit collectionChanged when replacing all items', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().build();
      const entity3 = new FakeEntityBuilder().build();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2]);
      collection.collectionChanged.register(collectionChangedSpy);
      collection.replaceAllItems([entity3]);

      expect(collectionChangedSpy).toHaveBeenCalledTimes(3);
    });
  });
});