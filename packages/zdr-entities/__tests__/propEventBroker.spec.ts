import type { IPropEventBroker, IPropEventBrokerOptions, IReadablePropEventBroker, IRestorablePropEventBroker } from '../src/interfaces';
import { RestorablePropEventBroker, PropEventBroker } from '../src/EventBrokers';
import { ReadablePropEventBroker } from '../src/EventBrokers/ReadablePropEventBroker';
import { vi } from 'vitest';
import { AdvancedEventEmitter, aRandomString, aRandomBoolean, aRandomStringWithLength, aRandomInteger } from '@zdr-tools/zdr-native-tools';

function aRandomStringValue() {
  return Math.random().toString();
}

function runAllSettable(
  initialValue: string,
  options: IPropEventBrokerOptions<string> | undefined,
  cb: (_broker: IPropEventBroker<string>, _emitter: AdvancedEventEmitter) => void
) {
  const emitter = new AdvancedEventEmitter();
  const restorableBroker = new RestorablePropEventBroker<string>(emitter, initialValue, options);
  const propBroker = new PropEventBroker<string>(emitter, initialValue, options);

  cb(restorableBroker, emitter);
  cb(propBroker, emitter);
}

function runAll(
  initialValue: string, options: IPropEventBrokerOptions<string> | undefined, cb: (_broker: IReadablePropEventBroker<string>) => void) {
  const emitter = new AdvancedEventEmitter();
  const readableBroker = new ReadablePropEventBroker<string>(emitter, initialValue, options);

  runAllSettable(initialValue, options, cb);
  cb(readableBroker);
}

