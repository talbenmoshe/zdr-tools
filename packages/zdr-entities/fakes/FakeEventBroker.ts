import type { BrokerCallbackType, IEventBroker, UnRegisterCallback } from '../src/interfaces';
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';

export interface IFakeEventBrokerInitialValues {
  register: UnRegisterCallback;
  registerOnce: UnRegisterCallback;
}

export class FakeEventBroker<T> implements IEventBroker<T> {
  constructor(private initialValues: IFakeEventBrokerInitialValues) {}

  register = getMockingFunction<(cb: BrokerCallbackType<T>) => UnRegisterCallback>(() => this.initialValues.register);
  registerOnce = getMockingFunction<(cb: BrokerCallbackType<T>) => UnRegisterCallback>(() => this.initialValues.registerOnce);
  unRegister = getMockingFunction<(cb: BrokerCallbackType<T>) => void>();
  emit = getMockingFunction<(data: T) => void>();
}

export class FakeEventBrokerBuilder<T> {
  protected registerValue: UnRegisterCallback = getMockingFunction();
  protected registerOnceValue: UnRegisterCallback = getMockingFunction();

  withRegisterValue(registerValue: UnRegisterCallback): this {
    this.registerValue = registerValue;

    return this;
  }

  withRegisterOnceValue(registerOnceValue: UnRegisterCallback): this {
    this.registerOnceValue = registerOnceValue;

    return this;
  }

  protected getInitialValues(): IFakeEventBrokerInitialValues {
    return {
      register: this.registerValue,
      registerOnce: this.registerOnceValue
    };
  }

  build(): FakeEventBroker<T> {
    return new FakeEventBroker<T>(this.getInitialValues());
  }
}