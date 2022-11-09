import Image from "next/image";
import React, { FunctionComponent, useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { NumberSelectProps } from "./types";
import { CustomClasses } from "../types";

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
        <div className={isEditingText ? "pt-2.5 pr-2" : undefined}>
          <Image
            alt="left"
            src="/icons/chevron-left.svg"
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
          className="leading-tight border border-wosmongton-200 rounded-lg w-fit appearance-none bg-transparent text-center py-2"
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
          className={classNames("leading-5 px-2 text-md whitespace-nowrap", {
            "hover:underline underline-offset-2 cursor-pointer":
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
          className={isEditingText ? "pt-2 pl-2" : undefined}
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
            <Image
              alt="right"
              src="/icons/chevron-right.svg"
              height={18}
              width={18}
            />
          )}
        </div>
      </div>
    </div>
  );
};
