import { FunctionComponent, SVGAttributes } from "react";
import spriteSVGURL from "../../public/icons/sprite.svg";

type IconId =
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
  | "close-small";

/**
 * It takes an icon id and returns an svg element with the corresponding icon defined in /public/icons/sprite.svg.
 */
export const Icon: FunctionComponent<
  SVGAttributes<HTMLOrSVGElement> & {
    id: IconId;
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
