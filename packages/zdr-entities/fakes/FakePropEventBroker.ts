import type { IPropEventBroker, PropSetOptions } from '../src/interfaces';
import {
  FakeReadablePropEventBroker,
  FakeReadablePropEventBrokerBuilder,
  type IFakeReadablePropEventBrokerInitialData
} from './FakeReadablePropEventBroker';
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';

export interface IFakePropEventBrokerInitialData<T, V>
  extends IFakeReadablePropEventBrokerInitialData<T, V> {
  set: boolean;
}

export class FakePropEventBroker<T, V = undefined>
  extends FakeReadablePropEventBroker<T, V>
  implements IPropEventBroker<T, V> {
  set = getMockingFunction<(value: T, options?: PropSetOptions) => boolean>(() => {
    return this.propInitialData.set;
  });

  constructor(
    private propInitialData: IFakePropEventBrokerInitialData<T, V>
  ) {
    super(propInitialData);
  }
}

export class FakePropEventBrokerBuilder<
  T,
  V = string
> extends FakeReadablePropEventBrokerBuilder<T, V> {
  protected setResult: boolean = true;

  withSetResult(setResult: boolean): this {
    this.setResult = setResult;

    return this;
  }

  getPropEventBrokerInitialData(): IFakePropEventBrokerInitialData<T, V> {
    return {
      ...this.getInitialData(),
      set: this.setResult
    };
  }

  build(): FakePropEventBroker<T, V> {
    return new FakePropEventBroker(
      this.getPropEventBrokerInitialData()
    );
  }
}