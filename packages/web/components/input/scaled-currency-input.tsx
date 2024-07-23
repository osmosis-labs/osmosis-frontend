import { isNumeric } from "@osmosis-labs/utils";
import classNames from "classnames";
import { useEffect, useRef } from "react";

import { useWindowSize } from "~/hooks";
import { useControllableState } from "~/hooks/use-controllable-state";

interface ScaledCurrencyInputProps {
  fiatSymbol?: string;
  coinDenom?: string;
  value?: string;
  onChange?: (value: string) => void;
  classes?: Partial<Record<"input" | "ticker", string>>;

  inputRef?: React.RefObject<HTMLInputElement>;
}

export function ScaledCurrencyInput({
  fiatSymbol,
  coinDenom,
  value,
  onChange,
  classes,
  inputRef,
}: ScaledCurrencyInputProps) {
  const { isMobile } = useWindowSize();
  const [inputValue, setInputValue] = useControllableState({
    defaultValue: "",
    value: value,
    onChange,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputSizerRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const minScale = 16 / 96; // = 1rem / 6rem
    let contentWidth;

    const updateSize = () => {
      if (inputSizerRef.current && wrapperRef.current && tickerRef.current) {
        contentWidth =
          (inputSizerRef.current?.offsetWidth || 0) +
          (tickerRef.current?.offsetWidth || 0);
        let scale = Math.min(
          1,
          Math.max(
            minScale,
            (wrapperRef.current?.offsetWidth || 0) / contentWidth
          )
        );
        wrapperRef.current.style.transform = `scale(${scale})`;
      }
    };

    updateSize();
  }, [inputValue, isMobile]);

  return (
    <label
      className={classNames(
        "mx-auto block max-w-full rounded-xl px-2",
        isMobile ? "text-h3 font-h3" : "text-h2 font-h2"
      )}
    >
      <div
        ref={wrapperRef}
        className="flex-start relative mx-auto flex w-full flex-1 origin-center justify-center text-center"
      >
        <div className="flex items-baseline justify-center">
          {fiatSymbol ? (
            <span
              ref={tickerRef}
              className={classNames(
                "self-center",
                !inputValue && "text-osmoverse-500",
                classes?.ticker
              )}
            >
              {fiatSymbol}
            </span>
          ) : null}
          <div
            ref={inputSizerRef}
            data-value={inputValue || "0"}
            className={classNames(
              "relative self-center align-middle",
              "after:invisible after:whitespace-nowrap after:font-[inherit] after:content-[attr(data-value)]"
            )}
          >
            <input
              ref={inputRef}
              className={classNames(
                "absolute m-0 h-full w-full bg-transparent p-0 placeholder-osmoverse-500 outline-0",
                classes?.input
              )}
              placeholder="0"
              data-expand="true"
              minLength={1}
              style={{
                fontSize: "inherit",
              }}
              onChange={(e) => {
                const nextValue = e.target.value;
                if (nextValue !== "" && !isNumeric(nextValue)) return;
                setInputValue(nextValue);
              }}
              value={inputValue}
            />
          </div>
          {fiatSymbol ? null : (
            <span
              ref={tickerRef}
              className={classNames(
                "self-center pl-1 text-osmoverse-500",
                classes?.ticker
              )}
            >
              {coinDenom}
            </span>
          )}
        </div>
      </div>
    </label>
  );
}
