import classNames from "classnames";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { ToggleProps } from "~/components/control";
import { CustomClasses } from "~/components/types";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

export const ShowMoreButton: FunctionComponent<ToggleProps & CustomClasses> = ({
  isOn,
  onToggle,
  className,
}) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="ghost"
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
    </Button>
  );
};
