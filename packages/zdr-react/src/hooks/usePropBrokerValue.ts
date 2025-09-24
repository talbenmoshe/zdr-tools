import type { IPropEventBroker } from '@zdr-tools/zdr-entities';
import { useEffect } from 'react';
import { debounce, throttle } from 'es-toolkit/compat';
import { useIncrement } from './useIncrement';

type ThrottleSettings = Parameters<typeof throttle>[2];
type DebounceOptions = Parameters<typeof debounce>[2];

interface IPropEventBrokerTiming {
  throttle?: ThrottleSettings;
  debounce?: DebounceOptions;
  wait: number;
}

interface IPropEventBrokerOptions {
  timing?: IPropEventBrokerTiming;
}

export function usePropBrokerValue<T extends any>(
  broker: IPropEventBroker<T>,
  options?: IPropEventBrokerOptions
): T {
  const { increment } = useIncrement();

  useEffect(() => {
    let updater = increment;
    const wait = options?.timing?.wait ?? 0;

    if (options?.timing?.throttle) {
      updater = throttle(increment, wait, options.timing.throttle);
    } else if (options?.timing?.debounce) {
      updater = debounce(increment, wait, options.timing.debounce);
    }

    return broker.register(updater);
  }, [broker, options?.timing?.wait]);

  return broker.get();
}
