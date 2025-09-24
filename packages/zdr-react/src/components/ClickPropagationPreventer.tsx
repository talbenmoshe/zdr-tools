import React, { type FC, type PropsWithChildren, useCallback } from 'react';

interface ClickPropagationPreventerProps {
  as?: string | React.ComponentType<any>;
}

export const ClickPropagationPreventer: FC<PropsWithChildren<ClickPropagationPreventerProps>> = props => {
  const { children, as: Component = 'div' } = props;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Component onClick={handleClick}>
      {children}
    </Component>
  );
};
