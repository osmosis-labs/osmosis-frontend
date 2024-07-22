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
  "flex flex-nowrap items-center group justify-between gap-3 bg-osmoverse-825 transition-colors ease-out duration-200 group-focus-within:bg-osmoverse-800",
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
        default: "rounded-full",
        outline: "border border-osmoverse-500 rounded-xl",
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
        <div className="h-6 w-6 shrink-0 text-wosmongton-200 transition-colors duration-200 ease-out group-focus-within:text-wosmongton-100">
          <Icon id="search" />
        </div>
        <label htmlFor="search-input" className="shrink grow">
          <input
            id="search-input"
            ref={ref}
            className="h-full w-full appearance-none bg-transparent tracking-wider placeholder:font-medium placeholder:text-osmoverse-500 group-focus-within:placeholder:text-osmoverse-600"
            defaultValue={_debounce ? currentValue : undefined}
            value={_debounce ? undefined : currentValue}
            type={type ?? "text"}
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
