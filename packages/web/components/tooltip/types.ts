import { ReactNode } from "react";

export interface TooltipProps {
  content: ReactNode;
  /** Tippy space-separated trigger: https://github.com/tvkhoa/react-tippy#props.
   * Options: mouseenter focus click manual
   * Default: click
   */
  trigger?: string;
}
