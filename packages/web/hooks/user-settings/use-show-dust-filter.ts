import { useMemo } from "react";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { ShowDustState } from "../../stores/user-settings";

/** Filter a list of items less than one fiat min-amount (penny) if the user setting is on. */
export function useShowDustUserSetting<TDustableItem>(
  items: TDustableItem[],
  getValueOfItem: (item: TDustableItem) => PricePretty
): TDustableItem[] {
  const { userSettings } = useStore();

  const showDust =
    (
      userSettings.getUserSettingById("show-dust")?.state as
        | ShowDustState
        | undefined
    )?.showDust ?? true;

  return useMemo(
    () =>
      items.filter((item) =>
        showDust ? true : getValueOfItem(item).toDec().gt(new Dec(0.01))
      ),
    [showDust, items]
  );
}
