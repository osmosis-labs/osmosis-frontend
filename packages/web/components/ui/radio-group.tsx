"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import classNames from "classnames";
import * as React from "react";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={classNames("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={classNames(
        "focus-visible:ring-ring aspect-square h-5 w-5 rounded-full border-2 text-osmoverse-200 shadow focus:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-wosmongton-200",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="relative flex h-full w-full items-center justify-center after:block after:h-2 after:w-2 after:rounded-[50%] after:bg-white-full after:content-['']" />
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
