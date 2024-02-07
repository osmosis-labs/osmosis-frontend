// "use client";

// import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
// import { CheckIcon, MinusIcon } from "@radix-ui/react-icons";
// import * as React from "react";

// import { cn } from "@/lib/utils";

// const Checkbox = React.forwardRef<
//   React.ElementRef<typeof CheckboxPrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
//     isIndeterminate?: boolean;
//   }
// >(({ className, isIndeterminate, ...props }, ref) => (
//   <CheckboxPrimitive.Root
//     ref={ref}
//     className={cn(
//       "focus-visible:ring-ring peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
//       // "focus-visible:ring-ring shrink-g peer h-6 w-6 rounded-lg border-2 border-osmoverse-300 shadow focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-osmoverse-300 data-[state=checked]:text-primary-foreground",
//       className
//     )}
//     {...props}
//   >
//     <CheckboxPrimitive.Indicator
//       className={cn("text-current flex items-center justify-center")}
//     >
//       {isIndeterminate ? (
//         <MinusIcon className="h-8 w-8 text-osmoverse-800" />
//       ) : (
//         <CheckIcon className="h-8 w-8 text-osmoverse-800" />
//       )}
//     </CheckboxPrimitive.Indicator>
//   </CheckboxPrimitive.Root>
// ));
// Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// export { Checkbox };

"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MinusIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    isIndeterminate?: boolean;
  }
>(({ className, isIndeterminate = false, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "focus-visible:ring-ring peer h-6 w-6 shrink-0 rounded-lg border border-osmoverse-300 shadow focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-osmoverse-300 data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("text-current flex items-center justify-center")}
    >
      {isIndeterminate ? (
        <MinusIcon className="h-6 w-6 text-osmoverse-800" />
      ) : (
        <CheckIcon className="h-6 w-6 text-osmoverse-800" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
