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

  describe('keepExistingItems option', () => {
    it('should keep existing items and filter duplicates when keepExistingItems is true', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().build();
      const entity3 = new FakeEntityBuilder().build();
      const newEntity = new FakeEntityBuilder().build();

      collection.addItems([entity1, entity2, entity3]);

      // Try to add entity2 again along with a new entity
      collection.addItems([entity2, newEntity], { keepExistingItems: true });

      const allItems = collection.getItems();

      // Should have original 3 + only the new entity (entity2 should be filtered out)
      expect(allItems).toEqual([entity1, entity2, entity3, newEntity]);
      expect(allItems.length).toBe(4);
    });

    it('should not emit events when all items are filtered out by keepExistingItems', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().build();
      const itemsAddedSpy = vi.fn();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2]);

      collection.itemsAdded.register(itemsAddedSpy);
      collection.collectionChanged.register(collectionChangedSpy);

      // Try to add existing items with keepExistingItems: true
      collection.addItems([entity1, entity2], { keepExistingItems: true });

      // No events should fire since no items were actually added
      expect(itemsAddedSpy).not.toHaveBeenCalled();
      expect(collectionChangedSpy).not.toHaveBeenCalled();
    });

    it('should emit events when some items are added with keepExistingItems', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().build();
      const newEntity = new FakeEntityBuilder().build();
      const itemsAddedSpy = vi.fn();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1, entity2]);

      collection.itemsAdded.register(itemsAddedSpy);
      collection.collectionChanged.register(collectionChangedSpy);

      // Add one existing and one new item
      collection.addItems([entity2, newEntity], { keepExistingItems: true });

      // Events should fire for the one new item
      expect(itemsAddedSpy).toHaveBeenCalledTimes(1);
      expect(itemsAddedSpy).toHaveBeenCalledWith({ items: [newEntity] });
      expect(collectionChangedSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw on duplicate when keepExistingItems is false', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().build();

      collection.addItems([entity1, entity2]);

      const shouldThrow = () => {
        collection.addItems([entity2], { keepExistingItems: false });
      };

      expect(shouldThrow).toThrowError(`Item with id ${entity2.getId()} already exists`);
    });

    it('should throw on duplicate when keepExistingItems is undefined (default behavior)', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().build();

      collection.addItems([entity1, entity2]);

      const shouldThrow = () => {
        collection.addItems([entity2], { keepExistingItems: undefined });
      };

      expect(shouldThrow).toThrowError(`Item with id ${entity2.getId()} already exists`);
    });
  });

  describe('collisionStrategy option', () => {
    it('should throw on duplicate when collisionStrategy is "throw"', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const entity2 = new FakeEntityBuilder().withId(entity1.getId()).build();

      collection.addItems([entity1]);

      const shouldThrow = () => {
        collection.addItems([entity2], { collisionStrategy: 'throw' });
      };

      expect(shouldThrow).toThrowError(`Item with id ${entity1.getId()} already exists`);
    });

    it('should replace existing item when collisionStrategy is "replace"', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const sharedId = 'shared-id';
      const entity1 = new FakeEntityBuilder().withId(sharedId).build();
      const entity2 = new FakeEntityBuilder().build();
      const replacementEntity = new FakeEntityBuilder().withId(sharedId).build();

      collection.addItems([entity1, entity2]);

      collection.addItems([replacementEntity], { collisionStrategy: 'replace' });

      const allItems = collection.getItems();

      // Should have entity2 and replacementEntity (not entity1)
      expect(allItems).toEqual([replacementEntity, entity2]);
      expect(allItems).not.toContain(entity1);
      expect(allItems.length).toBe(2);
    });

    it('should keep existing item when collisionStrategy is "keep"', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const sharedId = 'shared-id';
      const entity1 = new FakeEntityBuilder().withId(sharedId).build();
      const entity2 = new FakeEntityBuilder().build();
      const duplicateEntity = new FakeEntityBuilder().withId(sharedId).build();

      collection.addItems([entity1, entity2]);

      collection.addItems([duplicateEntity], { collisionStrategy: 'keep' });

      const allItems = collection.getItems();

      // Should keep original entity1, not add duplicateEntity
      expect(allItems).toEqual([entity1, entity2]);
      expect(allItems).not.toContain(duplicateEntity);
      expect(allItems.length).toBe(2);
    });

    it('should use custom callback for collision resolution', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const sharedId = 'shared-id';
      const entity1 = new FakeEntityBuilder().withId(sharedId).build();
      const entity2 = new FakeEntityBuilder().build();
      const newEntity = new FakeEntityBuilder().withId(sharedId).build();

      collection.addItems([entity1, entity2]);

      // Custom strategy: always return the new item
      const customStrategy = (existingItem: FakeEntity, newItem: FakeEntity) => {
        expect(existingItem).toBe(entity1);
        expect(newItem).toBe(newEntity);

        return newItem;
      };

      collection.addItems([newEntity], { collisionStrategy: customStrategy });

      const allItems = collection.getItems();

      expect(allItems).toEqual([newEntity, entity2]);
      expect(allItems).not.toContain(entity1);
    });

    it('should throw if custom callback returns item with different ID', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().withId('original-id').build();
      const newEntity = new FakeEntityBuilder().withId('original-id').build();
      const wrongIdEntity = new FakeEntityBuilder().withId('different-id').build();

      collection.addItems([entity1]);

      // Custom strategy that returns an item with wrong ID
      const badStrategy = () => wrongIdEntity;

      const shouldThrow = () => {
        collection.addItems([newEntity], { collisionStrategy: badStrategy });
      };

      expect(shouldThrow).toThrowError(
        'Collision strategy must return an item with the same ID. Expected: original-id, Got: different-id'
      );
    });

    it('should let callback errors bubble up', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const newEntity = new FakeEntityBuilder().withId(entity1.getId()).build();

      collection.addItems([entity1]);

      // Custom strategy that throws an error
      const errorStrategy = () => {
        throw new Error('Custom error from callback');
      };

      const shouldThrow = () => {
        collection.addItems([newEntity], { collisionStrategy: errorStrategy });
      };

      expect(shouldThrow).toThrowError('Custom error from callback');
    });

    it('should emit events only for replaced items when using replace strategy', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const sharedId = 'shared-id';
      const entity1 = new FakeEntityBuilder().withId(sharedId).build();
      const replacementEntity = new FakeEntityBuilder().withId(sharedId).build();
      const itemsAddedSpy = vi.fn();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1]);

      collection.itemsAdded.register(itemsAddedSpy);
      collection.collectionChanged.register(collectionChangedSpy);

      collection.addItems([replacementEntity], { collisionStrategy: 'replace' });

      expect(itemsAddedSpy).toHaveBeenCalledTimes(1);
      expect(itemsAddedSpy).toHaveBeenCalledWith({ items: [replacementEntity] });
      expect(collectionChangedSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit events when keep strategy filters all items', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const duplicateEntity = new FakeEntityBuilder().withId(entity1.getId()).build();
      const itemsAddedSpy = vi.fn();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1]);

      collection.itemsAdded.register(itemsAddedSpy);
      collection.collectionChanged.register(collectionChangedSpy);

      collection.addItems([duplicateEntity], { collisionStrategy: 'keep' });

      // No events should fire since no items were actually added or replaced
      expect(itemsAddedSpy).not.toHaveBeenCalled();
      expect(collectionChangedSpy).not.toHaveBeenCalled();
    });

    it('should handle mixed new and collision items with replace strategy', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const sharedId = 'shared-id';
      const entity1 = new FakeEntityBuilder().withId(sharedId).build();
      const entity2 = new FakeEntityBuilder().build();
      const replacementEntity = new FakeEntityBuilder().withId(sharedId).build();
      const newEntity = new FakeEntityBuilder().build();

      collection.addItems([entity1, entity2]);

      collection.addItems([replacementEntity, newEntity], { collisionStrategy: 'replace' });

      const allItems = collection.getItems();

      // Should have replacementEntity (replaced entity1), entity2, and newEntity
      expect(allItems).toEqual([replacementEntity, entity2, newEntity]);
      expect(allItems.length).toBe(3);
    });

    describe('backward compatibility with keepExistingItems', () => {
      it('should use "keep" strategy when keepExistingItems is true', () => {
        const collection = new EntityCollection<FakeEntity>('myName', []);
        const sharedId = 'shared-id';
        const entity1 = new FakeEntityBuilder().withId(sharedId).build();
        const duplicateEntity = new FakeEntityBuilder().withId(sharedId).build();

        collection.addItems([entity1]);
        collection.addItems([duplicateEntity], { keepExistingItems: true });

        const allItems = collection.getItems();

        // Should keep entity1, not add duplicateEntity
        expect(allItems).toEqual([entity1]);
        expect(allItems).not.toContain(duplicateEntity);
      });

      it('should use "throw" strategy when keepExistingItems is false', () => {
        const collection = new EntityCollection<FakeEntity>('myName', []);
        const entity1 = new FakeEntityBuilder().build();
        const duplicateEntity = new FakeEntityBuilder().withId(entity1.getId()).build();

        collection.addItems([entity1]);

        const shouldThrow = () => {
          collection.addItems([duplicateEntity], { keepExistingItems: false });
        };

        expect(shouldThrow).toThrowError(`Item with id ${entity1.getId()} already exists`);
      });

      it('should prefer collisionStrategy over keepExistingItems when both provided', () => {
        const collection = new EntityCollection<FakeEntity>('myName', []);
        const sharedId = 'shared-id';
        const entity1 = new FakeEntityBuilder().withId(sharedId).build();
        const replacementEntity = new FakeEntityBuilder().withId(sharedId).build();

        collection.addItems([entity1]);

        // keepExistingItems: true would normally keep, but collisionStrategy should override
        collection.addItems([replacementEntity], {
          keepExistingItems: true,
          collisionStrategy: 'replace'
        });

        const allItems = collection.getItems();

        // Should use replace strategy, not keep
        expect(allItems).toEqual([replacementEntity]);
        expect(allItems).not.toContain(entity1);
      });
    });
  });

  describe('removeItem edge cases', () => {
    it('should return undefined when removing non-existent item', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const nonExistentId = 'non-existent-id';

      collection.addItems([entity1]);

      const result = collection.removeItem(nonExistentId);

      expect(result).toBeUndefined();
      // Collection should remain unchanged
      expect(collection.getItems()).toEqual([entity1]);
    });

    it('should not emit events when removing non-existent item', () => {
      const collection = new EntityCollection<FakeEntity>('myName', []);
      const entity1 = new FakeEntityBuilder().build();
      const nonExistentId = 'non-existent-id';
      const itemRemovedSpy = vi.fn();
      const collectionChangedSpy = vi.fn();

      collection.addItems([entity1]);

      collection.itemRemoved.register(itemRemovedSpy);
      collection.collectionChanged.register(collectionChangedSpy);

      collection.removeItem(nonExistentId);

      // No events should fire since no item was removed
      expect(itemRemovedSpy).not.toHaveBeenCalled();
      expect(collectionChangedSpy).not.toHaveBeenCalled();
    });
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