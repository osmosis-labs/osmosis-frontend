import { t } from "~/hooks/language/context";
import { SourceChain } from "~/integrations/bridge-info";

/**
 * @deprecated
 */
export function waitByTransferFromSourceChain(
  sourceChain: SourceChain | "Osmosis"
) {
  switch (sourceChain) {
    case "Ethereum":
    case "Polygon":
      return t("assets.transfer.waitTime", { minutes: "15" });
    default:
      return t("assets.transfer.waitTime", { minutes: "3" });
  }
}
