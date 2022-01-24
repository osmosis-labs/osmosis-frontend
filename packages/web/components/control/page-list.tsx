import Image from "next/image";
import React, { FunctionComponent, useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { NumberSelectProps } from "./types";

interface Props extends Omit<Required<NumberSelectProps>, "placeholder"> {
  /** Allow user to edit page number directly. Off by default. */
  editField?: boolean;
}

export const PageList: FunctionComponent<Props> = ({
  currentValue,
  onChange,
  min,
  max,
  editField = false,
}) => {
  const [textEditing, setIsEditing] = useState(false);
  const inputElem = useRef(null);

  // auto focus input text when selecting to edit
  useEffect(() => {
    if (textEditing && inputElem.current) {
      (inputElem.current as unknown as any).select();
    }
  }, [textEditing]);

  const processInputValue = (e: any) => {
    const newValue = Number(e.target.value);
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className={classNames("flex", !textEditing ? "pt-2.5" : null)}>
      <div
        className={classNames(
          "select-none",
          currentValue === min ? "cursor-default opacity-50" : "cursor-pointer"
        )}
      >
        <div className={textEditing ? "pt-2.5 pr-2" : undefined}>
          <Image
            alt="left"
            src="/icons/chevron-left.svg"
            height={18}
            width={18}
            onClick={() =>
              onChange(currentValue > min ? currentValue - 1 : currentValue)
            }
          />
        </div>
      </div>
      {editField && textEditing ? (
        <input
          ref={inputElem}
          className="leading-tight border border-secondary-200 rounded-lg w-fit appearance-none bg-transparent text-center py-2"
          type="text"
          size={4}
          value={currentValue}
          inputMode="decimal"
          onBlur={() => {
            setIsEditing(false);
          }}
          onFocus={(e) => {
            e.target.select();
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              processInputValue(e);
              setIsEditing(false);
            }
          }}
          onInput={processInputValue}
        />
      ) : (
        <span
          className={classNames(
            "hover:underline underline-offset-2 leading-5 px-2 text-md",
            {
              "cursor-pointer": editField,
            }
          )}
          onClick={() => setIsEditing(true)}
        >
          {currentValue} / {max}
        </span>
      )}
      <div
        className={classNames(
          "select-none",
          currentValue === max && !textEditing
            ? "cursor-default opacity-50"
            : "cursor-pointer"
        )}
      >
        <div className={textEditing ? "pt-2 pl-2" : undefined}>
          {textEditing ? (
            <Image
              alt="accept"
              src="/icons/checkmark-circle.svg"
              height={22}
              width={22}
              onClick={() => setIsEditing(false)}
            />
          ) : (
            <Image
              alt="right"
              src="/icons/chevron-right.svg"
              height={18}
              width={18}
              onClick={() =>
                onChange(currentValue < max ? currentValue + 1 : currentValue)
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
