import type {
  IEventBroker,
  IEntity,
  IdChangedEventData,
  IEntityChangedProps,
  IPropertyChangedEventData,
  IRestorablePropEventBroker,
  IEntityCollection,
  IPropEventBrokerOptions
} from '../src/interfaces';
import { FakeEventBrokerBuilder } from './FakeEventBroker';
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';
import { AdvancedEventEmitter, aRandomGuid } from '@zdr-tools/zdr-native-tools';

export interface IFakeEntityInitialData {
  id: string;
  isNewEntity: boolean;
  isChanged: boolean;
  getChangedProps: IEntityChangedProps[];
  createPropEventBroker: IRestorablePropEventBroker<unknown, unknown>;
  getChangeablePropsCount: number;
  createEntityCollection: IEntityCollection<IEntity>;
  propertyChangedBroker: IEventBroker<IPropertyChangedEventData>;
  idChangedBroker: IEventBroker<IdChangedEventData>;
}

export class FakeEntity extends AdvancedEventEmitter implements IEntity {
  propertyChanged: IEventBroker<IPropertyChangedEventData>;
  idChanged: IEventBroker<IdChangedEventData>;

  constructor(private initialData: IFakeEntityInitialData) {
    super();
    this.propertyChanged = this.initialData.propertyChangedBroker;
    this.idChanged = this.initialData.idChangedBroker;
  }

  isChanged = getMockingFunction<() => boolean>(() => {
    return this.initialData.isChanged;
  });
  getChangedProps = getMockingFunction<() => IEntityChangedProps[]>(() => this.initialData.getChangedProps);
  createPropEventBroker = getMockingFunction<(<T, V = string>(propName: string, initialValue: T, options?: IPropEventBrokerOptions<T, V>) => IRestorablePropEventBroker<T, V>)>(() => {
    return this.initialData.createPropEventBroker as any;
  });
  getChangeablePropsCount = getMockingFunction<() => number>(() => this.initialData.getChangeablePropsCount);
  checkId = getMockingFunction<(id: string) => boolean>((id: string) => {
    return id === this.initialData.id;
  });
  getId = getMockingFunction<() => string>(() => {
    return this.initialData.id;
  });
  setId = getMockingFunction<(id: string) => void>();
  isNew = getMockingFunction<() => boolean>(() => {
    return this.initialData.isNewEntity;
  });
  createEntityCollection = getMockingFunction<(<T extends IEntity>(name: string, initialItems: T[]) => IEntityCollection<T>)>(() => {
    return this.initialData.createEntityCollection as any;
  });
  restore = getMockingFunction<() => void>();
  commit = getMockingFunction<() => void>();
}

export class FakeEntityBuilder {
  protected id: string = aRandomGuid();
  protected isNew: boolean = false;
  protected isChanged: boolean = false;
  protected getChangedPropsValue: IEntityChangedProps[] = [];
  protected createPropEventBrokerValue: IRestorablePropEventBroker<unknown, unknown> = getMockingFunction() as any;
  protected getChangeablePropsCountValue: number = 0;
  protected createEntityCollectionValue: IEntityCollection<IEntity> = getMockingFunction() as any;
  protected propertyChangedBrokerValue: IEventBroker<IPropertyChangedEventData> = new FakeEventBrokerBuilder<IPropertyChangedEventData>().build();
  protected idChangedBrokerValue: IEventBroker<IdChangedEventData> = new FakeEventBrokerBuilder<IdChangedEventData>().build();

  withId(id: string): this {
    this.id = id;

    return this;
  }

  withIsNew(isNew: boolean): this {
    this.isNew = isNew;

    return this;
  }

  withIsChanged(isChanged: boolean): this {
    this.isChanged = isChanged;

    return this;
  }

  withGetChangedProps(getChangedProps: IEntityChangedProps[]): this {
    this.getChangedPropsValue = getChangedProps;

    return this;
  }

  withCreatePropEventBroker(createPropEventBroker: IRestorablePropEventBroker<unknown, unknown>): this {
    this.createPropEventBrokerValue = createPropEventBroker;

    return this;
  }

  withGetChangeablePropsCount(getChangeablePropsCount: number): this {
    this.getChangeablePropsCountValue = getChangeablePropsCount;

    return this;
  }

  withCreateEntityCollection(createEntityCollection: IEntityCollection<IEntity>): this {
    this.createEntityCollectionValue = createEntityCollection;

    return this;
  }

  withPropertyChangedBroker(propertyChangedBroker: IEventBroker<IPropertyChangedEventData>): this {
    this.propertyChangedBrokerValue = propertyChangedBroker;

    return this;
  }

  withIdChangedBroker(idChangedBroker: IEventBroker<IdChangedEventData>): this {
    this.idChangedBrokerValue = idChangedBroker;

    return this;
  }

  protected getInitialData(): IFakeEntityInitialData {
    return {
      id: this.id,
      isNewEntity: this.isNew,
      isChanged: this.isChanged,
      getChangedProps: this.getChangedPropsValue,
      createPropEventBroker: this.createPropEventBrokerValue,
      getChangeablePropsCount: this.getChangeablePropsCountValue,
      createEntityCollection: this.createEntityCollectionValue,
      propertyChangedBroker: this.propertyChangedBrokerValue,
      idChangedBroker: this.idChangedBrokerValue
    };
  }

  build(): FakeEntity {
    return new FakeEntity(this.getInitialData());
  }
}