import type { IEventBroker } from '@zdr-tools/zdr-entities';
import { useEffect } from 'react';
import { isUndefined } from 'es-toolkit/compat';
import { useIncrement } from './useIncrement';

export function useEventRefresher(...props: (IEventBroker | undefined)[]) {
  const { increment } = useIncrement();

  useEffect(() => {
    const unRegisters = props.filter(prop => !isUndefined(prop)).map(prop => {
      return prop!.register(increment);
    });

    // Call increment to make sure we're refreshed when `props` are changed
    increment();

    return () => {
      unRegisters.forEach(unRegister => unRegister());
    };
  }, [props.length, ...props]);
}
