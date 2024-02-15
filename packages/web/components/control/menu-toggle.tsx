import classNames from "classnames";
import { FunctionComponent } from "react";

import { MenuOption } from "~/components/control/types";
import { Disableable } from "~/components/types";

type Classes = "root" | "toggleContainer";

interface Props extends Disableable {
  options: MenuOption[];
  selectedOptionId: string;
  onSelect: (optionId: string) => void;
  classes?: Partial<Record<Classes, string>>;
}

export const MenuToggle: FunctionComponent<Props> = ({
  options,
  selectedOptionId,
  onSelect,
  disabled,
  classes,
}) => (
  <div
    className={classNames(
      "flex h-fit flex-shrink-0 rounded-full bg-osmoverse-700 transition-opacity",
      {
        "opacity-50": disabled,
      },
      classes?.root
    )}
  >
    {options.map(({ id, display }) => (
      <label
        key={id}
        htmlFor={"menu-radio"}
        className={classNames(
          "relative h-10 w-full cursor-pointer select-none px-4 py-2 text-center",
          {
            "rounded-full bg-wosmongton-400": id === selectedOptionId,
          },
          classes?.toggleContainer
        )}
      >
        <input
          id="menu-radio"
          type="radio"
          className={classNames(
            "absolute z-20 h-full w-full cursor-pointer appearance-none",
            "after:absolute after:h-full after:w-full",
            {
              "text-osmoverse-300": id !== selectedOptionId,
            }
          )}
          value={id}
          radioGroup={options.reduce((ids, { id }) => ids + id, "")}
          checked={id === selectedOptionId}
          onChange={() => onSelect(id)}
          disabled={disabled}
        ></input>
        <span
          className={classNames("subtitle2 relative z-10", {
            "text-osmoverse-300": id !== selectedOptionId,
          })}
        >
          {display}
        </span>
      </label>
    ))}
  </div>
);
