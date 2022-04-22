import { useState, useEffect } from "react";

export interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
}

// https://tailwindcss.com/docs/responsive-design
export const enum Breakpoint {
  SM = 640,
  MD = 768,
  LG = 1024,
  XL = 1280,
  XXL = 1536,
}

/**
 * Hook into window size, with added check for mobile screen sizes.
 *
 * @param maxMobileWidth Min width to be considered mobile screen. Default: 768.
 * @returns [isMobile, windowSize]
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
        isMobile: window.innerWidth < maxMobileWidth,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [maxMobileWidth]);

  return windowSize;
}
