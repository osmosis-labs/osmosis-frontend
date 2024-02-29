import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import classNames from "classnames";
import * as React from "react";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { ToggleProps } from "~/components/control";
import { CustomClasses } from "~/components/types";
import { useTranslation } from "~/hooks";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-wosmongton-700 text-primary-foreground shadow hover:bg-wosmongton-700/90",
        destructive: "bg-rust-700 shadow-sm hover:bg-destructive/90",
        outline:
          "border-wosmongton-400 border-2 bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-bullish-400 text-osmoverse-1000 shadow-sm hover:bg-bullish-400/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-6 py-2 rounded-xl",
        sm: "h-6 rounded-md text-caption py-1 px-1.5",
        // lg: "h-14 rounded-xl px-8", // note - we don't use this size
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={classNames(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

const ShowMoreButton: FunctionComponent<ToggleProps & CustomClasses> = ({
  isOn,
  onToggle,
  className,
}) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
      className={classNames("button flex flex-col gap-1", className)}
      onClick={() => onToggle(isOn)}
    >
      <span className="body2 md:caption text-wosmongton-200">
        {isOn ? t("components.show.less") : t("components.show.more")}
      </span>
      <div className="m-auto">
        <Icon
          id={isOn ? "chevron-up" : "chevron-down"}
          height={14}
          width={14}
          className="text-osmoverse-400"
        />
      </div>
    </Button>
  );
};
ShowMoreButton.displayName = "ShowMoreButton";

export { Button, buttonVariants, ShowMoreButton };
