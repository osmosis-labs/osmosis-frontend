import { useMemo } from "react";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { ShowDustState } from "../../stores/user-settings";

/** Filter a list of items less than one fiat min-amount (penny) if the user setting is on.
 *  @param items Items to be filtered
 *  @param getValueOfItem Get the value of the item in fiat. Return `undefined` to include regardless.
 */
export function useShowDustUserSetting<TDustableItem>(
  items: TDustableItem[],
  getValueOfItem: (item: TDustableItem) => PricePretty | undefined
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
        showDust
          ? true
          : getValueOfItem(item)?.toDec().gte(new Dec(0.01)) ?? true
      ),
    [items, showDust]
  );
}
