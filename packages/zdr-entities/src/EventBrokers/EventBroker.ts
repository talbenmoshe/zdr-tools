import type { EventEmitterType, BrokerCallbackType, UnRegisterCallback, IEventBrokerOptions } from '../interfaces';
import { nanoid } from 'nanoid';
import type { IEventBroker } from '..';

export class EventBroker<TEventType = any> implements IEventBroker<TEventType> {
  private _emitter: EventEmitterType;
  private _eventName: string;

  constructor(emitter: EventEmitterType, options?: IEventBrokerOptions) {
    this._emitter = emitter;
    this._eventName = options?.eventName || nanoid();
  }

  protected getEmitter() {
    return this._emitter;
  }

  register(cb: BrokerCallbackType<TEventType>): UnRegisterCallback {
    this.unRegister(cb);
    this._emitter.on(this._eventName, cb);

    return () => {
      this.unRegister(cb);
    };
  }

  registerOnce(cb: BrokerCallbackType<TEventType>) {
    this._emitter.once(this._eventName, cb);

    return () => {
      this.unRegister(cb);
    };
  }

  unRegister(cb: BrokerCallbackType<TEventType>) {
    this._emitter.removeListener(this._eventName, cb);
  }

  emit(data: TEventType) {
    this._emitter.emit(this._eventName, data);
  }
}
