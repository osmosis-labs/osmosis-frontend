import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { FunctionComponent } from "react";

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
        className={`border-white relative z-10 flex h-[1.5rem] w-[1.5rem] items-center justify-center rounded-[0.5rem] border-[0.15rem] border-osmoverse-300 ${className}`}
        {...containerProps}
        indeterminate={isIndeterminate}
      >
        <CheckboxPrimitive.Indicator asChild>
          <CheckIcon color="#B0AADC" width={25} className={checkClassName} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <div className="cursor-pointer pl-3 md:pl-1">{children}</div>
    </label>
  );
};
