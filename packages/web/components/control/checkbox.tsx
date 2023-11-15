import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { ToggleProps } from "~/components/control/types";
import { CustomClasses, Disableable } from "~/components/types";

export const CheckBox: FunctionComponent<
  ToggleProps &
    Disableable &
    CustomClasses & {
      labelClassName?: string;
      checkClassName?: string;
      isIndeterminate?: boolean;
      containerProps?: Record<string, any>;
    }
> = ({
  isOn,
  onToggle,
  disabled = false,
  labelClassName,
  checkClassName,
  className,
  children,
  isIndeterminate,
  containerProps = {},
}) => {
  return (
    <label className={`relative flex select-none ${labelClassName}`}>
      <CheckboxPrimitive.Root
        checked={isOn}
        onCheckedChange={onToggle}
        disabled={disabled}
        className={classNames(
          "border-white relative z-10 flex h-[1.5rem] w-[1.5rem] items-center justify-center rounded-[0.5rem] border-[0.15rem] border-osmoverse-300",
          isOn ? " bg-osmoverse-300" : "bg-transparent",
          className
        )}
        {...containerProps}
      >
        <CheckboxPrimitive.Indicator asChild>
          {isIndeterminate ? (
            <Icon
              id="minus"
              className={classNames(
                "absolute z-20 h-[11px] w-[15px] cursor-pointer text-osmoverse-800",
                disabled ? "cursor-default opacity-50" : null,
                checkClassName
              )}
            />
          ) : (
            <Icon
              id="check-mark"
              className={classNames(
                "absolute z-20 h-[11px] w-[15px] cursor-pointer text-osmoverse-800",
                disabled ? "cursor-default opacity-50" : null,
                checkClassName
              )}
            />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <div className="cursor-pointer pl-3 md:pl-1">{children}</div>
    </label>
  );
};
