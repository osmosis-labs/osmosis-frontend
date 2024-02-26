"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva, type VariantProps } from "class-variance-authority";
import classNames from "classnames";
import * as React from "react";

const sliderRangeVariants = cva("absolute h-full", {
  variants: {
    variant: {
      default: "bg-gradient-neutral",
      secondary: "bg-superfluid",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> &
    VariantProps<typeof sliderRangeVariants>
>(({ className, variant, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={classNames(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[0.5rem] w-full grow overflow-hidden rounded-full bg-osmoverse-700/50">
      <SliderPrimitive.Range
        className={classNames(sliderRangeVariants({ variant, className }))}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="focus-visible:ring-ring block h-5 w-5 rounded-full bg-white-full shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
