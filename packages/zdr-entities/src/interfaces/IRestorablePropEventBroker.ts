import type { IPropEventBroker, PropSetOptions } from './IPropEventBroker';

export interface IIsChanged {
  isChanged: () => boolean;
  restore(): void;
  commit(): void;
}

export interface RestorablePropSetOptions extends PropSetOptions {
  commit?: boolean;
}

export interface IRestorablePropEventBroker<TValueType, V = string> extends IPropEventBroker<TValueType, V>, IIsChanged {
  set(value: TValueType, options?: RestorablePropSetOptions): boolean;
  resetToDefault(): void;
  getStoredValue(): TValueType;
}
