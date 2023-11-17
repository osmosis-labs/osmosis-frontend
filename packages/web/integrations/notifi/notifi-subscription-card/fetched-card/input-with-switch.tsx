import { FunctionComponent, InputHTMLAttributes } from "react";

import { Switch } from "~/components/control";
import { SpriteIconId } from "~/config";
import { InputWithIcon } from "~/integrations/notifi/notifi-subscription-card/fetched-card/input-with-icon";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  iconId: SpriteIconId;
  selected: boolean;
  setSelected: (selected: boolean) => void;
}

export const InputWithSwitch: FunctionComponent<Props> = ({
  iconId,
  selected,
  setSelected,
  ...inputProps
}: Props) => {
  return (
    <div className="flex flex-row justify-center">
      <Switch
        labelClassName="flex-grow"
        containerClassName="flex-grow px-10 md:px-4"
        labelPosition="left"
        isOn={selected}
        onToggle={(toggled) => setSelected(toggled)}
      >
        <InputWithIcon iconId={iconId} {...inputProps} />
      </Switch>
    </div>
  );
};
