import classNames from "classnames";
import { FunctionComponent, InputHTMLAttributes } from "react";

import { Icon, SpriteIconId } from "~/components/assets";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  iconId: SpriteIconId;
  errorMessage?: string;
}

export const InputWithIcon: FunctionComponent<Props> = ({
  iconId,
  errorMessage,
  ...inputProps
}) => {
  return (
    <>
      <div className="flex flex-row space-x-2 rounded-xl bg-osmoverse-700 p-2">
        <Icon id={iconId} width="24" height="24" />
        <input
          className={classNames(
            "flex-grow text-body1 font-body1 text-osmoverse-100 placeholder:text-osmoverse-200",
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
