import { useEffect, useState } from "react";

/**
 * Hook into the window scroll position.
 * @returns [yPosition, isOnTop]
 */
export function useWindowScroll(): [number, boolean] {
  const [yPosition, setYPosition] = useState(
    typeof window !== "undefined" ? window.scrollY : 0
  );

  useEffect(() => {
    const checkAndSetWindowIsOnTop = () => {
      setYPosition(window.scrollY);
    };

    window.addEventListener("scroll", checkAndSetWindowIsOnTop);
    checkAndSetWindowIsOnTop();

    return () => window.removeEventListener("scroll", checkAndSetWindowIsOnTop);
  }, []);

  return [yPosition, yPosition === 0];
}
