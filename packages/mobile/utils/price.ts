import { Dec } from "@osmosis-labs/unit";

import { Colors } from "~/constants/theme-colors";

export function getChangeColor(change: Dec) {
  if (change.gt(new Dec(0))) {
    return Colors["bullish"][500];
  } else if (change.equals(new Dec(0))) {
    return Colors["wosmongton"][200];
  } else {
    return Colors["rust"][300];
  }
}
