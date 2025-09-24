import { type IIntersectionChangedParams, IntersectionObserverService } from '@zdr-tools/zdr-native-web';
import React, { useState, useRef, useLayoutEffect } from 'react';

const renderObserverService = new IntersectionObserverService();
interface IIsVisibleOptions {
  triggerVisibleOnlyOnce?: boolean;
}

export function useIsVisible<T extends Element>(options: IIsVisibleOptions) {
  const wrapperRef = useRef<T>() as React.MutableRefObject<T>;
  const triggerVisibleOnlyOnce = !!options?.triggerVisibleOnlyOnce;
  const [isVisible, setIsVisible] = useState(false);

  useLayoutEffect(() => {
    const currentElement = wrapperRef.current;

    function onVisibilityChanged(data: IIntersectionChangedParams) {
      const { entries } = data;
      const target = entries.find(entry => {
        return entry.target === currentElement;
      });

      if (target) {
        setIsVisible(currentIsVisible => {
          let finalIsVisible = !!target?.isIntersecting;

          if (triggerVisibleOnlyOnce) {
            finalIsVisible = currentIsVisible || finalIsVisible;
          }

          return finalIsVisible;
        });
      }
    }

    const unregister = renderObserverService.intersectionChanged.register(onVisibilityChanged);
    renderObserverService.observe(currentElement as Element);

    return () => {
      unregister();
      renderObserverService.unobserve(currentElement as Element);
    };
  }, [wrapperRef.current, triggerVisibleOnlyOnce]);

  return { wrapperRef, isVisible };
}
