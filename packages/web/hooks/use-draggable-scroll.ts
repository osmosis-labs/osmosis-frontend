import React, { RefObject } from "react";

enum Direction {
  Vertical = "vertical",
  Horizontal = "horizontal",
  Both = "both",
}

interface Options {
  direction?: Direction;
}

export default function useDraggableScroll(
  ref: RefObject<HTMLElement>,
  options: Options = { direction: Direction.Horizontal }
) {
  const { direction } = options;

  let initialPosition = { scrollTop: 0, scrollLeft: 0, mouseX: 0, mouseY: 0 };

  const mouseMoveHandler = (event: { clientX: number; clientY: number }) => {
    if (ref.current) {
      const dx = event.clientX - initialPosition.mouseX;
      const dy = event.clientY - initialPosition.mouseY;

      if (direction !== "horizontal")
        ref.current.scrollTop = initialPosition.scrollTop - dy;
      if (direction !== "vertical")
        ref.current.scrollLeft = initialPosition.scrollLeft - dx;
    }
  };

  const mouseUpHandler = () => {
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.userSelect = "auto";
    }

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  const onMouseDown = (event: React.MouseEvent) => {
    const LEFT_CLICK_BUTTON = 0;
    if (event.button !== LEFT_CLICK_BUTTON || event.shiftKey) {
      ref.current!.style.cursor = "default";
      return;
    }

    if (ref.current) {
      initialPosition = {
        scrollLeft: ref.current.scrollLeft,
        scrollTop: ref.current.scrollTop,
        mouseX: event.clientX,
        mouseY: event.clientY,
      };

      ref.current.style.cursor = "grabbing";
      ref.current.style.userSelect = "none";

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    }
  };

  return { onMouseDown };
}
