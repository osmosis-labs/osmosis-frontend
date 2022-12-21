import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { Disableable, CustomClasses } from "../types";

interface Props extends Disableable, CustomClasses {
  /**
   * The value that will be emitted by this radio button.
   */
  value: string;
  onSelectRadio: (value: string) => void;
  /**
   * Current value of the broader radio group.
   */
  groupValue: string;
  /**
   * Identifier to specify which group this radio button is with.
   */
  groupName?: string;
}

/**
 * Example:
 * ```
 * const [r, setR] = useState("a");
 * <Radio value="a" onChange={setR} groupValue={r} disabled />
 * <Radio value="b" onChange={setR} groupValue={r}  />
 * <Radio value="c" onChange={setR} groupValue={r}  />
 * ```
 */
export const Radio: FunctionComponent<Props> = ({
  value,
  onSelectRadio,
  disabled = false,
  groupValue,
  groupName = "radio",
  className,
}) => {
  const isOn = value === groupValue;

  return (
    <label htmlFor="relative toggle-radio">
      <div>
        {isOn && (
          <div
            className={classNames(
              "absolute z-10 cursor-pointer",
              disabled ? "opacity-38 cursor-default" : null
            )}
          >
            <Image alt="" src="/icons/dot.svg" height={20} width={20} />
          </div>
        )}
        <input
          type="radio"
          className={classNames(
            "h-5 w-5 cursor-pointer appearance-none",
            "after:absolute after:h-5 after:w-5 after:rounded-full", // box
            disabled
              ? isOn
                ? "cursor-default opacity-30 checked:after:bg-osmoverse-400" // disabled AND on
                : "cursor-default opacity-30 after:border-2 after:border-osmoverse-400"
              : isOn
              ? "after:bg-wosmongton-200" // not disabled AND on
              : "after:border-2 after:border-wosmongton-200",
            className
          )}
          checked={isOn}
          disabled={disabled}
          name={groupName}
          value={value}
          onChange={(e) => onSelectRadio((e.target as unknown as any).value)}
        />
      </div>
    </label>
  );
};
