import { ButtonHTMLAttributes, FunctionComponent } from "react";
import { CustomClasses } from "../types";
import { IS_FRONTIER } from "../../config";
import { cva, VariantProps } from "class-variance-authority";

const button = cva(
  "flex w-full place-content-center items-center py-2 text-center transition-colors disabled:cursor-default",
  {
    variants: {
      /**
       * Modes should modify the following properties:
       * - border
       * - border color
       * - border radius
       * - background color
       * - text color
       */
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
        "special-1": [
          "bg-gradient-positive",
          "rounded-xl",
          "text-osmoverse-1000",
        ],
        unstyled: null,
      },
      /**
       * Sizes should modify the following properties:
       * - height
       * - width
       * - padding
       * - font size
       * - font weight
       * - line height
       * - letter spacing
       */
      size: {
        sm: "h-10 px-5 button tracking-wide",
        normal: "h-[56px] px-6 subtitle1 tracking-wide",
        text: "w-auto h-auto block py-0 text-start tracking-wide",
        framed:
          "h-auto px-2 py-1 w-auto text-caption font-semibold tracking-wider",
        amount:
          "h-[24px] px-2 py-1 w-auto text-caption font-semibold tracking-wider",
        unstyled: null,
      },
      frontier: {
        true: null,
        false: null,
      },
    },
    compoundVariants: [
      {
        mode: ["primary", "primary-warning"],
        frontier: true,
        className: "text-osmoverse-1000",
      },
    ],
    defaultVariants: {
      mode: "primary",
      size: "normal",
    },
  }
);

const modeToDefaultSize: Partial<
  Record<
    NonNullable<VariantProps<typeof button>["mode"]>,
    VariantProps<typeof button>["size"]
  >
> = {
  "framed-primary": "framed",
  "framed-secondary": "framed",
  amount: "amount",
  text: "text",
  unstyled: "unstyled",
};

export const Button: FunctionComponent<
  VariantProps<typeof button> &
    CustomClasses &
    ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  const { mode, size, className, children } = props;

  return (
    <button
      {...props}
      className={button({
        className,
        mode,
        size: size ?? modeToDefaultSize[mode as keyof typeof modeToDefaultSize],
        frontier: IS_FRONTIER,
      })}
    >
      {children}
    </button>
  );
};
