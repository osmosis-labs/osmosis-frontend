import { FunctionComponent } from "react";
import classNames from "classnames";
import { InputProps, Disableable, CustomClasses } from "../types";

interface Props extends InputProps<string>, Disableable, CustomClasses {
  /** Number of characters to allow in the input box. */
  size?: number;
  /** Border style of the component, see Figma. */
  border?: "normal" | "error" | "none";
  /** Determine if input text is right justified. Setting to `true` will ignore all accessory buttons. */
  rightEntry?: boolean;
  /** Will only render the first two. If `clearButton` is enabled, will show that as long as `currentValue !== ""`. */
  labelButtons?: ({
    label: string;
    onClick: () => void;
  } & CustomClasses)[];
  /** Show a clear button when `currentValue !== ""`. */
  clearButton?: boolean;
}

export const InputBox: FunctionComponent<Props> = ({
  currentValue,
  onChange,
  size = 32,
  border = "normal",
  rightEntry = false,
  labelButtons = [],
  clearButton = false,
  disabled = false,
  className,
}) => (
  <div
    className={classNames(
      "flex w-fit h-11 rounded-lg border border-secondary-200",
      className
    )}
  >
    <label htmlFor="text-input">
      <input
        id="text-input"
        className="appearance-none bg-transparent py-2 px-3"
        value={currentValue}
        size={size}
        onInput={(e: any) => onChange(e.target.value)}
        onClick={(e: any) => e.target.select()}
      />
    </label>
    <div>
      {labelButtons.map(({ label, onClick, className }, i) => (
        <button
          key={i}
          className={classNames(
            "h-8 border-2 border-primary-200 rounded-md my-1.5",
            className
          )}
          onClick={onClick}
        >
          <span className="mx-2">{label}</span>
        </button>
      ))}
    </div>
  </div>
);
