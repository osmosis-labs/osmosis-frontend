import { FunctionComponent, SVGAttributes } from "react";

import spriteSVGURL from "../../public/icons/sprite.svg";

export type SpriteIconId =
  | "chevron-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "setting"
  | "hamburger"
  | "search"
  | "up-down-arrow"
  | "close"
  | "info"
  | "globe"
  | "dust-broom"
  | "arrow-right"
  | "close-small"
  | "tune"
  | "help-circle"
  | "kado-logo"
  | "transak-logo"
  | "more-menu"
  | "sort-up"
  | "sort-down"
  | "check-mark"
  | "minus"
  | "alert-triangle";

/**
 * It takes an icon id and returns an svg element with the corresponding icon defined in /public/icons/sprite.svg.
 */
export const Icon: FunctionComponent<
  SVGAttributes<HTMLOrSVGElement> & {
    id: SpriteIconId;
    className?: string;
  }
> = (props) => {
  const { id, ...rest } = props;
  return (
    <svg width="24" height="24" {...rest}>
      <use href={`${spriteSVGURL}#${id}`} />
    </svg>
  );
};