describe('RestorablePropEventBroker', () => {
  describe('Is Changed Equality', () => {
    it('should be changed for string value', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<string>(emitter, aRandomStringValue());
      broker.set(aRandomStringValue());

      expect(broker.isChanged()).toBeTruthy();
    });

    it('should be changed for number value', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<number>(emitter, 123);
      broker.set(456);

      expect(broker.isChanged()).toBeTruthy();
    });

    it('should be changed for boolean value', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<boolean>(emitter, true);
      broker.set(false);

      expect(broker.isChanged()).toBeTruthy();
    });

    it('should NOT change for same boolean value', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<boolean>(emitter, true);
      broker.set(true);

      expect(broker.isChanged()).toBeFalsy();
    });

    it('should NOT change for same array value', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<boolean[]>(emitter, [
        true,
        false,
        true
      ]);

      broker.set([
        true,
        false,
        true
      ]);

      expect(broker.isChanged()).toBeFalsy();
    });

    it('should change for different array value', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<boolean[]>(emitter, [
        true,
        false,
        true
      ]);

      broker.set([
        false,
        false,
        true
      ]);

      expect(broker.isChanged()).toBeTruthy();
    });

    it('should change for different object value', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<object>(emitter, { a: 1, b: 2 });

      broker.set({ a: 1, b: 3 });

      expect(broker.isChanged()).toBeTruthy();
    });

    it('should NOT change for the same object value', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<object>(emitter, { a: 1, b: 2 });

      broker.set({ a: 1, b: 2 });

      expect(broker.isChanged()).toBeFalsy();
    });
  });

  describe('Commit and Restore Functionality', () => {
    it('should not change if value doesn\'t change', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<string>(emitter, aRandomStringValue());

      expect(broker.isChanged()).toBeFalsy();
    });

    it('should not change after committing the broker', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<string>(emitter, aRandomStringValue());
      broker.set(aRandomStringValue());
      broker.commit();
      expect(broker.isChanged()).toBeFalsy();
    });

    it('should not change when settings the same value', () => {
      const emitter = new AdvancedEventEmitter();
      const stringValue = aRandomStringValue();
      const broker = new RestorablePropEventBroker<string>(emitter, stringValue);
      broker.set(stringValue);
      expect(broker.isChanged()).toBeFalsy();
    });

    it('should not change when restoring the value', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<string>(emitter, aRandomStringValue());
      broker.set(aRandomStringValue());

      broker.restore();

      expect(broker.isChanged()).toBeFalsy();
    });

    it('should change when changing value', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<string>(emitter, aRandomStringValue());
      broker.set(aRandomStringValue());

      expect(broker.isChanged()).toBeTruthy();
    });

    it('should not be changed when sending "commit" option', () => {
      const emitter = new AdvancedEventEmitter();
      const broker = new RestorablePropEventBroker<string>(emitter, aRandomStringValue());
      broker.set(aRandomStringValue(), { commit: true });

      expect(broker.isChanged()).toBeFalsy();
    });
  });

  describe('Serialize', () => {
    it('should serialize string without given serializer', () => {
      const emitter = new AdvancedEventEmitter();
      const randomValue = aRandomString();
      const broker = new RestorablePropEventBroker<string>(emitter, randomValue);

      expect(broker.serialize()).toEqual(randomValue);
    });

    it('should serialize boolean to string without given serializer', () => {
      const emitter = new AdvancedEventEmitter();
      const randomValue = aRandomBoolean();
      const broker = new RestorablePropEventBroker<boolean>(emitter, randomValue);

      expect(broker.serialize()).toEqual(`${randomValue}`);
    });

    it('should serialize an object with a given serializer', () => {
      const emitter = new AdvancedEventEmitter();
      const someObject = {
        message: aRandomString(),
        nested: { description: aRandomString() }
      };

      function serializer(broker: IRestorablePropEventBroker<any>) {
        return JSON.stringify(broker.get(), null, 1);
      }
      const broker = new RestorablePropEventBroker<any>(emitter, someObject, { serializer });

      expect(broker.serialize()).toEqual(JSON.stringify(someObject, null, 1));
    });
  });

  describe('Violations', () => {
    it('should return no violations for a brokers without validations', () => {
      runAll(aRandomStringValue(), undefined, broker => {
        expect(broker.getViolations()).toBeUndefined();
        expect(broker.isValid()).toBeTruthy();
      });
    });

    it('should return violations for a brokers without validations', () => {
      runAll(aRandomStringValue(), { validators: [{ validator: () => ({ result: 'valid' }) }] }, broker => {
        expect(broker.getViolations()).toEqual([{ result: 'valid' }]);
        expect(broker.isValid()).toBeFalsy();
      });
    });

    it('should return violations changed value for settable brokers', () => {
      const options = {
        validators: [
          {
            validator: (value: string) => {
              return value.length ? undefined : { result: 'empty' };
            }
          }
        ]
      };

      runAllSettable(aRandomStringValue(), options, broker => {
        broker.set('');
        expect(broker.getViolations()).toEqual([{ result: 'empty' }]);
        expect(broker.isValid()).toBeFalsy();
      });
    });

    it('should return violations for restored value', () => {
      const emitter = new AdvancedEventEmitter();
      const options = {
        validators: [
          {
            validator: (value: string) => {
              return value.length ? undefined : { result: 'empty' };
            }
          }
        ]
      };

      const restorableBroker = new RestorablePropEventBroker<string>(emitter, '', options);

      restorableBroker.set(aRandomString());

      expect(restorableBroker.getViolations()).toBeUndefined();
      expect(restorableBroker.isValid()).toBeTruthy();

      restorableBroker.restore();

      expect(restorableBroker.getViolations()).toEqual([{ result: 'empty' }]);
      expect(restorableBroker.isValid()).toBeFalsy();
    });

    it('should return not violations for restored value', () => {
      const emitter = new AdvancedEventEmitter();
      const options = {
        validators: [
          {
            validator: (value: string) => {
              return value.length ? undefined : { result: 'empty' };
            }
          }
        ]
      };

      const restorableBroker = new RestorablePropEventBroker<string>(emitter, aRandomString(), options);

      restorableBroker.set('');

      expect(restorableBroker.getViolations()).toEqual([{ result: 'empty' }]);
      expect(restorableBroker.isValid()).toBeFalsy();

      restorableBroker.restore();

      expect(restorableBroker.getViolations()).toBeUndefined();
      expect(restorableBroker.isValid()).toBeTruthy();
    });

    it('should return valid violations', () => {
      const options = {
        validators: [
          {
            validator: (value: string) => {
              return value.length > 5 ? undefined : { result: 'less than 5' };
            }
          },
          {
            validator: (value: string) => {
              return value.length > 10 ? undefined : { result: 'less than 10' };
            }
          },
          {
            validator: (value: string) => {
              return value.length > 15 ? undefined : { result: 'less than 15' };
            }
          }
        ]
      };

      runAll(aRandomStringWithLength(7), options, broker => {
        expect(broker.getViolations()).toEqual([{ result: 'less than 10' }, { result: 'less than 15' }]);
        expect(broker.isValid()).toBeFalsy();
      });
    });

    it('should raise an event when violations are created', () => {
      const options = {
        validators: [
          {
            validator: (value: string) => {
              return value.length ? undefined : { result: 'empty' };
            }
          }
        ]
      };

      runAllSettable(aRandomStringValue(), options, broker => {
        const callback = vi.fn();

        broker.violationsChanged.register(callback);

        broker.set('');

        expect(callback).toBeCalledWith([{ result: 'empty' }]);
      });
    });

    it('should NOT raise an event when violations are not changed', () => {
      const options = {
        validators: [
          {
            validator: (value: string) => {
              return value.length ? undefined : { result: 'empty' };
            }
          }
        ]
      };

      runAllSettable(aRandomStringValue(), options, broker => {
        const callback = vi.fn();

        broker.violationsChanged.register(callback);

        broker.set(aRandomStringValue());

        expect(callback).not.toBeCalled();
      });
    });

    it('should return the entire object when violation occurs', () => {
      const result = { result: 2, anotherBool: aRandomBoolean(), anotherNumber: aRandomInteger() };
      const options = {
        validators: [
          {
            validator: (value: string) => {
              return value.length ? undefined : result;
            }
          }
        ]
      };

      const emitter = new AdvancedEventEmitter();
      const restorableBroker = new RestorablePropEventBroker<string, number>(emitter, aRandomString(), options);

      restorableBroker.set('');

      expect(restorableBroker.getViolations()).toEqual([result]);
    });

    it('should have violations right from the constructor', () => {
      const options = {
        validators: [
          {
            validator: (value: string) => {
              return value.length ? undefined : { result: 'empty' };
            }
          }
        ]
      };

      runAll('', options, broker => {
        expect(broker.getViolations()).toEqual([{ result: 'empty' }]);
        expect(broker.isValid()).toBeFalsy();
      });
    });
  });

  describe('Metadata', () => {
    it('should return undefined for a non-existing metadata key', () => {
      runAll(aRandomStringValue(), undefined, broker => {
        expect(broker.getMetadataValue(aRandomString())).toBeUndefined();
      });
    });

    it('should set a metadata value on validation', () => {
      const key = aRandomString();
      const value = aRandomString();

      runAll(aRandomStringValue(), { validators: [{ metadata: { [key]: value }, validator: () => ({ result: 'valid' }) }] }, broker => {
        expect(broker.getMetadataValue(key)).toEqual(value);
      });
    });

    it('should set multiple metadata values on validation', () => {
      const key1 = aRandomString();
      const value1 = aRandomString();
      const key2 = aRandomString();
      const value2 = aRandomString();

      runAll(aRandomStringValue(), {
        validators: [
          {
            metadata: { [key1]: value1, [key2]: value2 },
            validator: () => ({ result: 'valid' })
          }
        ]
      }, broker => {
        expect(broker.getMetadataValue(key1)).toEqual(value1);
        expect(broker.getMetadataValue(key2)).toEqual(value2);
      });
    });
  });

  describe('Events', () => {
    it('should raise the proper event when changed', () => {
      runAllSettable(aRandomStringValue(), undefined, (broker, emitter) => {
        const callback = vi.fn();
        const newValue = aRandomStringValue();
        broker.register(callback);

        broker.set(newValue);

        expect(callback).toBeCalledWith({ _this: emitter, value: newValue });
      });
    });

    it('should not raise event when "silent" option is passed', () => {
      runAllSettable(aRandomStringValue(), undefined, broker => {
        const callback = vi.fn();
        const newValue = aRandomStringValue();
        broker.register(callback);

        broker.set(newValue, { silent: true });

        expect(callback).not.toBeCalled();
      });
    });
  });
});
