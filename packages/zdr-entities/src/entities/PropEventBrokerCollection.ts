import type {
  IEventBroker, EventEmitterType, IRestorablePropEventBroker,
  IPropEventBroker, IPropEventBrokerOptions, IChangedProp
} from '../interfaces';
import { EventBroker, RestorablePropEventBroker } from '../EventBrokers';
import { AdvancedEventEmitter } from '@zdr-tools/zdr-native-tools';

interface IChangableMap<T> {
  changeable: IRestorablePropEventBroker<T, any>;
  serializer?: (broker: IPropEventBroker<T, any>) => string;
}

export class PropEventBrokerCollection extends AdvancedEventEmitter {
  private changeableMap: Map<string, IChangableMap<any>> = new Map();
  onAnyPropChanged: IEventBroker<string> = new EventBroker<string>(this);

  private brokerChangedHandler(blah: string) {
    this.onAnyPropChanged.emit(blah);
  };

  private serializeName(name: string) {
    return name;
  }

  createPropEventBroker<T, V = string>(
    name: string,
    emitter: EventEmitterType,
    initialValue: T,
    options?: IPropEventBrokerOptions<T, V>
  ): IRestorablePropEventBroker<T, V> {
    const changeable = new RestorablePropEventBroker<T, V>(emitter, initialValue, options);
    changeable.register(() => {
      this.brokerChangedHandler(name);
    });
    this.changeableMap.set(name, { changeable, serializer: options?.serializer });

    return changeable;
  }

  getChangedProps(): IChangedProp[] {
    return Array.from(this.changeableMap.entries())
      .filter(([, { changeable }]) => changeable.isChanged())
      .map(([key, { changeable, serializer: passedSerializer }]) => {
        let serializedItem;

        if (passedSerializer) {
          serializedItem = passedSerializer(changeable);
        } else if (changeable.serialize()) {
          serializedItem = changeable.serialize();
        } else {
          serializedItem = this.serializeName(key);
        }

        return { propName: key, value: serializedItem };
      });
  }

  restore() {
    this.changeableMap.forEach(({ changeable }) => changeable.restore());
  }

  commit() {
    this.changeableMap.forEach(({ changeable }) => changeable.commit());
  }

  hasChanges(): boolean {
    return this.getChangedProps().length > 0;
  }

  getChangeablePropsCount(): number {
    return this.changeableMap.size;
  }
}
