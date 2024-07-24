import { useCallback } from "react";
import { ComponentProps, forwardRef } from "react";
import { useState } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { SpriteIconId } from "~/config";

/**
 * Renders an icon within a button.
 */
export const ClipboardButton = forwardRef<
  HTMLButtonElement,
  {
    value?: string;
    defaultIcon?: SpriteIconId;
  } & ComponentProps<typeof Button>
>((props, ref) => {
  const [copied, setCopied] = useState(false);

  const {
    children,
    size = "sm-icon",
    defaultIcon = "copy",
    variant = "secondary",
    value,
    "aria-label": ariaLabel = "clipboard",
    ...rest
  } = props;

  const copyToClipboard = useCallback(() => {
    if (value && !copied) {
      navigator.clipboard.writeText(value);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    }
  }, [copied, value]);

  return (
    <Button
      ref={ref}
      size={size}
      variant={variant}
      aria-label={ariaLabel}
      onClick={copyToClipboard}
      className="group w-auto min-w-[32px]"
      {...rest}
    >
      <div className="flex items-center transition-all duration-300 group-hover:px-4">
        <p className="w-0 overflow-hidden text-body2 font-medium text-osmoverse-400 opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-fit group-hover:opacity-100">
          {children}
        </p>
        <div className="relative h-4 w-4">
          <Icon
            className={`absolute left-1/2 top-1/2 h-4.5 w-4.5 -translate-x-1/2 -translate-y-1/2 text-osmoverse-400 opacity-100  transition-opacity duration-300 group-hover:opacity-0 ${
              copied ? "!opacity-0" : ""
            }`}
            id={defaultIcon}
            width={18}
            height={18}
          />
          <Icon
            className={`absolute left-0 right-0 h-full w-full text-bullish-600 opacity-0 transition-opacity duration-300 ${
              copied ? "!opacity-100" : ""
            }`}
            id="check-mark"
          />
          <Icon
            className={`absolute left-0 right-0 h-full w-full text-osmoverse-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
              copied ? "!opacity-0" : ""
            }`}
            id="copy"
          />
        </div>
      </div>
    </Button>
  );
});
