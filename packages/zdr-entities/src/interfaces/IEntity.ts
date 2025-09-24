import type { IEventBroker } from './IEventBroker';
import type { IIsChanged } from './IRestorablePropEventBroker';

export interface IChangedProp {
  propName: string;
  value: unknown;
}

export interface IEntityChangedProps {
  entityId: string;
  entityName: string;
  order?: number;
  changedProps: IChangedProp[];
  parentEntityId?: string;
}

export interface IEntity extends IIsChanged {
  propertyChanged: IEventBroker<IPropertyChangedEventData>;
  isChanged(): boolean;
  getChangedProps(): IEntityChangedProps[];
  getChangeablePropsCount(): number;
  checkId(id: string): boolean;
  getId(): string;
  setId(newId: string): void;
  isNew(): boolean;
  idChanged: IEventBroker<IdChangedEventData>;
}
export interface IPropertyChangedEventData {
  propName: string;
  _this: IEntity;
}

export interface IdChangedEventData {
  oldId?: string;
  newId: string;
}
