import classNames from "classnames";
import { FunctionComponent } from "react";

export const LogOutIcon: FunctionComponent<{
  classes?: Partial<
    Record<"container" | "door" | "arrowBody" | "arrow", string>
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
        arrow: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:translate-x-[1.5px]",
          classes?.arrow
        ),
        arrowBody: classNames(
          "transform transition-transform duration-150 ease-in",
          "group-hover:translate-x-[1.5px]",
          classes?.arrowBody
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
        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.door}
      />
      <path
        d="M16 17L21 12L16 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.arrowBody}
      />
      <path
        d="M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.arrow}
      />
    </svg>
  );
};
