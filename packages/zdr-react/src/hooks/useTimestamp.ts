import { useState, useCallback } from 'react';
import { getCurrentTimestamp } from '@zdr-tools/zdr-entities';

export function useTimestamp() {
  const [timestamp, setTimestamp] = useState<number>(getCurrentTimestamp());

  const setCurrentTimestamp = useCallback(() => {
    setTimestamp(getCurrentTimestamp());
  }, []);

  return { timestamp, setCurrentTimestamp };
}
