import { EventTypeItem } from "@notifi-network/notifi-frontend-client";
import { FunctionComponent } from "react";

import { Switch } from "~/components/control";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";

interface Props {
  row: EventTypeItem;
  disabled: boolean;
  toggleStates: Record<string, boolean>;
  setToggleStates: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export const AlertSettingRow: FunctionComponent<Props> = ({
  row,
  disabled,
  toggleStates,
  setToggleStates,
}) => {
  const { logEvent } = useAmplitudeAnalytics();

  return (
    <Switch
      labelPosition="right"
      disabled={disabled}
      isOn={toggleStates[row.name] === true}
      onToggle={(value) => {
        if (value) {
          logEvent([
            EventName.Notifications.enableAlertClicked,
            { type: row.name },
          ]);
        } else {
          logEvent([
            EventName.Notifications.disableAlertClicked,
            { type: row.name },
          ]);
        }
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
