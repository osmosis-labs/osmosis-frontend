import classNames from "classnames";
import { FunctionComponent } from "react";

export const MobileSessionIcon: FunctionComponent<{
  classes?: Partial<
    Record<"container" | "monitor" | "phone" | "stand", string>
  >;
  /**
   * Container must have 'group' class
   */
  isAnimated?: boolean;
}> = ({ classes, isAnimated }) => {
  const _classes: typeof classes = isAnimated
    ? {
        ...classes,
        container: classNames("group text-inherit", classes?.container),
        monitor: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:-translate-x-[0.5px] group-hover:-translate-y-[0.5px]",
          classes?.monitor
        ),
        phone: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:translate-x-[0.5px] group-hover:translate-y-[0.5px]",
          classes?.phone
        ),
        stand: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:-translate-x-[0.5px] group-hover:-translate-y-[0.5px]",
          classes?.stand
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
        d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.monitor}
      />
      <path
        d="M10 19v-3.96 3.15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.stand}
      />
      <path
        d="M7 19h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.stand}
      />
      <rect
        width="6"
        height="10"
        x="16"
        y="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.phone}
      />
    </svg>
  );
};
