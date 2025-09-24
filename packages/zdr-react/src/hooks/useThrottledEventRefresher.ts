import type { IEventBroker } from '@zdr-tools/zdr-entities';
import { useEffect } from 'react';
import { throttle, isUndefined } from 'es-toolkit/compat';
import { useIncrement } from './useIncrement';

export function useThrottledEventRefresher(wait: number, ...props: (IEventBroker | undefined)[]) {
  const { increment } = useIncrement();

  useEffect(() => {
    const throttledChangeTimestamp = throttle(increment, wait);

    const unRegisters = props.filter(prop => !isUndefined(prop)).map(prop => {
      return prop!.register(throttledChangeTimestamp);
    });

    // Call set current timestamp to make sure we're refreshed when `props` are changed
    increment();

    return () => {
      unRegisters.forEach(unRegister => unRegister());
    };
  }, props);
}
