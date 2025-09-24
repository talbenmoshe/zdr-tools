import React, { useEffect, useState } from 'react';
import { useIsVisible } from '../hooks/useIsVisible';

interface IRenderChildrenWhenVisibleHOCProps {
  dataAid?: string;
  className?: string;
  triggerVisibleOnlyOnce?: boolean;
  onVisibilityChanged: (isVisible: boolean) => void;
}

export function VisibilityPixel(props: IRenderChildrenWhenVisibleHOCProps) {
  const { dataAid, className, triggerVisibleOnlyOnce = true, onVisibilityChanged } = props;
  // This is a "hack" to make sure that the pixel starts off screen
  const [additionalStyle, setAdditionalStyle] = useState<any>({ top: 10000 });
  const { wrapperRef, isVisible } = useIsVisible<HTMLDivElement>({ triggerVisibleOnlyOnce });

  useEffect(() => {
    onVisibilityChanged(isVisible);
  }, [isVisible]);

  useEffect(() => {
    setTimeout(() => {
      setAdditionalStyle({});
    }, 1000);
  }, []);

  return (
    <div
      data-aid={dataAid}
      className={className}
      style={{ width: 1, height: 1, visibility: 'hidden', pointerEvents: 'none', ...additionalStyle }}
      ref={wrapperRef}
    />
  );
}
