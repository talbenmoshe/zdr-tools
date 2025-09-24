import type { EventEmitterType, IEventBroker, IEventBrokerOptions } from './IEventBroker';

export interface CallbackParams<ValueType> {
  _this: EventEmitterType;
  value: ValueType;
}

export interface IViolationResult<V> {
  result: V;
}

export type BrokerMetadata = Record<string, unknown>;
export declare type validatorType = (value: any) => boolean;
export type ValidatorType<T, V = string> = (value: T) => IViolationResult<V> | undefined;

export type ValidationStructure<T, V = string> = {
  metadata?: BrokerMetadata;
  validator: ValidatorType<T, V>;
};

export declare type primitiveValidationType =
  | 'boolean'
  | 'string'
  | 'number'
  | 'notUndefined';
export declare type validatorExtendedType =
  | validatorType
  | primitiveValidationType
  | undefined;

export interface PropSetOptions {
  silent?: boolean;
}

export interface IPropEventBrokerOptions<T, V = string> extends IEventBrokerOptions {
  validator?: validatorExtendedType;
  serializer?(broker: IReadablePropEventBroker<T, V>): string;
  validators?: ValidationStructure<T, V>[];
}

export type OptionalViolations<V> = IViolationResult<V>[] | undefined;

export interface IReadablePropEventBroker<T, V = string> extends IEventBroker<CallbackParams<T>> {
  get(): T;
  serialize(): string | undefined;
  isValid(): boolean;
  getViolations(): OptionalViolations<V>;
  violationsChanged: IEventBroker<OptionalViolations<V>>;
  getMetadataValue(key: string): unknown | undefined;
}

export interface IPropEventBroker<T, V = string> extends IReadablePropEventBroker<T, V> {
  set(value: T, options?: PropSetOptions): boolean;
}
