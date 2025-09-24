
import { useEffect } from 'react';
import type { IReadablePropEventBroker, OptionalViolations } from '@zdr-tools/zdr-entities';
import { isUndefined } from 'es-toolkit/compat';
import { useIncrement } from './useIncrement';

type ExtractV1<T> = T extends IReadablePropEventBroker<infer V, any> ? V : never;
type ExtractB1<T> = T extends IReadablePropEventBroker<any, infer B> ? B : never;
type Helper = IReadablePropEventBroker<any, any>;
export type BrokerTuple<T1> = [ExtractV1<T1>, OptionalViolations<ExtractB1<T1>> | undefined, ];

export function useReadableEventRefresher<T1 extends Helper>(prop: T1): [BrokerTuple<T1>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper>(prop: T1, prop2: T2): [BrokerTuple<T1>, BrokerTuple<T2>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper>(prop: T1, prop2: T2, prop3: T3): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper, T6 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5, prop6: T6): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>, BrokerTuple<T6>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper, T6 extends Helper, T7 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5, prop6: T6, prop7: T7): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>, BrokerTuple<T6>, BrokerTuple<T7>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper, T6 extends Helper, T7 extends Helper, T8 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5, prop6: T6, prop7: T7, prop8: T8): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>, BrokerTuple<T6>, BrokerTuple<T7>, BrokerTuple<T8>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper, T6 extends Helper, T7 extends Helper, T8 extends Helper, T9 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5, prop6: T6, prop7: T7, prop8: T8, prop9: T9): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>, BrokerTuple<T6>, BrokerTuple<T7>, BrokerTuple<T8>, BrokerTuple<T9>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper, T6 extends Helper, T7 extends Helper, T8 extends Helper, T9 extends Helper, T10 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5, prop6: T6, prop7: T7, prop8: T8, prop9: T9, prop10: T10): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>, BrokerTuple<T6>, BrokerTuple<T7>, BrokerTuple<T8>, BrokerTuple<T9>, BrokerTuple<T10>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper, T6 extends Helper, T7 extends Helper, T8 extends Helper, T9 extends Helper, T10 extends Helper, T11 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5, prop6: T6, prop7: T7, prop8: T8, prop9: T9, prop10: T10, prop11: T11): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>, BrokerTuple<T6>, BrokerTuple<T7>, BrokerTuple<T8>, BrokerTuple<T9>, BrokerTuple<T10>, BrokerTuple<T11>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper, T6 extends Helper, T7 extends Helper, T8 extends Helper, T9 extends Helper, T10 extends Helper, T11 extends Helper, T12 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5, prop6: T6, prop7: T7, prop8: T8, prop9: T9, prop10: T10, prop11: T11, prop12: T12): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>, BrokerTuple<T6>, BrokerTuple<T7>, BrokerTuple<T8>, BrokerTuple<T9>, BrokerTuple<T10>, BrokerTuple<T11>, BrokerTuple<T12>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper, T6 extends Helper, T7 extends Helper, T8 extends Helper, T9 extends Helper, T10 extends Helper, T11 extends Helper, T12 extends Helper, T13 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5, prop6: T6, prop7: T7, prop8: T8, prop9: T9, prop10: T10, prop11: T11, prop12: T12, prop13: T13): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>, BrokerTuple<T6>, BrokerTuple<T7>, BrokerTuple<T8>, BrokerTuple<T9>, BrokerTuple<T10>, BrokerTuple<T11>, BrokerTuple<T12>, BrokerTuple<T13>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper, T6 extends Helper, T7 extends Helper, T8 extends Helper, T9 extends Helper, T10 extends Helper, T11 extends Helper, T12 extends Helper, T13 extends Helper, T14 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5, prop6: T6, prop7: T7, prop8: T8, prop9: T9, prop10: T10, prop11: T11, prop12: T12, prop13: T13, prop14: T14): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>, BrokerTuple<T6>, BrokerTuple<T7>, BrokerTuple<T8>, BrokerTuple<T9>, BrokerTuple<T10>, BrokerTuple<T11>, BrokerTuple<T12>, BrokerTuple<T13>, BrokerTuple<T14>];
export function useReadableEventRefresher<T1 extends Helper, T2 extends Helper, T3 extends Helper, T4 extends Helper, T5 extends Helper, T6 extends Helper, T7 extends Helper, T8 extends Helper, T9 extends Helper, T10 extends Helper, T11 extends Helper, T12 extends Helper, T13 extends Helper, T14 extends Helper, T15 extends Helper>(prop: T1, prop2: T2, prop3: T3, prop4: T4, prop5: T5, prop6: T6, prop7: T7, prop8: T8, prop9: T9, prop10: T10, prop11: T11, prop12: T12, prop13: T13, prop14: T14, prop15: T15): [BrokerTuple<T1>, BrokerTuple<T2>, BrokerTuple<T3>, BrokerTuple<T4>, BrokerTuple<T5>, BrokerTuple<T6>, BrokerTuple<T7>, BrokerTuple<T8>, BrokerTuple<T9>, BrokerTuple<T10>, BrokerTuple<T11>, BrokerTuple<T12>, BrokerTuple<T13>, BrokerTuple<T14>, BrokerTuple<T15>];

export function useReadableEventRefresher(...props: any[]): any[] {
  const { increment } = useIncrement();

  useEffect(() => {
    const filteredBrokers = props.filter(prop => !isUndefined(prop));
    const unRegisters = filteredBrokers.map(prop => {
      return prop!.register(increment);
    });

    const unRegisters2 = filteredBrokers.map(prop => {
      return prop!.violationsChanged.register(increment);
    });

    // Call set increment to make sure we're refreshed when `props` are changed
    increment();

    return () => {
      unRegisters.forEach(unRegister => unRegister());
      unRegisters2.forEach(unRegister => unRegister());
    };
  }, props);

  return props.map(prop => prop ? [prop.get(), prop.getViolations()] : undefined);
}

