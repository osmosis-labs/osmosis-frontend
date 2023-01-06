import { FunctionComponent } from "react";
import classNames from "classnames";
import { ToggleProps } from "../control";
import { CustomClasses } from "../types";
import { useTranslation } from "react-multi-lang";
import { Icon } from "../assets";

export const ShowMoreButton: FunctionComponent<ToggleProps & CustomClasses> = ({
  isOn,
  onToggle,
  className,
}) => {
  const t = useTranslation();
  return (
    <button
      className={classNames("button flex flex-col gap-1", className)}
      onClick={() => onToggle(isOn)}
    >
      <span className="body2 md:caption text-wosmongton-200">
        {isOn ? t("components.show.less") : t("components.show.more")}
      </span>
      <div className="m-auto">
        <Icon
          id={isOn ? "chevron-up" : "chevron-down"}
          height={14}
          width={14}
          className="text-osmoverse-400"
        />
      </div>
    </button>
  );
};
