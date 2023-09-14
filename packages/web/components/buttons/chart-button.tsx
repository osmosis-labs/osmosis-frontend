import classNames from "classnames";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { SpriteIconId } from "~/config";

export const ChartButton: FunctionComponent<{
  alt?: string;
  icon?: SpriteIconId;
  label?: string;
  selected: boolean;
  onClick: () => void;
}> = (props) => {
  const isIcon = Boolean(props.icon) && !props.label;
  const isLabel = Boolean(props.label) && !props.icon;

  return (
    <button
      className={classNames(
        "flex h-6 cursor-pointer items-center justify-center",
        "rounded-lg bg-osmoverse-800 px-2 text-caption hover:bg-osmoverse-900",
        "whitespace-nowrap",
        {
          "!bg-osmoverse-600": props.selected,
        }
      )}
      onClick={props.onClick}
    >
      {isIcon && (
        <Icon
          id={props.icon!}
          label={props.alt}
          width={16}
          height={16}
          className="text-osmoverse-300"
        />
      )}
      {isLabel && props.label}
    </button>
  );
};
