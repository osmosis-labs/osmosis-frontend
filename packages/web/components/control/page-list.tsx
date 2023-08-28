import classNames from "classnames";
import Image from "next/image";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";

import { Icon } from "~/components/assets";
import { NumberSelectProps } from "~/components/control/types";
import { CustomClasses } from "~/components/types";

interface Props extends Omit<NumberSelectProps, "placeholder">, CustomClasses {
  /** Allow user to edit page number directly. Off by default. */
  editField?: boolean;
}

export const PageList: FunctionComponent<Props> = ({
  currentValue,
  onInput,
  min,
  max,
  editField = false,
  className,
}) => {
  const [isEditingText, setIsEditingText] = useState(false);
  const inputElem = useRef(null);

  // auto focus input text when selecting to edit
  useEffect(() => {
    if (isEditingText && inputElem.current) {
      (inputElem.current as unknown as any).select();
    }

    if (max === min) {
      setIsEditingText(false);
    }
  }, [isEditingText, max, min]);

  const processInputValue = (e: any) => {
    const newValue = Number(e.target.value);
    if (newValue >= min && newValue <= max) {
      onInput(newValue);
    }
  };

  return (
    <div
      className={classNames(
        "flex",
        !isEditingText ? "pt-2.5" : null,
        className ?? "place-content-center"
      )}
    >
      <div
        className={classNames(
          "select-none",
          currentValue === min || max === min
            ? "cursor-default opacity-50"
            : "cursor-pointer"
        )}
      >
        <div className={isEditingText ? "pr-2 pt-2.5" : undefined}>
          <Icon
            id="chevron-left"
            className="text-wosmongton-200"
            height={18}
            width={18}
            onClick={() =>
              onInput(
                currentValue > min && max > min
                  ? currentValue - 1
                  : currentValue
              )
            }
          />
        </div>
      </div>
      {editField && isEditingText ? (
        <input
          ref={inputElem}
          className="w-fit appearance-none rounded-lg border border-wosmongton-200 bg-transparent py-2 text-center leading-tight"
          type="text"
          size={4}
          value={currentValue}
          inputMode="decimal"
          onFocus={(e) => {
            e.target.select();
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              processInputValue(e);
              setIsEditingText(false);
            }
          }}
          onInput={processInputValue}
        />
      ) : (
        <span
          className={classNames("text-md whitespace-nowrap px-2 leading-5", {
            "cursor-pointer underline-offset-2 hover:underline":
              editField && min !== max,
          })}
          onClick={() => {
            if (editField) setIsEditingText(true);
          }}
        >
          {currentValue} / {max}
        </span>
      )}
      <div
        className={classNames(
          "select-none",
          (currentValue === max || max === min) && !isEditingText
            ? "cursor-default opacity-50"
            : "cursor-pointer"
        )}
      >
        <div
          className={isEditingText ? "pl-2 pt-2" : undefined}
          onClick={() => {
            if (isEditingText) {
              setIsEditingText(false);
            } else {
              onInput(
                currentValue < max && max > min
                  ? currentValue + 1
                  : currentValue
              );
            }
          }}
        >
          {isEditingText ? (
            <Image
              alt="accept"
              src="/icons/checkmark-circle.svg"
              height={22}
              width={22}
            />
          ) : (
            <Icon
              id="chevron-right"
              className="text-osmoverse-200"
              height={18}
              width={18}
            />
          )}
        </div>
      </div>
    </div>
  );
};
