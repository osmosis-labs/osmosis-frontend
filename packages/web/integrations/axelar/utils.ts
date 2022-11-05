import { SourceChain } from "./types";
import { t } from "react-multi-lang";

export function waitBySourceChain(sourceChain: SourceChain) {
  switch (sourceChain) {
    case "Ethereum":
    case "Polygon":
      return t("assets.transfer.waitTime", { minutes: "15" });
    default:
      return t("assets.transfer.waitTime", { minutes: "3" });
  }
}
