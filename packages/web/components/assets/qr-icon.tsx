import classNames from "classnames";
import { FunctionComponent } from "react";

export const QRIcon: FunctionComponent<{
  classes?: Partial<
    Record<
      | "container"
      | "topRightBorder"
      | "bottomLeftBorder"
      | "bottomRightBorder"
      | "topLeftBorder",
      string
    >
  >;
  /**
   * Container must have 'group' class
   */
  isAnimated?: boolean;
}> = ({ classes, isAnimated }) => {
  const _classes: typeof classes = isAnimated
    ? {
        container: classNames("group", classes?.container),
        topRightBorder: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:translate-x-[1px] group-hover:-translate-y-[1px] group-hover:stroke-[2]",
          classes?.topRightBorder
        ),
        topLeftBorder: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] group-hover:stroke-[2]",
          classes?.topLeftBorder
        ),
        bottomRightBorder: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:stroke-[2]",
          classes?.bottomRightBorder
        ),
        bottomLeftBorder: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:-translate-x-[1px] group-hover:translate-y-[1px] group-hover:stroke-[2]",
          classes?.bottomLeftBorder
        ),
      }
    : classes;

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={_classes?.container}
    >
      <path
        d="M16 2H20C21.1046 2 22 2.89543 22 4V8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        className={_classes?.topRightBorder}
      />
      <path
        d="M8 22L4 22C2.89543 22 2 21.1046 2 20L2 16"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        className={_classes?.bottomLeftBorder}
      />
      <path
        d="M22 16L22 20C22 21.1046 21.1046 22 20 22L16 22"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        className={_classes?.bottomRightBorder}
      />
      <path
        d="M2 8L2 4C2 2.89543 2.89543 2 4 2L8 2"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        className={_classes?.topLeftBorder}
      />
      <mask id="path-5-inside-1_226_145" fill="white">
        <rect x="5" y="5" width="6" height="6" rx="1" />
      </mask>
      <rect
        x="5"
        y="5"
        width="6"
        height="6"
        rx="1"
        stroke="white"
        strokeWidth="3"
        mask="url(#path-5-inside-1_226_145)"
      />
      <mask id="path-6-inside-2_226_145" fill="white">
        <rect x="13" y="10" width="6" height="6" rx="1" />
      </mask>
      <rect
        x="13"
        y="10"
        width="6"
        height="6"
        rx="1"
        stroke="white"
        strokeWidth="3"
        mask="url(#path-6-inside-2_226_145)"
      />
      <mask id="path-7-inside-3_226_145" fill="white">
        <rect x="5" y="13" width="6" height="6" rx="1" />
      </mask>
      <rect
        x="5"
        y="13"
        width="6"
        height="6"
        rx="1"
        stroke="white"
        strokeWidth="3"
        mask="url(#path-7-inside-3_226_145)"
      />
      <path
        d="M13 18H18.5M14 6H18.25C18.3881 6 18.5 6.11193 18.5 6.25V8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
