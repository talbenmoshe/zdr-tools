import { EventEmitter } from 'eventemitter3';

export class AdvancedEventEmitter extends EventEmitter {
  emit<T extends string | symbol>(event: T, ...args: any[]): boolean {
    let value: boolean = false;

    try {
      value = super.emit(event, ...args);
    } catch (error) {
      console.error('AdvancedEventEmitter - error', error);
    }

    return value;
  }
}
