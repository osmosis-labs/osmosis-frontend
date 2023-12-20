import { useCallback } from "react";
import { ComponentProps, forwardRef } from "react";
import { useState } from "react";

import { Icon } from "~/components/assets";
import { SpriteIconId } from "~/config";

import IconButton from "./icon-button";

/**
 * Renders an icon within a button.
 */
const ClipboardButton = forwardRef<
  HTMLButtonElement,
  {
    value?: string;
    defaultIcon?: SpriteIconId;
  } & ComponentProps<typeof IconButton>
>((props, ref) => {
  const [copied, setCopied] = useState(false);

  const {
    icon,
    children,
    mode = "icon-social",
    size = "md-min",
    defaultIcon = "copy",
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
    <IconButton
      ref={ref}
      mode={mode}
      size={size}
      aria-label={ariaLabel}
      onClick={copyToClipboard}
      {...rest}
    >
      <div className="flex items-center transition-all duration-300 group-hover:px-4">
        <p className="w-0 overflow-hidden text-body2 font-medium text-osmoverse-300 opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:w-25 group-hover:opacity-100">
          {children}
        </p>
        <div className="relative h-4 w-4">
          <Icon
            className={`absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-osmoverse-300 opacity-100  transition-opacity duration-300 group-hover:opacity-0 ${
              copied ? "!opacity-0" : ""
            }`}
            id={defaultIcon}
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
    </IconButton>
  );
});

export default ClipboardButton;
