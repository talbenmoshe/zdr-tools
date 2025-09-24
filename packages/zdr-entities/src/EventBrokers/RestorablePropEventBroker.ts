import { isEqual } from 'es-toolkit/compat';
import { PropEventBroker } from './PropEventBroker';
import type { EventEmitterType, IRestorablePropEventBroker, IPropEventBrokerOptions, RestorablePropSetOptions } from '../interfaces';
import { getCurrentTimestamp } from '@zdr-tools/zdr-native-tools';

export class RestorablePropEventBroker<T, V = string> extends PropEventBroker<T, V> implements IRestorablePropEventBroker<T, V> {
  private _defaultValue: T;
  private _lastChangedTimestamp: number = 0;
  private _lastCommitTimestamp: number = 0;

  constructor(
    emitter: EventEmitterType,
    initialValue: T,
    options?: IPropEventBrokerOptions<T, V>
  ) {
    super(emitter, initialValue, options);

    this._defaultValue = initialValue;
  }

  getStoredValue(): T {
    return this._defaultValue;
  }

  resetToDefault() {
    return this.set(this._defaultValue);
  }

  isChanged(): boolean {
    return this._lastChangedTimestamp > this._lastCommitTimestamp;
  }

  restore(): void {
    this.resetToDefault();
  }

  private commitInner() {
    this._defaultValue = this.get();
    this._lastCommitTimestamp = getCurrentTimestamp();
  }

  commit() {
    if (this._defaultValue !== this.get()) {
      this.commitInner();
      // Hack to make the Broker raise an event
      this.emitValueChanged();
    }
  }

  set(value: T, options?: RestorablePropSetOptions): boolean {
    return super.set(value, options);
  }

  protected setValueInner(newValue: T, options: RestorablePropSetOptions): void {
    if (!isEqual(newValue, this._defaultValue)) {
      this._lastChangedTimestamp = getCurrentTimestamp();
    } else {
      this._lastChangedTimestamp = this._lastCommitTimestamp;
    }
    super.setValueInner(newValue, options);

    if (options?.commit) {
      this.commitInner();
    }
  }
}
