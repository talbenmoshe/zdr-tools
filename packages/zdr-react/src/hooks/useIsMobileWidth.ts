import { useEffect, useMemo } from 'react';
import { useIncrement } from './useIncrement';

export function useIsMobileWidth(width: string | undefined = '470px') {
  const { increment } = useIncrement();
  const mediaListObj = useMemo(() => window.matchMedia(`(max-width: ${width})`), [width]);
  useEffect(() => {
    function onChange() {
      increment();
    }

    mediaListObj.addEventListener('change', function() {
      onChange();
    });

    onChange();

    return () => {
      mediaListObj.removeEventListener('change', onChange);
    };
  }, [mediaListObj]);

  return mediaListObj.matches;
}
