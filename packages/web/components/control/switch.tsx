import { FunctionComponent } from "react";
import classNames from "classnames";

interface Props {
  isOn: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const Switch: FunctionComponent<Props> = ({
  isOn,
  onChange,
  disabled = false,
}) => (
  <label htmlFor="toggle-switch">
    <input
      type="checkbox"
      id="toggle-switch"
      className={classNames(
        "cursor-pointer h-8 w-12 rounded-full appearance-none bg-iconDefault transition duration-200 relative",
        "after:h-6 after:w-6 after:rounded-full after:bg-white-high after:absolute after:left-1 after:top-1 after:transform after:scale-110 after:transition after:duration-200", // dot
        "checked:after:transform checked:after:scale-110 checked:after:translate-x-4", // dot on transform
        disabled
          ? "opacity-25 cursor-default bg-iconDefault"
          : "checked:bg-primary-200" // disabled
      )}
      checked={isOn}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
  </label>
);
