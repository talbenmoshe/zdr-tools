import type {
  IEntity,
  IEventBroker,
  IdChangedEventData,
  IPropertyChangedEventData,
  IRestorablePropEventBroker,
  IPropEventBrokerOptions,
  IEntityChangedProps
} from '../interfaces';
import { EventBroker } from '../EventBrokers';
import { PropEventBrokerCollection } from './PropEventBrokerCollection';
import { AdvancedEventEmitter, createSafeRandomId, removeItem } from '@zdr-tools/zdr-native-tools';

export abstract class EntityBase
  extends AdvancedEventEmitter
  implements IEntity {
  propertyChanged: IEventBroker;
  protected propEventBrokerCollection =
    new PropEventBrokerCollection();
  private id: string | undefined;
  private tempId: string;
  idChanged: IEventBroker<IdChangedEventData>;
  private subEntities: IEntity[] = [];

  constructor(initialId: string | undefined) {
    super();
    this.id = initialId;
    this.idChanged = new EventBroker<IdChangedEventData>(this);

    this.tempId = createSafeRandomId();

    this.propertyChanged = new EventBroker(this);

    this.propEventBrokerCollection.onAnyPropChanged.register(
      (changedProp: string) => {
        this.propertyChanged.emit({ _this: this, propName: changedProp });
      }
    );
  }

  abstract getEntityName(): string;

  checkId(id: string): boolean {
    return this.id === id || this.tempId === id;
  }

  setId(newId: string): void {
    const oldId = this.getId();

    if (oldId !== newId) {
      this.id = newId;

      this.idChanged.emit({
        oldId,
        newId
      });
    }
  }

  getId(): string {
    return this.id ?? this.tempId;
  }

  isNew(): boolean {
    return this.id === undefined;
  }

  private handleSubEntityEvent = (data: IPropertyChangedEventData): void => {
    this.propertyChanged.emit({ _this: this, propName: data._this.getId() });
  };

  protected detachEntityEvents(entity: IEntity): void {
    entity.propertyChanged.unRegister(this.handleSubEntityEvent);
  }

  protected combineEntityEvents(entity: IEntity): void {
    entity.propertyChanged.register(this.handleSubEntityEvent);
  }

  protected removeSubEntity(entity: IEntity): void {
    removeItem(this.subEntities, entity);
    this.detachEntityEvents(entity);
  }

  protected addSubEntity(entity: IEntity): void {
    this.subEntities.push(entity);
    this.combineEntityEvents(entity);
  }

  restore(): void {
    this.propEventBrokerCollection.restore();
  }

  commit(): void {
    this.propEventBrokerCollection.commit();
  }

  protected createPropEventBroker<T, V = string>(
    propName: string,
    initialValue: T,
    options?: IPropEventBrokerOptions<T, V>
  ): IRestorablePropEventBroker<T, V> {
    return this.propEventBrokerCollection.createPropEventBroker<T, V>(
      propName,
      this,
      initialValue,
      options
    );
  }

  isChanged(): boolean {
    return this.propEventBrokerCollection.hasChanges();
  }

  getChangedProps(): IEntityChangedProps[] {
    const thisChangedProps = this.propEventBrokerCollection.getChangedProps();
    const selfChangedProps: IEntityChangedProps = {
      entityId: this.getId(),
      entityName: this.getEntityName(),
      changedProps: thisChangedProps
    };

    const subEntitiesChangedProps = this.subEntities.flatMap(subEntity => {
      const subEntityChangedProps = subEntity.getChangedProps();

      return subEntityChangedProps.map(props => {
        if (!props.parentEntityId) {
          return { ...props, parentEntityId: this.getId() };
        }

        return props;
      });
    });

    return [selfChangedProps, ...subEntitiesChangedProps].filter(
      subEntityChangedProps => subEntityChangedProps.changedProps.length > 0
    );
  }

  getChangeablePropsCount(): number {
    return this.propEventBrokerCollection.getChangeablePropsCount();
  }
}