import { AppCurrency } from "@keplr-wallet/types";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { useFlags } from "launchdarkly-react-client-sdk";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent, useMemo } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";

/** Show link to pools page in promo drawer if the send or out currency in swap tool is in the given list of pools.
 *  Returns null if no pools are found containing the send or out currency.
 */
export const SwapToolPromo: FunctionComponent<{
  pools: ObservableQueryPool[];
  sendCurrency: AppCurrency;
  outCurrency: AppCurrency;
}> = ({ pools, sendCurrency, outCurrency }) => {
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
        src="/images/cl-homepage-bars.png"
        width={64}
        height={64}
      />
      <div className="flex flex-col gap-0.5">
        {denomInClPool && (
          <span className="subtitle1 text-osmoverse-100">
            {t("swap.promo.newOpportunity", { denom: denomInClPool })}
          </span>
        )}
        <Link href="/pools?pool=concentrated" passHref>
          <a className="text-supercharged-gradient subtitle1 group flex !h-fit items-center gap-1 py-1">
            {t("swap.promo.discoverSuperchargedPools")}
            <Icon
              id="arrow-right"
              height={20}
              className="text-ion-400 transition-transform duration-200 ease-in-out group-hover:translate-x-1 group-hover:transform"
            />
          </a>
        </Link>
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
