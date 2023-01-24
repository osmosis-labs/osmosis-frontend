import { useMemo } from "react";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { HideDustState } from "../../stores/user-settings";

/** Filter a list of items less than one fiat min-amount (penny) if the user setting is on.
 *  @param items Items to be filtered
 *  @param getValueOfItem Get the value of the item in fiat. Return `undefined` to include regardless.
 */
export function useHideDustUserSetting<TDustableItem>(
  items: TDustableItem[],
  getValueOfItem: (item: TDustableItem) => PricePretty | undefined
): TDustableItem[] {
  const { userSettings } = useStore();

  const hideDust =
    userSettings.getUserSettingById<HideDustState>("hide-dust")?.state
      ?.hideDust ?? false;

  return useMemo(
    () =>
      items.filter((item) =>
        hideDust
          ? getValueOfItem(item)?.toDec().gte(new Dec(0.01)) ?? true
          : true
      ),
    [items, hideDust]
  );
}
