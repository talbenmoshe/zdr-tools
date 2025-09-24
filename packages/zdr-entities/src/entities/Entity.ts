import type {
  IEntity,
  IEntityCollection,
  IOrderedEntityCollection,
  IEntityChangedProps
} from '../interfaces';
import { EntityBase } from './EntityBase';
import { EntityCollection } from './EntityCollection';
import { OrderedEntityCollection } from './OrderedEntityCollection';

export abstract class Entity extends EntityBase {
  protected collections: IEntity[] = [];

  protected addCollection(collection: IEntity): void {
    this.collections.push(collection);
    this.combineEntityEvents(collection);
  }

  commit(): void {
    super.commit();
    this.collections.forEach(collection => collection.commit());
  }

  isChanged(): boolean {
    const hasPropChanges = super.isChanged();
    const hasCollectionChanges = this.collections.some(collection => collection.isChanged());

    return hasPropChanges || hasCollectionChanges;
  }

  getChangedProps(): IEntityChangedProps[] {
    const baseChangedProps = super.getChangedProps();

    const collectionChangedProps = this.collections.flatMap(collection => {
      const collectionProps = collection.getChangedProps();

      return collectionProps.map(props => {
        if (!props.parentEntityId) {
          return { ...props, parentEntityId: this.getId() };
        }

        return props;
      });
    });

    return [...baseChangedProps, ...collectionChangedProps].filter(
      props => props.changedProps.length > 0
    );
  }

  protected createEntityCollection<T extends IEntity>(
    name: string,
    initialItems: T[]
  ): IEntityCollection<T> {
    const collection = new EntityCollection(name, initialItems);
    this.addCollection(collection);

    return collection;
  }

  protected createOrderedEntityCollection<T extends IEntity>(
    name: string,
    initialItems: T[]
  ): IOrderedEntityCollection<T> {
    const collection = new OrderedEntityCollection(name, initialItems);
    this.addCollection(collection);

    return collection;
  }
}
