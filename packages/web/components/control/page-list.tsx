import Image from "next/image";
import React, { FunctionComponent, useState, useRef, useEffect } from "react";
import classNames from "classnames";
import { NumberSelectProps } from "./types";

interface Props extends Required<NumberSelectProps> {
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
  const [didBlur, setDidBlur] = useState(false);
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
        onClick={() => {
          if (currentValue > min) {
            onChange(currentValue - 1);
          }
        }}
      >
        <div className={textEditing ? "pt-2.5 pr-2" : undefined}>
          <Image
            alt="left"
            src="/icons/chevron-left.svg"
            height={20}
            width={20}
          />
        </div>
      </div>
      {editField && textEditing ? (
        <input
          ref={inputElem}
          className="leading-tight border border-secondary-200 rounded-lg w-fit appearance-none bg-transparent text-center py-2 text-lg"
          type="text"
          size={4}
          value={currentValue}
          inputMode="decimal"
          onBlur={() => {
            setIsEditing(false);
            setDidBlur(true);
          }}
          onFocus={(e) => {
            e.target.select();
          }}
          onKeyPress={(e) => {
            console.log(e.key);
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
            "hover:underline underline-offset-2 leading-5 px-2 text-lg",
            {
              "cursor-pointer": editField,
            }
          )}
          onClick={() => {
            setIsEditing(true);
          }}
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
        onClick={() => {
          if (didBlur) {
            setDidBlur(false);
          } else if (textEditing) {
            setIsEditing(false);
          } else if (currentValue < max) {
            onChange(currentValue + 1);
          }
        }}
      >
        <div className={textEditing ? "pt-2 pl-2" : undefined}>
          {textEditing ? (
            <Image
              alt="accept"
              src="/icons/checkmark-circle.svg"
              height={25}
              width={25}
            />
          ) : (
            <Image
              alt="right"
              src="/icons/chevron-right.svg"
              height={20}
              width={20}
            />
          )}
        </div>
      </div>
    </div>
  );
};
