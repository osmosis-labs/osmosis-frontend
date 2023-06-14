import { AppCurrency } from "@keplr-wallet/types";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { useFlags } from "launchdarkly-react-client-sdk";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useMemo } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";

/** Show link to pools page in promo drawer if the send or out currency in swap tool is in the given list of pools.
 *  Returns null if no pools are found containing the send or out currency.
 */
export const SwapToolPromo: FunctionComponent<{
  pools: ObservableQueryPool[];
  sendCurrency: AppCurrency;
  outCurrency: AppCurrency;
}> = ({ pools, sendCurrency, outCurrency }) => {
  const router = useRouter();
  const t = useTranslation();

  // get the first denom to be found in CL pool
  const denomInClPool = useMemo(() => {
    const concentratedLiquidityPools = pools.filter(
      ({ type }) => type === "concentrated"
    );
    const concentratedLiquidityPoolAssetDenoms =
      concentratedLiquidityPools.flatMap((pool) => pool.poolAssetDenoms);
    //
    if (
      concentratedLiquidityPoolAssetDenoms.includes(
        sendCurrency.coinMinimalDenom
      )
    ) {
      return sendCurrency.coinDenom;
    }
    if (
      concentratedLiquidityPoolAssetDenoms.includes(
        outCurrency.coinMinimalDenom
      )
    ) {
      return outCurrency.coinDenom;
    }
  }, [pools, sendCurrency, outCurrency]);

  return (
    <div className="flex place-content-start items-center gap-5">
      <Image
        alt="lightning badge"
        src="/images/lightning-badge.svg"
        width={42}
        height={64}
      />
      <div className="flex flex-col gap-0.5">
        {denomInClPool && (
          <span className="subtitle1 text-osmoverse-100">
            {t("swap.promo.newOpportunity", { denom: denomInClPool })}
          </span>
        )}
        <Button
          size="sm"
          mode="secondary"
          className="text-supercharged-gradient subtitle1 !h-fit gap-3 rounded-lg border-supercharged py-1"
          onClick={() => {
            router.push("/pools?pool=concentrated");
          }}
        >
          <Icon id="lightning" height="22" />
          {t("swap.promo.discoverSuperchargedPools")}
        </Button>
      </div>
    </div>
  );
};

export function showConcentratedLiquidityPromo(
  featureFlags: ReturnType<typeof useFlags>,
  pools: ObservableQueryPool[],
  sendCurrency: AppCurrency,
  outCurrency: AppCurrency
) {
  // if feature flag is not enabled, don't show
  if (!featureFlags.concentratedLiquidity) return false;

  // if there are concentrated pools containing send or out currency, show
  const concentratedLiquidityPools = pools.filter(
    ({ type }) => type === "concentrated"
  );
  const concentratedLiquidityPoolAssetDenoms =
    concentratedLiquidityPools.flatMap((pool) => pool.poolAssetDenoms);
  if (
    concentratedLiquidityPoolAssetDenoms.some(
      (denom) =>
        denom === sendCurrency.coinMinimalDenom ||
        denom === outCurrency.coinMinimalDenom
    )
  ) {
    return true;
  }

  return false;
}
