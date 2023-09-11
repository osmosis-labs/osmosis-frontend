import { FunctionComponent, SVGAttributes } from "react";

import { SpriteIconId } from "~/config";

import spriteSVGURL from "../../public/icons/sprite.svg"; // eslint-disable-line no-restricted-imports

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
