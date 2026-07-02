import classNames from "classnames";
import { FunctionComponent, ReactNode } from "react";

import { CustomClasses } from "~/components/types";

/**
 * Centered heading + body card used for the empty / error states of the
 * "Your Positions" and "Your Pools" sections on the pools page. Kept slim
 * (caption-sized body, `py-3`) so the page jumps less between skeleton ->
 * empty -> populated on first paint.
 */
export const SectionPlaceholderCard: FunctionComponent<
  {
    heading: ReactNode;
    body: ReactNode;
    /** Extra classes for the body paragraph (e.g. `whitespace-pre-line`). */
    bodyClassName?: string;
  } & CustomClasses
> = ({ heading, body, bodyClassName, className }) => (
  <div
    className={classNames(
      "flex w-full flex-col items-center justify-center gap-1 py-3",
      className
    )}
  >
    <p className="text-body2 font-medium text-osmoverse-200">{heading}</p>
    <p
      className={classNames(
        "max-w-md text-center text-caption text-osmoverse-400",
        bodyClassName
      )}
    >
      {body}
    </p>
  </div>
);
