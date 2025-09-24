import type { IRestorablePropEventBroker } from '../src/interfaces';
import {
  FakePropEventBroker,
  FakePropEventBrokerBuilder,
  type IFakePropEventBrokerInitialData
} from './FakePropEventBroker';
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';

export interface IFakeRestorablePropEventBrokerInitialData<T, V>
  extends IFakePropEventBrokerInitialData<T, V> {
  storedValue: T;
  isChanged: boolean;
  resetToDefault: void;
  isChangedFn: boolean;
  restore: void;
  commit: void;
  getStoredValue: T;
}

export class FakeRestorablePropEventBroker<T, V = string>
  extends FakePropEventBroker<T, V>
  implements IRestorablePropEventBroker<T, V> {
  resetToDefault = getMockingFunction<() => void>(() => {
    return this.restorableInitialData.resetToDefault;
  });

  isChanged = getMockingFunction<() => boolean>(() => {
    return this.restorableInitialData.isChangedFn;
  });

  restore = getMockingFunction<() => void>(() => {
    return this.restorableInitialData.restore;
  });

  commit = getMockingFunction<() => void>(() => {
    return this.restorableInitialData.commit;
  });

  getStoredValue = getMockingFunction<() => T>(() => {
    return this.restorableInitialData.getStoredValue;
  });

  constructor(
    private restorableInitialData: IFakeRestorablePropEventBrokerInitialData<T, V>
  ) {
    super(restorableInitialData);
  }
}

export class FakeRestorablePropEventBrokerBuilder<
  T,
  V = string
> extends FakePropEventBrokerBuilder<T, V> {
  protected storedValue: T = {} as T;
  protected isChanged: boolean = false;

  constructor(value: T) {
    super(value);
    this.storedValue = value;
  }

  withStoredValue(storedValue: T): this {
    this.storedValue = storedValue;

    return this;
  }

  withIsChanged(isChanged: boolean): this {
    this.isChanged = isChanged;

    return this;
  }

  getRestorablePropEventBrokerInitialData(): IFakeRestorablePropEventBrokerInitialData<
    T,
    V
  > {
    return {
      ...this.getPropEventBrokerInitialData(),
      storedValue: this.storedValue,
      isChanged: this.isChanged,
      resetToDefault: undefined,
      isChangedFn: this.isChanged,
      restore: undefined,
      commit: undefined,
      getStoredValue: this.storedValue
    };
  }

  build(): FakeRestorablePropEventBroker<T, V> {
    return new FakeRestorablePropEventBroker(
      this.getRestorablePropEventBrokerInitialData()
    );
  }
}