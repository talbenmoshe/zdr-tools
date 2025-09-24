import { useState, useCallback } from 'react';

export function useIncrement() {
  const [currentNumber, setCurrentNumber] = useState<number>(0);

  const increment = useCallback(() => {
    setCurrentNumber(prev => prev + 1);
  }, []);

  return { currentNumber, increment };
}
