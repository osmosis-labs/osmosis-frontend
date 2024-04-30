import { cva, VariantProps } from "class-variance-authority";
import classNames from "classnames";
import { debounce } from "debounce";
import {
  type ChangeEvent,
  type DOMAttributes,
  forwardRef,
  FunctionComponent,
  useCallback,
  useMemo,
} from "react";

import { Icon } from "~/components/assets";
import { CustomClasses, Disableable, InputProps } from "~/components/types";
import { useTranslation } from "~/hooks";

const searchBoxClasses = cva(
  "flex flex-nowrap items-center justify-between gap-2 bg-osmoverse-850 relative transition-colors [&_input]:placeholder:font-medium",
  {
    variants: {
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
        small: "h-10 pl-5 pr-1 w-max [&_input]:text-body2 [&_input]:font-body2",
        medium:
          "h-12 pl-5 pr-2 w-max [&_input]:text-body2 [&_input]:font-body2",
        large: "h-14 pl-5 pr-3 w-max [&_input]:text-body1 [&_input]:font-body2",
        long: "h-14 pl-5 pr-3 w-80 [&_input]:text-body1 [&_input]:font-body2",
        full: "h-14 pl-5 pr-3 w-full [&_input]:text-body1 [&_input]:font-body2",
      },
      variant: {
        default: "[&_input]:placeholder:text-osmoverse-400 rounded-full",
        outline:
          "border border-osmoverse-500 [&_input]:placeholder:text-osmoverse-500 rounded-xl",
      },
    },
    defaultVariants: {
      size: "small",
      variant: "default",
    },
  }
);

type SearchBoxProps = Omit<InputProps<string>, "currentValue"> &
  Disableable &
  CustomClasses &
  VariantProps<typeof searchBoxClasses> & {
    type?: string;
    currentValue?: string;
    /**
     * adds the ability to output the searchbox event using a debounce effect,
     * which is useful to avoid making too many requests.
     */
    debounce?: number;
    onKeyDown?: DOMAttributes<HTMLInputElement>["onKeyDown"];
    onFocusChange?: (isFocused: boolean) => void;
    rightIcon?: () => React.ReactNode;
  };

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  function SearchBox(
    {
      currentValue,
      onInput,
      onFocus,
      placeholder,
      type,
      disabled = false,
      autoFocus,
      className,
      onKeyDown,
      onFocusChange,
      size,
      variant,
      rightIcon,
      debounce: _debounce,
    },
    ref
  ) {
    const _onInput = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => onInput(e.target.value),
      [onInput]
    );

    const _debouncedOnInput = useMemo(
      () => (!_debounce ? _onInput : debounce(_onInput, _debounce)),
      [_debounce, _onInput]
    );

    return (
      <div
        className={classNames(
          searchBoxClasses({ size, variant }),
          {
            "opacity-50": disabled,
          },
          className
        )}
      >
        <div className="h-3 w-3 shrink-0 text-osmoverse-400">
          <Icon id="search" height={12} width={12} />
        </div>
        <label className="shrink grow">
          <input
            ref={ref}
            className="h-full w-full appearance-none bg-transparent tracking-wider transition-colors"
            defaultValue={_debounce ? currentValue : undefined}
            value={_debounce ? undefined : currentValue}
            type={type}
            autoFocus={autoFocus}
            placeholder={placeholder}
            autoComplete="off"
            onFocus={(e: any) => {
              onFocusChange?.(true);
              onFocus?.(e);
            }}
            onBlur={() => {
              onFocusChange?.(false);
            }}
            onInput={_debouncedOnInput}
            disabled={disabled}
            onKeyDown={onKeyDown}
          />
        </label>
        {rightIcon && rightIcon()}
      </div>
    );
  }
);

export const NoSearchResultsSplash: FunctionComponent<
  { query: string } & CustomClasses
> = ({ query, className }) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(
        "flex flex-col items-center gap-6 text-center",
        className
      )}
    >
      <Icon className="text-osmoverse-700" id="search" height={48} width={48} />
      <div className="flex flex-col gap-2">
        <h6>{t("search.noResultsFor", { query })}</h6>
        <p className="body1 text-osmoverse-300">{t("search.adjust")}</p>
      </div>
    </div>
  );
};
