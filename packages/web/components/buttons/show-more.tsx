import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { ToggleProps } from "../control";
import { CustomClasses } from "../types";

export const ShowMoreButton: FunctionComponent<ToggleProps & CustomClasses> = ({
  isOn,
  onToggle,
  className,
}) => (
  <button
    className={classNames("flex flex-col gap-1 button", className)}
    onClick={() => onToggle(isOn)}
  >
    <span className="body2 md:caption text-white-mid">
      {isOn ? "Less" : "More"}
    </span>
    <div className="m-auto">
      <Image
        alt={isOn ? "less" : "more"}
        src={
          isOn
            ? "/icons/chevron-up-secondary.svg"
            : "/icons/chevron-down-secondary.svg"
        }
        height={14}
        width={14}
      />
    </div>
  </button>
);
