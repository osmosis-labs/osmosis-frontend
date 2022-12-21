import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { ToggleProps } from "../control";
import { CustomClasses } from "../types";
import { useTranslation } from "react-multi-lang";

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
        <Image
          alt={isOn ? t("components.show.less") : t("components.show.more")}
          src={isOn ? "/icons/chevron-up.svg" : "/icons/chevron-down.svg"}
          height={14}
          width={14}
        />
      </div>
    </button>
  );
};
