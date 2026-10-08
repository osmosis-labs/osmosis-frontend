import {
  arrow as positionArrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  Placement,
  safePolygon,
  shift,
  useClick,
  useDelayGroup,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import classNames from "classnames";
import { PropsWithChildren, useCallback, useState } from "react";

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
  arrow = false,
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
  const [arrowElement, setArrowElement] = useState<SVGSVGElement | null>(null);
  const [pointerType, setPointerType] = useState<string>();
  const [nested, setNested] = useState(false);
  const open = !disabled && (visible ?? isOpen);
  const enabled = !disabled && !skipTrigger && visible === undefined;
  const triggers = trigger.split(/\s+/);
  const clicks = triggers.includes("click");

  // Interaction hooks stop tracking while disabled, so a pending close would be lost.
  if (!enabled && isOpen) setIsOpen(false);

  const {
    refs: { setReference, setFloating },
    floatingStyles,
    context,
  } = useFloating({
    open,
    onOpenChange: (nextOpen, _event, reason) => {
      // A tap opens hover/focus tooltips; its trailing click must not close them again.
      if (reason === "reference-press" && pointerType !== "mouse") {
        return;
      }
      setIsOpen(nextOpen);
    },
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
  const { delay } = useDelayGroup(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, {
      enabled: enabled && triggers.includes("mouseenter"),
      delay,
      handleClose: interactive ? safePolygon() : undefined,
    }),
    useFocus(context, { enabled: enabled && triggers.includes("focus") }),
    useClick(context, { enabled: enabled && clicks, toggle: hideOnClick }),
    useDismiss(context, {
      enabled,
      outsidePress: hideOnClick,
      referencePress: hideOnClick && !clicks,
      referencePressEvent: "click",
    }),
    useRole(context, { role: interactive ? "dialog" : "tooltip" }),
  ]);

  // Inside a button or link, the outer control already owns focus and the button role.
  const setReferenceElement = useCallback(
    (element: HTMLDivElement | null) => {
      setReference(element);
      if (element) {
        setNested(!!element.parentElement?.closest("button, a, [role=button]"));
      }
    },
    [setReference]
  );
  const ownsFocus = enabled && clicks && !nested;

  return (
    <>
      <div
        ref={setReferenceElement}
        className={classNames("flex cursor-pointer align-middle", className)}
        {...getReferenceProps({
          // Focus on focusable children bubbles here; only click triggers need their own tab stop.
          tabIndex: ownsFocus ? 0 : undefined,
          role: ownsFocus ? "button" : undefined,
          onPointerDown: (e) => setPointerType(e.pointerType),
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
                <FloatingArrow
                  ref={setArrowElement}
                  context={context}
                  className="fill-osmoverse-1000 stroke-osmoverse-100"
                  strokeWidth={1}
                />
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
};
