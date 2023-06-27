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
  | "close-thin"
  | "info"
  | "globe"
  | "dust-broom"
  | "arrow-right"
  | "close-small"
  | "walletconnect"
  | "tune"
  | "help-circle"
  | "kado-logo"
  | "transak-logo"
  | "more-menu"
  | "sort-up"
  | "sort-down"
  | "check-mark"
  | "minus"
  | "github"
  | "twitter"
  | "medium"
  | "sandbox"
  | "bell"
  | "email"
  | "telegram"
  | "smartphone"
  | "alert-triangle"
  | "lightning"
  | "lightning-small"
  | "left-right-arrow"
  | "wallet"
  | "left-right"
  | "arrow-right"
  | "zoom-in"
  | "zoom-out"
  | "refresh-ccw"
  | "superfluid-osmo";

/**
 * It takes an icon id and returns an svg element with the corresponding icon defined in /public/icons/sprite.svg.
 */
export const Icon: FunctionComponent<
  SVGAttributes<HTMLOrSVGElement> & {
    id: SpriteIconId;
    label?: string;
    className?: string;
  }
> = (props) => {
  const { id, label, ...rest } = props;
  return (
    <>
      <svg width="24" height="24" {...rest}>
        <use href={`${spriteSVGURL}#${id}`} />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </>
  );
};
