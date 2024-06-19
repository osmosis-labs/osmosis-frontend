import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import classNames from "classnames";
import * as React from "react";
import { PropsWithChildren } from "react";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  cloneElement,
  ElementType,
  forwardRef,
  FunctionComponent,
  isValidElement,
  ReactNode,
} from "react";

import { Icon } from "~/components/assets";
import { ToggleProps } from "~/components/control";
import { Spinner } from "~/components/loaders";
import { CustomClasses } from "~/components/types";
import { SpriteIconId } from "~/config";
import { useTranslation } from "~/hooks";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-wosmongton-700 text-white-full shadow hover:bg-wosmongton-700/80",
        destructive: "bg-rust-700 shadow-sm hover:bg-rust-700/90",
        outline:
          "border-wosmongton-400 border-2 bg-transparent shadow-sm hover:bg-wosmongton-400 hover:text-white-full",
        "secondary-outline":
          "border-osmoverse-700 border-2 bg-transparent text-wosmongton-200 hover:bg-osmoverse-825 hover:text-white-full",
        secondary:
          "bg-osmoverse-825 text-wosmongton-200 shadow hover:bg-osmoverse-825/80",
        success:
          "bg-bullish-400 text-osmoverse-1000 shadow-sm hover:bg-bullish-400/80",
        ghost: "hover:bg-osmoverse-850",
        link: "text-white-full underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-6 py-2 rounded-xl",
        sm: "h-6 py-1 px-1.5 rounded-md text-caption",
        xsm: "h-8 px-3 py-1.5 rounded-full",
        md: "h-10 py-2 px-3 rounded-xl",
        "sm-icon": "h-8 w-8 rounded-full",
        icon: "h-10 w-10 rounded-full",
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
  isLoading?: boolean;
  loadingText?: string;
  classes?: Partial<Record<"spinnerContainer" | "spinner", string>>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
      loadingText,
      classes,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={classNames(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        disabled={isLoading || props.disabled}
      >
        {isLoading ? (
          <div
            className={classNames(
              "flex items-center gap-2",
              classes?.spinnerContainer
            )}
          >
            <Spinner className={classes?.spinner} />
            {loadingText && <span>{loadingText}</span>}
          </div>
        ) : (
          props.children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

// TODO - ideally remove this button, rarely used, will need design review
const ShowMoreButton = ({
  isOn,
  onToggle,
  className,
}: PropsWithChildren<ToggleProps & CustomClasses>) => {
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

// TODO - test refactoring to be a button variant
const ArrowButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonHTMLAttributes<HTMLButtonElement> &
    AnchorHTMLAttributes<HTMLAnchorElement> & {
      isLink?: boolean;
      classes?: Partial<Record<"arrowRight", string>>;
    }
>((props, ref) => {
  const { isLink, classes, ...rest } = props;
  const Component = (isLink ? "a" : "button") as ElementType<typeof props>;

  return (
    <Component
      {...rest}
      ref={ref as any}
      className={classNames(
        "flex items-center gap-1 text-center align-middle text-wosmongton-200 transition-all hover:gap-2",
        props.className
      )}
    >
      {props.children}
      <Icon
        id="arrow-right"
        className={classNames(classes?.arrowRight)}
        height={24}
        width={24}
      />
    </Component>
  );
});

ArrowButton.displayName = "ArrowButton";

// TODO - migrated this from another component, ideally should be a button variant
export const ChartButton: FunctionComponent<{
  alt?: string;
  icon?: SpriteIconId;
  label?: string;
  selected: boolean;
  onClick: () => void;
}> = (props) => {
  const isIcon = Boolean(props.icon) && !props.label;
  const isLabel = Boolean(props.label) && !props.icon;

  return (
    <Button
      size="sm"
      className={classNames(
        "flex cursor-pointer items-center justify-center !bg-osmoverse-800 px-2 text-caption  hover:!bg-osmoverse-900",
        {
          "!bg-osmoverse-600": props.selected,
        }
      )}
      onClick={props.onClick}
    >
      {isIcon && (
        <Icon
          id={props.icon!}
          label={props.alt}
          width={16}
          height={16}
          className="text-osmoverse-300"
        />
      )}
      {isLabel && props.label}
    </Button>
  );
};

ChartButton.displayName = "ChartButton";

/**
 * Renders an icon within a button.
 */
export const IconButton = forwardRef<
  HTMLButtonElement,
  {
    icon?: ReactNode;
    "aria-label": string;
  } & React.ComponentProps<typeof Button>
>((props, ref) => {
  const {
    icon,
    children,
    variant = "ghost",
    size = "icon",
    "aria-label": ariaLabel,
    ...rest
  } = props;

  const element = icon || children;
  const _children = isValidElement(element)
    ? cloneElement(element as any, {
        "aria-hidden": true,
        focusable: false,
      })
    : null;

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      aria-label={ariaLabel}
      {...rest}
    >
      {_children}
    </Button>
  );
});

export { ArrowButton, Button, buttonVariants, ShowMoreButton };
