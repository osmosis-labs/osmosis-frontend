import { Dec } from "@osmosis-labs/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, useMemo } from "react";

import { DuplicatePoolCallout } from "~/components/complex/pool/create/duplicate-pool-callout";
import { StepBase } from "~/components/complex/pool/create/step-base";
import { StepProps } from "~/components/complex/pool/create/types";
import { TokenSelect } from "~/components/control";
import { InputBox } from "~/components/input";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import {
  type ProposedPool,
  useDuplicateGate,
  useDuplicatePoolCheck,
} from "~/hooks/use-duplicate-pool-check";

interface Step1Props extends StepProps {
  onUseExistingPool?: (poolId: string) => void;
}

export const Step1SetRatios: FunctionComponent<Step1Props> = observer(
  (props) => {
    const { createPoolConfig: config, onUseExistingPool } = props;
    const { isMobile } = useWindowSize();
    const { t } = useTranslation();

    // Build the discriminated-union proposed-pool shape from the live config.
    // Returns null until the inputs are valid enough to compare against
    // existing pools (all percentages set / scaling factors set, valid fee).
    // Build a primitive signature of the inputs that affect duplicate matching.
    // `config.assets` is a MobX observable.shallow array; when the user swaps a
    // token within an existing slot, the array reference doesn't change, only
    // the inner `sendCurrency` does. Depending on the array reference alone
    // would miss those swaps, so we read the relevant primitives eagerly
    // (within the observer's tracked render) and key the memo off them.
    const assetSignature = config.assets
      .map(
        (a) =>
          `${a.amountConfig.sendCurrency.coinMinimalDenom}:${
            a.percentage ?? ""
          }:${a.scalingFactor ?? ""}`
      )
      .join("|");
    const proposed = useMemo<ProposedPool | null>(() => {
      if (config.poolType === "weighted") {
        const weights: Record<string, number> = {};
        const denoms: string[] = [];
        for (const asset of config.assets) {
          if (!asset.percentage) return null;
          const pct = Number(asset.percentage);
          if (!Number.isFinite(pct) || pct <= 0) return null;
          const denom = asset.amountConfig.sendCurrency.coinMinimalDenom;
          denoms.push(denom);
          weights[denom] = pct;
        }
        if (denoms.length < 2) return null;
        let swapFeeDec: string;
        try {
          swapFeeDec = new Dec(config.swapFee).quo(new Dec(100)).toString();
        } catch {
          return null;
        }
        return { kind: "weighted", denoms, weights, swapFee: swapFeeDec };
      }
      if (config.poolType === "stable") {
        const scalingFactors: Record<string, number> = {};
        const denoms: string[] = [];
        for (const asset of config.assets) {
          if (!asset.scalingFactor) return null;
          const denom = asset.amountConfig.sendCurrency.coinMinimalDenom;
          denoms.push(denom);
          scalingFactors[denom] = asset.scalingFactor;
        }
        if (denoms.length < 2) return null;
        let swapFeeDec: string;
        try {
          swapFeeDec = new Dec(config.swapFee).quo(new Dec(100)).toString();
        } catch {
          return null;
        }
        return { kind: "stable", denoms, scalingFactors, swapFee: swapFeeDec };
      }
      return null;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.poolType, config.swapFee, assetSignature]);

    const { status, exactMatches, similarMatches } = useDuplicatePoolCheck({
      proposed,
      enabled: true,
    });
    useDuplicateGate({ config, status, exactMatches, proposed });

    return (
      <StepBase step={1} {...props}>
        <div className="flex flex-col gap-2.5">
          {config.assets.map(
            ({ amountConfig, percentage, scalingFactor }, index) => (
              <div
                key={amountConfig.sendCurrency.coinDenom}
                className="flex h-24 shrink-0 place-content-between items-center rounded-2xl border border-osmoverse-700 px-7 md:h-auto md:p-2.5"
              >
                <TokenSelect
                  selectedTokenDenom={amountConfig.sendCurrency.coinDenom}
                  tokens={config.remainingSelectableCurrencies.concat(
                    amountConfig.sendCurrency
                  )}
                  onSelect={(coinDenom) => {
                    const currency = config.remainingSelectableCurrencies.find(
                      (currency) => currency.coinDenom === coinDenom
                    );
                    if (currency) {
                      amountConfig.setSendCurrency(currency);
                    } else {
                      console.error(
                        "Unable to find currency selected in TokenSelect to be set in create pool config"
                      );
                    }
                  }}
                />
                <div className="md:subtitle1 flex items-center gap-2.5 text-h6 font-h6 md:gap-1">
                  {index >= 2 && (
                    <button
                      type="button"
                      aria-label={t("pools.createPool.removeToken")}
                      onClick={() => config.removeAssetAt(index)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-osmoverse-800 text-osmoverse-300 transition-colors hover:bg-osmoverse-700 hover:text-white-full"
                    >
                      <svg
                        viewBox="0 0 10 10"
                        className="h-2.5 w-2.5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1L9 9M9 1L1 9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  )}
                  {config.poolType === "weighted" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className={classNames({
                        hidden: config.assets.length < 2,
                      })}
                      onClick={() => config.setBalancedPercentages()}
                    >
                      {config.balancedPercentage.maxDecimals(0).toString()}
                    </Button>
                  )}
                  <InputBox
                    type="text"
                    inputMode="decimal"
                    inputClassName="text-h5 font-h5 md:subtitle1 w-32 md:w-14"
                    currentValue={
                      (config.poolType === "weighted" && percentage
                        ? percentage
                        : scalingFactor?.toString()) ?? ""
                    }
                    onInput={(value) => {
                      if (config.poolType === "weighted") {
                        config.setAssetPercentageAt(index, value);
                      } else {
                        config.setScalingFactorAt(index, value);
                      }
                    }}
                    placeholder=""
                    trailingSymbol={
                      config.poolType === "weighted" ? "%" : undefined
                    }
                    rightEntry
                  />
                </div>
              </div>
            )
          )}
          <button
            className={classNames(
              "flex shrink-0 select-none items-center gap-5 rounded-2xl border border-osmoverse-700 px-6 py-4 md:p-2.5",
              config.canAddAsset
                ? "cursor-pointer hover:border-wosmongton-200"
                : "cursor-default opacity-30"
            )}
            onClick={() => {
              const firstAsset = config.remainingSelectableCurrencies[0];
              if (firstAsset) {
                config.addAsset(firstAsset);
              }
            }}
          >
            <div className="ml-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-wosmongton-500 md:h-6 md:w-6">
              <Image
                alt="add"
                src="/icons/add.svg"
                height={isMobile ? 12 : 15}
                width={isMobile ? 12 : 15}
              />
            </div>
            <span className="subtitle1">
              {t("pools.createPool.buttonAddToken")}
            </span>
          </button>
        </div>
        <div className="flex flex-col gap-4 p-3.5 md:p-2.5">
          <div className="flex place-content-between items-center rounded-2xl">
            <span className="md:subtitle2">
              {t("pools.createPool.swapFee")}
            </span>
            <div className="flex items-center gap-4 md:gap-1">
              <InputBox
                className="w-44 md:w-20"
                type="text"
                inputMode="decimal"
                inputClassName="text-right text-h6 font-h6 md:subtitle1"
                currentValue={config.swapFee}
                onInput={(value) => config.setSwapFee(value)}
                placeholder=""
                trailingSymbol="%"
              />
            </div>
          </div>
          {config.poolType === "stable" && (
            <div className="flex place-content-between items-center rounded-2xl">
              <span className="md:subtitle2">
                {t("pools.createPool.scalingFactorController")}
              </span>
              <div className="flex items-center gap-4 md:gap-1">
                <InputBox
                  className="w-44 md:w-20"
                  type="text"
                  inputClassName="text-right text-h6 font-h6 md:subtitle1"
                  currentValue={config.scalingFactorControllerAddress}
                  onInput={(value) =>
                    config.setScalingFactorControllerAddress(value)
                  }
                  placeholder="osmo..."
                />
              </div>
            </div>
          )}
        </div>
        <DuplicatePoolCallout
          status={status}
          exactMatches={exactMatches}
          similarMatches={similarMatches}
          acknowledged={config.duplicateAcknowledged}
          onToggleAcknowledged={() =>
            (config.duplicateAcknowledged = !config.duplicateAcknowledged)
          }
          onUseExistingPool={onUseExistingPool}
        />
      </StepBase>
    );
  }
);
