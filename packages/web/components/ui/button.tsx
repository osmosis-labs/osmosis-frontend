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
        "lg-full": "h-12 py-3 rounded-full",
        "sm-icon": "h-8 w-8 rounded-full",
        icon: "h-12 w-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/** Exact classes from the pre-shadcn Button (`mode` API). Do not mix with `variant`. */
const legacyButtonVariants = cva(
  "flex w-full group place-content-center items-center py-2 text-center transition-colors disabled:cursor-default",
  {
    variants: {
      mode: {
        primary: [
          "border-2",
          "border-wosmongton-700",
          "bg-wosmongton-700",
          "hover:border-wosmongton-400",
          "hover:bg-wosmongton-400",
          "rounded-xl",
          "disabled:border-2",
          "disabled:border-osmoverse-500",
          "disabled:bg-osmoverse-500",
          "disabled:text-osmoverse-100",
        ],
        "primary-bullish": [
          "text-osmoverse-1000",
          "border-2",
          "border-bullish-400",
          "bg-bullish-400",
          "hover:border-bullish-200",
          "hover:bg-bullish-200",
          "rounded-xl",
          "disabled:border-2",
          "disabled:border-bullish-400",
          "disabled:bg-bullish-400",
          "disabled:text-bullish-100",
        ],
        "primary-warning": [
          "border-0",
          "bg-rust-700",
          "rounded-xl",
          "disabled:border-2",
          "disabled:border-osmoverse-500",
          "disabled:bg-osmoverse-500",
          "disabled:text-osmoverse-100",
          "disabled:hover:border-unset",
          "disabled:hover:bg-unset",
        ],
        secondary: [
          "border-2",
          "bg-transparent",
          "border-wosmongton-400",
          "hover:border-wosmongton-200",
          "rounded-xl",
          "disabled:border-osmoverse-600",
          "disabled:text-osmoverse-400",
        ],
        "secondary-bullish": [
          "border-2",
          "bg-transparent",
          "border-bullish-400",
          "hover:border-bullish-200",
          "rounded-xl",
          "disabled:border-bullish-400",
          "disabled:text-bullish-400",
        ],
        tertiary: [
          "border-2",
          "bg-transparent",
          "border-wosmongton-400",
          "rounded-md",
          "text-wosmongton-200",
        ],
        text: [
          "text-wosmongton-200",
          "hover:text-rust-200",
          "disabled:text-osmoverse-500",
        ],
        "text-white": [
          "text-wosmongton-100",
          "hover:text-rust-200",
          "disabled:text-osmoverse-500",
        ],
        "framed-primary": [
          "bg-wosmongton-700",
          "hover:bg-wosmongton-400",
          "rounded-md",
          "disabled:border-osmoverse-500",
          "disabled:bg-osmoverse-500",
          "disabled:text-osmoverse-100",
        ],
        "framed-secondary": [
          "border-2",
          "bg-transparent",
          "border-wosmongton-300",
          "hover:border-wosmongton-200",
          "text-wosmongton-300",
          "hover:text-wosmongton-200",
          "rounded-md",
          "disabled:border-osmoverse-600",
          "disabled:text-osmoverse-400",
        ],
        amount: [
          "border",
          "bg-transparent",
          "border-wosmongton-300",
          "hover:border-wosmongton-200",
          "text-wosmongton-300",
          "hover:text-wosmongton-200",
          "rounded-md",
          "disabled:border-osmoverse-600",
          "disabled:text-osmoverse-400",
        ],
        "special-1": [
          "bg-gradient-positive",
          "rounded-xl",
          "text-osmoverse-1000",
        ],
        "icon-primary": [
          "text-osmoverse-400",
          "hover:text-white-full",
          "bg-osmoverse-700",
          "hover:bg-osmoverse-600",
          "rounded-xl",
          "disabled:border-osmoverse-500",
          "disabled:bg-osmoverse-500",
        ],
        "icon-social": [
          "rounded-full",
          "bg-osmoverse-850",
          "hover:bg-osmoverse-700",
          "active:bg-osmoverse-700",
        ],
        "bullish-special": [
          "bg-osmoverse-800",
          "text-bullish-500",
          "hover:bg-osmoverse-700",
          "caption",
          "rounded-xl",
          "p-2",
          "disabled:hover:bg-osmoverse-800",
          "disabled:opacity-60",
          "disabled:cursor-not-allowed",
        ],
        "quaternary-modal": [
          "border-2",
          "border-osmoverse-800",
          "border-osmoverse-700",
          "bg-osmoverse-700",
          "hover:border-osmoverse-825",
          "hover:bg-osmoverse-825",
          "rounded-xl",
        ],
        quaternary: [
          "border-2",
          "border-osmoverse-700",
          "border-osmoverse-800",
          "bg-osmoverse-800",
          "hover:border-osmoverse-700",
          "hover:bg-osmoverse-700",
          "rounded-xl",
        ],
        unstyled: null,
      },
      size: {
        xs: "h-6 px-2 button tracking-wide text-xs ",
        "sm-no-padding": "h-10 button tracking-wide",
        sm: "h-10 px-5 button tracking-wide",
        normal: "h-[56px] px-6 subtitle1 tracking-wide",
        text: "w-auto h-auto block py-0 text-start tracking-wide",
        framed:
          "h-auto px-2 py-1 w-auto text-caption font-semibold tracking-wider",
        amount:
          "h-[24px] px-2 py-1 w-auto text-caption font-semibold tracking-wider",
        "md-icon-social": "w-10 h-10 button tracking-wide shrink-0 py-0",
        "md-min": "w-auto min-w-10 h-10 button tracking-wide shrink-0 py-0",
        unstyled: null,
      },
    },
  }
);

