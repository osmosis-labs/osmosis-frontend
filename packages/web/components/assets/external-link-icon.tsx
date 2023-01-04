import classNames from "classnames";
import { FunctionComponent } from "react";

export const ExternalLinkIcon: FunctionComponent<{
  classes?: Partial<
    Record<"container" | "box" | "arrowBody" | "arrowHead", string>
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
        box: classNames(
          "transform transition-all duration-150 ease-in",
          "group-hover:-translate-x-[0.5px] group-hover:translate-y-[0.5px] group-hover:stroke-[2.2px]",
          classes?.box
        ),
        arrowHead: classNames(
          "transform transition-all duration-150 ease-in",
          "group-hover:translate-x-[1px] group-hover:-translate-y-[1px] group-hover:stroke-[2.2px]",
          classes?.arrowHead
        ),
        arrowBody: classNames(
          "transform transition-all duration-150 ease-in",
          "group-hover:translate-x-[1px] group-hover:-translate-y-[1px] group-hover:stroke-[2.2px]",
          classes?.arrowBody
        ),
      }
    : classes;

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={_classes?.container}
    >
      <path
        d="M18.5 13V19C18.5 19.5304 18.2893 20.0391 17.9142 20.4142C17.5391 20.7893 17.0304 21 16.5 21H5.5C4.96957 21 4.46086 20.7893 4.08579 20.4142C3.71071 20.0391 3.5 19.5304 3.5 19V8C3.5 7.46957 3.71071 6.96086 4.08579 6.58579C4.46086 6.21071 4.96957 6 5.5 6H11.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.box}
      />
      <path
        d="M15.5 3H21.5V9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.arrowHead}
      />
      <path
        d="M10.5 14L21.5 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={_classes?.arrowBody}
      />
    </svg>
  );
};
