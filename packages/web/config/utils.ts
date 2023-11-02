import { AppCurrency } from "@keplr-wallet/types";
import { ChainInfoWithExplorer } from "@osmosis-labs/stores";

import { Asset, AssetDenomUnit } from "~/config/asset-list/type";
import { FeeCurrency } from "~/stores/assets";
import { last } from "~/utils/array";

/** All currency attributes (stake and fee) are defined once in the `currencies` list.
 *  Maintains the option to skip this conversion and keep the verbose `ChainInfo` type.
 */
export interface SimplifiedChainInfo
  extends Omit<
    ChainInfoWithExplorer,
    "stakeCurrency" | "feeCurrencies" | "osmosisChainId"
  > {
  currencies: Array<
    AppCurrency &
      FeeCurrency & {
        isStakeCurrency?: boolean;
        isFeeCurrency?: boolean;
        pegMechanism?: "algorithmic" | "collateralized" | "hybrid";
      }
  >;
}

export const matchesDenomOrAlias = ({
  aliases,
  denom,
  denomToSearch,
}: Pick<AssetDenomUnit, "aliases" | "denom"> & { denomToSearch: string }) =>
  denom.toLowerCase() === denomToSearch.toLowerCase() ||
  aliases?.some((alias) => alias.toLowerCase() === denomToSearch.toLowerCase());

export const hasMatchingMinimalDenom = (
  { denom_units }: Pick<Asset, "denom_units">,
  denomToSearch: string
) => {
  return denom_units.some(({ aliases, denom }) =>
    matchesDenomOrAlias({ denomToSearch, aliases, denom })
  );
};

export function getMinimalDenomFromAssetList({
  traces,
  symbol,
  base,
}: Pick<Asset, "traces" | "symbol" | "base">) {
  /** It's an Osmosis Asset */
  if (traces?.length === 0) {
    return base;
  }

  const lastTrace = last(traces);

  if (lastTrace?.type !== "ibc-cw20" && lastTrace?.type !== "ibc") {
    throw new Error(`Unknown trace type ${lastTrace?.type}. Asset ${symbol}`);
  }

  return lastTrace.counterparty.base_denom;
}

export function getDisplayDecimalsFromDenomUnits({
  denom_units,
  display,
}: Pick<Asset, "denom_units" | "display">) {
  const displayDenomUnits = denom_units.find((denomUnits) =>
    matchesDenomOrAlias({
      denomToSearch: display,
      ...denomUnits,
    })
  );

  if (typeof displayDenomUnits === "undefined") return undefined;

  return displayDenomUnits.exponent;
}
