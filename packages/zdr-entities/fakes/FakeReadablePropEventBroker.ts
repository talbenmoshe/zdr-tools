import type {
  CallbackParams,
  IEventBroker,
  IReadablePropEventBroker,
  OptionalViolations
} from '../src/interfaces';
import { FakeEventBroker, FakeEventBrokerBuilder, type IFakeEventBrokerInitialValues } from './FakeEventBroker';
import { getMockingFunction } from '@zdr-tools/zdr-testing-tools';

export interface IFakeReadablePropEventBrokerInitialData<T, V>
  extends IFakeEventBrokerInitialValues {
  value: T;
  isValidValue: boolean;
  violations: OptionalViolations<V>;
  metadataValue: unknown | undefined;
  violationsChangedBroker: IEventBroker<OptionalViolations<V>>;
  serializeResult: string | undefined;
  getMetadataValue: unknown | undefined;
  getViolations: OptionalViolations<V>;
  get: T;
  serialize: string | undefined;
  isValid: boolean;
}

export class FakeReadablePropEventBroker<T, V>
  extends FakeEventBroker<CallbackParams<T>>
  implements IReadablePropEventBroker<T, V> {
  violationsChanged: IEventBroker<OptionalViolations<V>>;

  getMetadataValue = getMockingFunction<(key: string) => unknown | undefined>(() => {
    return this.initialData.getMetadataValue;
  });

  getViolations = getMockingFunction<() => OptionalViolations<V>>(() => {
    return this.initialData.getViolations;
  });

  get = getMockingFunction<() => T>(() => {
    return this.initialData.get;
  });

  serialize = getMockingFunction<() => string | undefined>(() => {
    return this.initialData.serialize;
  });

  isValid = getMockingFunction<() => boolean>(() => {
    return this.initialData.isValid;
  });

  constructor(
    private initialData: IFakeReadablePropEventBrokerInitialData<T, V>
  ) {
    super(initialData);

    this.violationsChanged = this.initialData.violationsChangedBroker;
  }
}

export class FakeReadablePropEventBrokerBuilder<T, V = string> extends FakeEventBrokerBuilder<CallbackParams<T>> {
  protected isValidValue = true;
  protected violations: OptionalViolations<V> = undefined;
  protected metadataValue: unknown | undefined;
  protected violationsChangedBroker: IEventBroker<OptionalViolations<V>> =
    new FakeEventBrokerBuilder<OptionalViolations<V>>().build();
  protected serializeResult: string | undefined = undefined;

  constructor(protected value: T) {
    super();
  }

  withIsValidValue(
    isValidValue: boolean
  ): FakeReadablePropEventBrokerBuilder<T, V> {
    this.isValidValue = isValidValue;

    return this;
  }

  withViolations(
    violations: OptionalViolations<V>
  ): FakeReadablePropEventBrokerBuilder<T, V> {
    this.violations = violations;

    return this;
  }

  withMetadataValue(
    metadataValue: unknown | undefined
  ): FakeReadablePropEventBrokerBuilder<T, V> {
    this.metadataValue = metadataValue;

    return this;
  }

  withViolationsChangedBroker(
    violationsChangedBroker: IEventBroker<OptionalViolations<V>>
  ): FakeReadablePropEventBrokerBuilder<T, V> {
    this.violationsChangedBroker = violationsChangedBroker;

    return this;
  }

  withSerializeResult(
    serializeResult: string | undefined
  ): FakeReadablePropEventBrokerBuilder<T, V> {
    this.serializeResult = serializeResult;

    return this;
  }

  protected getInitialData(): IFakeReadablePropEventBrokerInitialData<T, V> {
    return {
      ...super.getInitialValues(),
      value: this.value,
      isValidValue: this.isValidValue,
      violations: this.violations,
      metadataValue: this.metadataValue,
      violationsChangedBroker: this.violationsChangedBroker,
      serializeResult: this.serializeResult,
      getMetadataValue: this.metadataValue,
      getViolations: this.violations,
      get: this.value,
      serialize: this.serializeResult,
      isValid: this.isValidValue
    };
  }

  build(): FakeReadablePropEventBroker<T, V> {
    return new FakeReadablePropEventBroker<T, V>(
      this.getInitialData()
    );
  }
}