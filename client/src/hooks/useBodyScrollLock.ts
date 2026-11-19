import { useLayoutEffect } from 'react';

interface OriginalScrollStyles {
  bodyOverflow: string;
  bodyPaddingRight: string;
}

let activeLocks = 0;
let originalStyles: OriginalScrollStyles | null = null;

export const useBodyScrollLock = (isLocked: boolean): void => {
  useLayoutEffect(() => {
    if (!isLocked) return;

    const root = document.documentElement;
    const body = document.body;

    if (activeLocks === 0) {
      originalStyles = {
        bodyOverflow: body.style.overflow,
        bodyPaddingRight: body.style.paddingRight,
      };

      const scrollbarWidth = window.innerWidth - root.clientWidth;
      const bodyPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) body.style.paddingRight = `${bodyPadding + scrollbarWidth}px`;
    }

    activeLocks += 1;
    return () => {
      activeLocks -= 1;
      if (activeLocks > 0 || !originalStyles) return;

      body.style.overflow = originalStyles.bodyOverflow;
      body.style.paddingRight = originalStyles.bodyPaddingRight;
      originalStyles = null;
    };
  }, [isLocked]);
};
