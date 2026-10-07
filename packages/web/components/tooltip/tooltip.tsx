import {
  arrow as positionArrow,
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  Placement,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import classNames from "classnames";
import { PropsWithChildren, useState } from "react";

import { TooltipProps } from "~/components/tooltip/types";
import { CustomClasses } from "~/components/types";

export const Tooltip = ({
  content,
  trigger = "mouseenter focus",
  children,
  className,
  rootClassNames,
  enablePropagation,
  skipTrigger,
  disabled = false,
  visible,
  interactive = false,
  hideOnClick = true,
  maxWidth = 350,
  placement = "top",
  arrow = true,
}: PropsWithChildren<
  TooltipProps &
    CustomClasses & {
      rootClassNames?: string;
      enablePropagation?: boolean;
      skipTrigger?: boolean;
      disabled?: boolean;
      visible?: boolean;
      interactive?: boolean;
      hideOnClick?: boolean;
      maxWidth?: number | string;
      placement?: Placement;
      arrow?: boolean;
    }
>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const open = !disabled && (visible ?? isOpen);
  const enabled = !disabled && !skipTrigger && visible === undefined;
  const triggers = trigger.split(/\s+/);
  const clicks = triggers.includes("click");
  const {
    refs: { setReference, setFloating },
    floatingStyles,
    context,
    middlewareData,
    placement: side,
  } = useFloating({
    open,
    onOpenChange: setIsOpen,
    placement,
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip(),
      shift({ padding: 8 }),
      arrow && positionArrow({ element: arrowElement }),
    ],
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, {
      enabled: enabled && triggers.includes("mouseenter"),
      handleClose: interactive ? safePolygon() : undefined,
    }),
    useFocus(context, {
      enabled: enabled && triggers.includes("focus"),
      visibleOnly: false,
    }),
    useClick(context, { enabled: enabled && clicks, toggle: hideOnClick }),
    useDismiss(context, {
      enabled,
      outsidePress: hideOnClick,
      referencePress: hideOnClick && !clicks,
      referencePressEvent: "click",
    }),
    useRole(context, { role: interactive ? "dialog" : "tooltip" }),
  ]);
  const arrowSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[side.split("-")[0] as "top" | "right" | "bottom" | "left"];

  return (
    <>
      <div
        ref={setReference}
        className={classNames("flex cursor-pointer align-middle", className)}
        {...getReferenceProps({
          tabIndex:
            enabled && (clicks || triggers.includes("focus")) ? 0 : undefined,
          role: clicks ? "button" : undefined,
          onClick: enablePropagation ? undefined : (e) => e.stopPropagation(),
        })}
      >
        {children}
      </div>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={-1}
            disabled={!interactive}
          >
            <div
              ref={setFloating}
              className={classNames(
                "body2 rounded-xl border border-osmoverse-100 bg-osmoverse-1000 px-3 py-2.5 md:px-2 md:py-1.5",
                rootClassNames
              )}
              style={{
                ...floatingStyles,
                maxWidth,
                zIndex: 9999,
                pointerEvents: interactive ? "auto" : "none",
              }}
              {...getFloatingProps()}
            >
              {content}
              {arrow && (
                <div
                  ref={setArrowElement}
                  className="pointer-events-none absolute h-2 w-2 rotate-45 bg-inherit"
                  style={{
                    left: middlewareData.arrow?.x,
                    top: middlewareData.arrow?.y,
                    [arrowSide]: -4,
                  }}
                />
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};