const modeToDefaultSize: Partial<
  Record<
    NonNullable<VariantProps<typeof legacyButtonVariants>["mode"]>,
    VariantProps<typeof legacyButtonVariants>["size"]
  >
> = {
  "framed-primary": "framed",
  "framed-secondary": "framed",
  amount: "amount",
  text: "text",
  unstyled: "unstyled",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, "size"> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: ReactNode;
  classes?: Partial<Record<"spinnerContainer" | "spinner", string>>;
  /** Pre-shadcn API. When set, uses the original Button classes (not `variant`). */
  mode?: VariantProps<typeof legacyButtonVariants>["mode"];
  size?:
    | VariantProps<typeof buttonVariants>["size"]
    | VariantProps<typeof legacyButtonVariants>["size"];
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      mode,
      asChild = false,
      isLoading,
      loadingText,
      classes,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const computedClassName = mode
      ? legacyButtonVariants({
          mode,
          size: (size ?? modeToDefaultSize[mode] ?? "normal") as VariantProps<
            typeof legacyButtonVariants
          >["size"],
          className,
        })
      : buttonVariants({
          variant,
          size: size as VariantProps<typeof buttonVariants>["size"],
          className,
        });
    return (
      <Comp
        className={classNames(computedClassName)}
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
            {typeof loadingText !== "undefined" ? (
              <>
                {typeof loadingText === "string" ? (
                  <span>{loadingText}</span>
                ) : (
                  loadingText
                )}
              </>
            ) : (
              props.children
            )}
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
    variant = "secondary",
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

const GoBackButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => (
  <IconButton
    ref={ref}
    {...props}
    className={classNames(
      "z-50 !h-12 !w-12 cursor-pointer !py-0 text-osmoverse-400 hover:text-osmoverse-100 md:!h-8 md:!w-8",
      props.className
    )}
    icon={<Icon id="arrow-left-thin" className="md:h-4 md:w-4" />}
    aria-label="Go back"
  />
));

export { ArrowButton, Button, buttonVariants, GoBackButton, ShowMoreButton };
