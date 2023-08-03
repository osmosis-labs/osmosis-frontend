import { cva, VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";

import { CustomClasses } from "~/components/types";

export const buttonCVA = cva(
  "flex w-full place-content-center items-center py-2 text-center transition-colors disabled:cursor-default",
  {
    variants: {
      /**
       * Modes modify the following properties:
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
        "bullish-special": [
          "bg-osmoverse-800",
          "text-bullish-500",
          "hover:bg-osmoverse-700",
          "caption",
          "rounded-xl",
          "p-2",
        ],
        unstyled: null,
      },
      /**
       * Sizes modify the following properties:
       * - height
       * - width
       * - padding
       * - font size
       * - font weight
       * - line height
       * - letter spacing
       */
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
        unstyled: null,
      },
    },
    defaultVariants: {
      mode: "primary",
      size: "normal",
    },
  }
);

const modeToDefaultSize: Partial<
  Record<
    NonNullable<VariantProps<typeof buttonCVA>["mode"]>,
    VariantProps<typeof buttonCVA>["size"]
  >
> = {
  "framed-primary": "framed",
  "framed-secondary": "framed",
  amount: "amount",
  text: "text",
  unstyled: "unstyled",
};

export const Button = forwardRef<
  HTMLButtonElement,
  VariantProps<typeof buttonCVA> &
    CustomClasses &
    ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  const { mode, size, className, children } = props;

  return (
    <button
      ref={ref}
      {...props}
      className={buttonCVA({
        className,
        mode,
        size: size ?? modeToDefaultSize[mode as keyof typeof modeToDefaultSize],
      })}
    >
      {children}
    </button>
  );
});
