import { AxelarSourceChain } from "@osmosis-labs/utils";

import { t } from "~/hooks/language/context";

/**
 * @deprecated
 */
export function waitByTransferFromSourceChain(
  sourceChain: AxelarSourceChain | "Osmosis"
) {
  switch (sourceChain) {
    case "Ethereum":
    case "Polygon":
      return t("assets.transfer.waitTime", { minutes: "15" });
    default:
      return t("assets.transfer.waitTime", { minutes: "3" });
  }
}
