import { FakeEventBrokerBuilder } from './FakeEventBroker';
import { FakePropEventBrokerBuilder } from './FakePropEventBroker';
import { FakeReadablePropEventBrokerBuilder } from './FakeReadablePropEventBroker';
import { FakeRestorablePropEventBrokerBuilder } from './FakeRestorablePropEventBroker';
import { FakeEntityCollectionBuilder } from './FakeEntityCollection';
import { FakeOrderedEntityCollectionBuilder } from './FakeOrderedEntityCollection';
import { FakeEntityBuilder } from './FakeEntity';
import type { IEntity } from '../src/interfaces';

export class FakesFactory {
  static createEventBrokerBuilder<T>() {
    return new FakeEventBrokerBuilder<T>();
  }

  static createEventBroker<T>() {
    return this.createEventBrokerBuilder<T>().build();
  }

  static createReadablePropEventBrokerBuilder<T, V = string>(initialValue: T) {
    return new FakeReadablePropEventBrokerBuilder<T, V>(initialValue);
  }

  static createReadablePropEventBroker<T, V = string>(initialValue: T) {
    return this.createReadablePropEventBrokerBuilder<T, V>(initialValue).build();
  }

  static createPropEventBrokerBuilder<T, V = string>(initialValue: T) {
    return new FakePropEventBrokerBuilder<T, V>(initialValue);
  }

  static createPropEventBroker<T, V = string>(initialValue: T) {
    return this.createPropEventBrokerBuilder<T, V>(initialValue).build();
  }

  static createFakeRestorablePropEventBrokerBuilder<T, V = string>(initialValue: T) {
    return new FakeRestorablePropEventBrokerBuilder<T, V>(initialValue);
  }

  static createFakeRestorablePropEventBroker<T, V = string>(initialValue: T) {
    return this.createFakeRestorablePropEventBrokerBuilder<T, V>(initialValue).build();
  }

  static createEntityCollectionBuilder<T extends IEntity>() {
    return new FakeEntityCollectionBuilder<T>();
  }

  static createEntityCollection<T extends IEntity>() {
    return this.createEntityCollectionBuilder<T>().build();
  }

  static createOrderedEntityCollectionBuilder<T extends IEntity>() {
    return new FakeOrderedEntityCollectionBuilder<T>();
  }

  static createOrderedEntityCollection<T extends IEntity>() {
    return this.createOrderedEntityCollectionBuilder<T>().build();
  }

  static createEntityBuilder() {
    return new FakeEntityBuilder();
  }

  static createEntity() {
    return this.createEntityBuilder().build();
  }
}