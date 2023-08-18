import { EventTypeItem } from "@notifi-network/notifi-frontend-client";
import { FunctionComponent } from "react";

import { Switch } from "~/components/control";

interface Props {
  row: EventTypeItem;
  disabled: boolean;
  toggleStates: Record<string, boolean>;
  setToggleStates: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export const AlertRow: FunctionComponent<Props> = ({
  row,
  disabled,
  toggleStates,
  setToggleStates,
}) => {
  return (
    <Switch
      labelPosition="right"
      disabled={disabled}
      isOn={toggleStates[row.name] === true}
      onToggle={(value) => {
        setToggleStates((previous) => ({
          ...previous,
          [row.name]: value,
        }));
      }}
    >
      {row.name}
    </Switch>
  );
};
