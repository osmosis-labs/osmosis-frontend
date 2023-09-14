import classNames from "classnames";
import { FunctionComponent, InputHTMLAttributes } from "react";

import { Icon } from "~/components/assets";
import { SpriteIconId } from "~/config";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  iconId: SpriteIconId;
  errorMessage?: string;
  className?: string;
}

export const InputWithIcon: FunctionComponent<Props> = ({
  iconId,
  errorMessage,
  className,
  ...inputProps
}) => {
  return (
    <>
      <div
        className={`flex space-x-2 rounded-xl bg-osmoverse-700 p-2 ${className} `}
      >
        <Icon id={iconId} width="24" height="24" className="inline" />
        <input
          className={classNames(
            "text-body1 font-body1 text-osmoverse-100 placeholder:text-osmoverse-200",
            "appearance-none bg-transparent"
          )}
          {...inputProps}
        />
      </div>
      <label className="text-caption font-caption text-missionError">
        {errorMessage}
      </label>
    </>
  );
};
