import type { EventEmitter } from 'eventemitter3';

export declare type EventEmitterType = InstanceType<typeof EventEmitter>;
export declare type UnRegisterCallback = () => void;

export type BrokerCallbackType<T> = (data: T) => void;

export interface IEventBrokerOptions {
  eventName?: string;
}

export interface IEventBroker<TEventType = any> {
  register(cb: BrokerCallbackType<TEventType>): UnRegisterCallback;
  registerOnce(cb: BrokerCallbackType<TEventType>): UnRegisterCallback;
  unRegister(cb: BrokerCallbackType<TEventType>): void;
  emit(data: TEventType): void;
}
