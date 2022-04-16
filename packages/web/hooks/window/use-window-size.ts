import { useState, useEffect } from "react";

export interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
}

/**
 * Hook into window size, with added check for mobile screen sizes.
 *
 * @param minMobileWidth Min width to be considered mobile screen.
 * @returns [isMobile, windowSize]
 */
export function useWindowSize(minMobileWidth: number = 768): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
    isMobile: true,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < minMobileWidth,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [minMobileWidth]);

  return windowSize;
}
