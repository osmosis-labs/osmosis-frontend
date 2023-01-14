import { FunctionComponent, SVGAttributes } from "react";

type IconId =
  | "chevron-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "setting"
  | "search"
  | "up-down-arrow";

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
      <use href={`/icons/sprite.svg#${id}`} />
    </svg>
  );
};
