import { RefObject, useEffect, useState } from "react";

interface ScrollMeasureResults {
  scrollHeight: number;
  scrollWidth: number;
  offsetHeight: number;
  offsetWidth: number;
}

/**
 * custom React hook that provides measurements related to the scroll and offset dimensions
 * of a given HTMLElement, specified by the provided RefObject.
 *
 * @param {React.RefObject<HTMLElement>} ref - RefObject representing the HTMLElement for which measurements are needed.
 * @returns {{ measure: ScrollMeasureResults }}
 *   An object containing measurements for the specified HTMLElement, including:
 *   - scrollHeight: The total height of the content, including hidden overflow.
 *   - scrollWidth: The total width of the content, including hidden overflow.
 *   - offsetHeight: The height of the content, including padding but excluding borders and scrollbars.
 *   - offsetWidth: The width of the content, including padding but excluding borders and scrollbars.
 *
 * @example
 * // Usage example:
 * import { useRef } from "react";
 * import useScrollMeasure from "./useScrollMeasure";
 *
 * const MyComponent = () => {
 *   const elementRef = useRef(null);
 *   const { measure } = useScrollMeasure(elementRef);
 *
 *   return (
 *     <div ref={elementRef}>
 *       ...
 *     </div>
 *   );
 * };
 */
const useScrollMeasure = (
  ref: RefObject<HTMLElement>
): {
  measure: ScrollMeasureResults;
} => {
  const [measure, setMeasure] = useState({
    scrollHeight: 0,
    scrollWidth: 0,
    offsetHeight: 0,
    offsetWidth: 0,
  });

  useEffect(() => {
    if (ref.current) {
      setMeasure({
        scrollHeight: ref.current.scrollHeight,
        scrollWidth: ref.current.scrollWidth,
        offsetHeight: ref.current.offsetHeight,
        offsetWidth: ref.current.offsetWidth,
      });
    }
  }, [ref]);

  return {
    measure,
  };
};

export default useScrollMeasure;
