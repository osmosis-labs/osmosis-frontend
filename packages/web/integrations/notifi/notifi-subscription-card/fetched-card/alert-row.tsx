import { EventTypeItem } from "@notifi-network/notifi-frontend-client";
import { resolveStringRef } from "@notifi-network/notifi-react-card";
import { FunctionComponent, useMemo } from "react";

import { Switch } from "~/components/control";

import { useNotifiModalContext } from "../../notifi-modal-context";
import { EVENT_TYPE_ID } from "./history-rows";

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
  const { account } = useNotifiModalContext();

  const isPositionOutOfRangeAlert = useMemo(() => {
    if (row.type === "fusion") {
      const inputs: Record<string, unknown> = {
        userWallet: account,
      };
      return (
        resolveStringRef(row.name, row.fusionEventId, inputs) ===
        EVENT_TYPE_ID.POSITION_OUT_OF_RANGE
      );
    }
    return false;
  }, [row]);

  return (
    <Switch
      labelPosition="right"
      // Position out of range is upcomming feature, so we disable it
      disabled={isPositionOutOfRangeAlert ? true : disabled}
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
