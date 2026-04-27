import { PricePretty } from "@osmosis-labs/unit";
import { useMemo } from "react";

import {
  DUST_THRESHOLD,
  useUserSettingsStore,
} from "~/stores/user-settings-store";

/** Filter a list of items less than one fiat min-amount (penny) if the user setting is on.
 *  @param items Items to be filtered
 *  @param getValueOfItem Get the value of the item in fiat. Return `undefined` to include regardless.
 */
export function useHideDustUserSetting<DustableItem>(
  items: DustableItem[],
  getValueOfItem: (item: DustableItem) => PricePretty | undefined
): DustableItem[] {
  const hideDust = useUserSettingsStore((state) => state.hideDust);

  return useMemo(
    () =>
      items.filter((item) =>
        hideDust
          ? getValueOfItem(item)?.toDec().gte(DUST_THRESHOLD) ?? true
          : true
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, hideDust]
  );
}
