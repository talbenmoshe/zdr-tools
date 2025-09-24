import { EMPTY_ARRAY } from '@zdr-tools/zdr-entities';
import { useState, useMemo } from 'react';

declare type UseOpenCloseType = [boolean, () => void, () => void];

export function useOpenClose(): UseOpenCloseType {
  const [isOpen, setIsOpen] = useState(false);
  const props: UseOpenCloseType = useMemo(() => [
    isOpen,
    () => {
      setIsOpen(true);
    },
    () => {
      setIsOpen(false);
    }
  ], EMPTY_ARRAY);

  props[0] = isOpen;

  return props;
}
