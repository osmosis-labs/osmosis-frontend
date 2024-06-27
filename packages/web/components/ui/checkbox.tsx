"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "@radix-ui/react-icons";
import { cva, type VariantProps } from "class-variance-authority";
import classNames from "classnames";
import * as React from "react";

const checkboxVariants = cva(
  "focus-visible:ring-ring peer h-6 w-6 shrink-0 rounded-lg border-2 border-osmoverse-300 shadow focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-osmoverse-300 data-[state=checked]:text-primary-foreground",
  {
    variants: {
      variant: {
        default:
          "border-osmoverse-300 data-[state=checked]:bg-osmoverse-300 data-[state=checked]:text-primary-foreground",
        destructive:
          "border-rust-700 data-[state=checked]:bg-gradient-negative data-[state=checked]:text-primary-foreground",
        secondary:
          "border-superfluid data-[state=checked]:bg-superfluid data-[state=checked]:text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
    VariantProps<typeof checkboxVariants> & {
      isIndeterminate?: boolean;
    }
>(({ className, isIndeterminate = false, variant, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={classNames(checkboxVariants({ variant, className }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={classNames("text-current flex items-center justify-center")}
    >
      {isIndeterminate ? (
        <MinusIcon className="h-5 w-5 text-osmoverse-800" />
      ) : (
        <CheckIcon className="h-5 w-5 text-osmoverse-800" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
