import { PricePretty } from "@keplr-wallet/unit";
import { useMemo } from "react";

import { useStore } from "~/stores";
import { HideDustState, HideDustUserSetting } from "~/stores/user-settings";

/** Filter a list of items less than one fiat min-amount (penny) if the user setting is on.
 *  @param items Items to be filtered
 *  @param getValueOfItem Get the value of the item in fiat. Return `undefined` to include regardless.
 */
export function useHideDustUserSetting<DustableItem>(
  items: DustableItem[],
  getValueOfItem: (item: DustableItem) => PricePretty | undefined
): DustableItem[] {
  const { userSettings } = useStore();

  const hideDust =
    userSettings.getUserSettingById<HideDustState>("hide-dust")?.state
      ?.hideDust ?? false;

  return useMemo(
    () =>
      items.filter((item) =>
        hideDust
          ? getValueOfItem(item)
              ?.toDec()
              .gte(HideDustUserSetting.DUST_THRESHOLD) ?? true
          : true
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, hideDust]
  );
}
