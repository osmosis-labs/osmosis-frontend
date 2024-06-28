"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import classNames from "classnames";
import * as React from "react";

const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={classNames(
        "flex rounded-full border border-osmoverse-700",
        className
      )}
      {...props}
      ref={ref}
    />
  );
});
ButtonGroup.displayName = RadioGroupPrimitive.Root.displayName;

const ButtonGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  {
    label: string;
  } & React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, label, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={classNames(
        "rounded-full px-3 py-1 text-center text-sm font-medium text-wosmongton-100 hover:text-wosmongton-200 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-osmoverse-700 data-[state=checked]:text-white-full",
        className
      )}
      {...props}
    >
      {label}
    </RadioGroupPrimitive.Item>
  );
});

ButtonGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { ButtonGroup, ButtonGroupItem };
