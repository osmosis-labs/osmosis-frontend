import { useState } from "react";
import { useIsomorphicLayoutEffect } from "react-use";

import { noop } from "~/utils/function";
import { isBrowser } from "~/utils/ssr";

export type UseMeasureRect = Pick<
  DOMRectReadOnly,
  "x" | "y" | "top" | "left" | "right" | "bottom" | "height" | "width"
>;
export type UseMeasureRef<E extends Element = Element> = (element: E) => void;
export type UseMeasureResult<E extends Element = Element> = [
  UseMeasureRef<E>,
  UseMeasureRect
];

const defaultState: UseMeasureRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

function getDimensionObject(node: HTMLElement): UseMeasureRect {
  const rect = node.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height,
    top: "x" in rect ? rect.x : (rect as any).top,
    left: "y" in rect ? rect.y : (rect as any).left,
    x: "x" in rect ? rect.x : (rect as any).left,
    y: "y" in rect ? rect.y : (rect as any).top,
    right: rect.right,
    bottom: rect.bottom,
  };
}

function useDimensionImpl<E extends Element = Element>(): UseMeasureResult<E> {
  const [element, ref] = useState<E | null>(null);
  const [rect, setRect] = useState<UseMeasureRect>(defaultState);

  useIsomorphicLayoutEffect(() => {
    if (!element) return;
    const measure = () =>
      window.requestAnimationFrame(() =>
        setRect(getDimensionObject(element as any))
      );
    measure();

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [element]);

  return [ref, rect];
}

export const useDimension =
  isBrowser && typeof (window as any).ResizeObserver !== "undefined"
    ? useDimensionImpl
    : ((() => [noop, defaultState]) as typeof useDimensionImpl);
