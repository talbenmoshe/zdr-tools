import { AdvancedEventEmitter, aRandomString, EMPTY_ARRAY } from '@zdr-tools/zdr-native-tools';
import { PropEventBrokerCollection } from '../src/entities/PropEventBrokerCollection';

describe('PropEventBrokerCollection', () => {
  describe('Get Changed Props', () => {
    it('should be empty when no props changed', () => {
      const emitter = new AdvancedEventEmitter();
      const brokerCollection = new PropEventBrokerCollection();
      brokerCollection.createPropEventBroker('myName', emitter, aRandomString());

      expect(brokerCollection.getChangedProps()).toEqual(EMPTY_ARRAY);
    });

    it('should return changed map with string value changed', () => {
      const emitter = new AdvancedEventEmitter();
      const brokerCollection = new PropEventBrokerCollection();
      const key = aRandomString();
      const broker = brokerCollection.createPropEventBroker<string, number>(key, emitter, aRandomString(), {
        validators: [
          {
            validator: () => {
              return { result: 1 };
            }
          }
        ]
      });

      const changedValue = aRandomString();
      broker.set(changedValue);

      expect(brokerCollection.getChangedProps()).toEqual([{ propName: key, value: changedValue }]);
    });

    it('should return change map size as same amount of changed items', () => {
      const emitter = new AdvancedEventEmitter();
      const brokerCollection = new PropEventBrokerCollection();
      const dummyArray = [
        '1',
        '2',
        '3',
        '4',
        '5'
      ];

      dummyArray.forEach(item => {
        const broker = brokerCollection.createPropEventBroker(aRandomString(), emitter, aRandomString());
        broker.set(item);
      });

      expect(brokerCollection.getChangedProps().length).toEqual(dummyArray.length);
    });

    it('should return changed map with object value as key when no serializer', () => {
      const emitter = new AdvancedEventEmitter();
      const brokerCollection = new PropEventBrokerCollection();
      const key = aRandomString();
      const broker = brokerCollection.createPropEventBroker(key, emitter, aRandomString());
      const newValue = aRandomString();
      broker.set(newValue);

      expect(brokerCollection.getChangedProps()).toEqual([{ propName: key, value: newValue }]);
    });
  });
});
