import { useEffect, useState } from "react";

import { Breakpoint } from "../../components/types";

export interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
}

/**
 * Hook into window size, with added check for mobile screen sizes.
 *
 * @param maxMobileWidth Min width to be considered mobile screen. Default: 768.
 * @returns '{ width: number, height: number, isMobile: boolean }'
 */
export function useWindowSize(
  maxMobileWidth: Breakpoint = Breakpoint.MD
): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
    isMobile: false,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= maxMobileWidth,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [maxMobileWidth]);

  return windowSize;
}
