import { isBoolean, isEqual, isFunction, isNumber, isString, isUndefined } from 'es-toolkit/compat';
import { EventBroker } from './EventBroker';
import type {
  CallbackParams, EventEmitterType, validatorExtendedType,
  IPropEventBrokerOptions, validatorType, IReadablePropEventBroker,
  IEventBroker,
  OptionalViolations,
  ValidatorType,
  IViolationResult,
  ValidationStructure,
  BrokerMetadata,
  PropSetOptions
} from '../interfaces';
import { EMPTY_ARRAY } from '@zdr-tools/zdr-native-tools';

export class ReadablePropEventBroker<T, V = string>
  extends EventBroker<CallbackParams<T>> implements IReadablePropEventBroker<T, V> {
  private _value: T;
  private _validator: validatorExtendedType;
  private _serializer?: (broker: IReadablePropEventBroker<T, V>) => string;
  violationsChanged: IEventBroker<OptionalViolations<V>>;
  private _validators?: ValidatorType<T, V>[];
  private _violationResults: IViolationResult<V>[];
  private metadata: Map<string, unknown> = new Map();

  constructor(
    emitter: EventEmitterType,
    initialValue: T,
    options?: IPropEventBrokerOptions<T, V>
  ) {
    super(emitter, options);

    const validators = options?.validators ?? [];

    this._value = initialValue;
    this._validator = options?.validator;
    this._serializer = options?.serializer;

    this.setMetadataList(validators.map(validator => validator.metadata) as BrokerMetadata[]);
    const validatorValues = this.extractValidationsAndSetMetadata(validators);
    this._validators = validatorValues;
    this.violationsChanged = new EventBroker<OptionalViolations<V>>(emitter);
    this._violationResults = EMPTY_ARRAY as any as IViolationResult<V>[];
    this.performValidation();
  }

  getMetadataValue(key: string): unknown | undefined {
    let value: unknown | undefined;

    if (this.metadata.has(key)) {
      value = this.metadata.get(key);
    }

    return value;
  }

  setMetadataList(metadataList: BrokerMetadata[]): void {
    metadataList.forEach(metadata => {
      for (const key in metadata) {
        if (Object.prototype.hasOwnProperty.call(metadata, key)) {
          const value = metadata[key];

          this.setMetadataValue(key, value);
        }
      }
    });
  }

  private extractValidationsAndSetMetadata(validators: ValidationStructure<T, V>[]): ValidatorType<T, V>[] {
    return validators.map(validator => validator.validator);
  }

  protected setMetadataValue(key: string, value: unknown) {
    this.metadata.set(key, value);
  }

  isValid(): boolean {
    return this._violationResults.length === 0;
  }

  getViolations(): OptionalViolations<V> {
    return this._violationResults.length > 0 ? this._violationResults : undefined;
  }

  _getValidator(): validatorType {
    let validatorFunc: validatorType = () => true;

    switch (this._validator) {
      case 'boolean':
        validatorFunc = isBoolean;
        break;
      case 'string':
        validatorFunc = isString;
        break;
      case 'number':
        validatorFunc = isNumber;
        break;
      case 'notUndefined':
        validatorFunc = value => !isUndefined(value);
        break;

      default:
        if (isFunction(this._validator)) {
          validatorFunc = this._validator;
        }
        break;
    }

    return validatorFunc;
  }

  serialize(): string | undefined {
    let itemSerialized;
    const value = this.get();

    if (isFunction(this._serializer)) {
      itemSerialized = this._serializer(this);
    } else {
      switch (typeof value) {
        case 'string':
        case 'number':
        case 'boolean':
          itemSerialized = String(value);
          break;
        case 'object':
        default:
          itemSerialized = undefined;
      }
    }

    return itemSerialized;
  }

  protected emitValueChanged() {
    this.emit({ _this: this.getEmitter(), value: this._value });
  }

  protected emitValidationsChanged() {
    this.violationsChanged.emit(this._violationResults);
  }

  private performValidation() {
    const results = this._validators?.map(validator => validator(this._value)).filter(Boolean) as IViolationResult<V>[] ?? this._violationResults;

    if (!isEqual(results, this._violationResults)) {
      this._violationResults = results;
      this.emitValidationsChanged();
    }
  }

  protected setValueInner(newValue: T, options: PropSetOptions) {
    this._value = newValue;

    if (!options?.silent) {
      this.emitValueChanged();
    }
    this.performValidation();
  }

  get(): T {
    return this._value;
  }
}
