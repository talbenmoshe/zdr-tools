import type { IPropEventBroker, PropSetOptions } from '../interfaces';
import { ReadablePropEventBroker } from './ReadablePropEventBroker';
import { EMPTY_OBJECT } from '@zdr-tools/zdr-native-tools';

export class PropEventBroker<T, V = string> extends ReadablePropEventBroker<T, V> implements IPropEventBroker<T, V> {
  set(value: T, options?: PropSetOptions): boolean {
    const currentValue = this.get();
    const validator = this._getValidator();
    let isChanged = false;
    const isValid = validator(value);

    if (isValid) {
      isChanged = currentValue !== value;

      if (isChanged) {
        this.setValueInner(value, options ?? EMPTY_OBJECT);
      }
    }

    return isChanged;
  }
}
