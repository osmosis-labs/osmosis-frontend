import { useEffect, useState } from "react";

export interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isLargeDesktop: boolean;
  isExtraLargeDesktop: boolean;
}

/** Should match settings in tailwind.config.js
 *
 *  https://tailwindcss.com/docs/responsive-design
 */
export const enum Breakpoint {
  SM = 640,
  MD = 768,
  LG = 1024,
  XLG = 1152,
  XL = 1280,
  XLHALF = 1408,
  XXL = 1536,
  XXXL = 1792,
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
    isLargeDesktop: false,
    isExtraLargeDesktop: false,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= maxMobileWidth,
        isLargeDesktop: window.innerWidth >= Breakpoint.XXL,
        isExtraLargeDesktop: window.innerWidth >= Breakpoint.XXXL,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [maxMobileWidth]);

  return windowSize;
}
