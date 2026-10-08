import { ReactNode } from "react";

export interface TooltipProps {
  content: ReactNode;
  /** Space-separated triggers: mouseenter, focus, click, or manual. */
  trigger?: string;
}
