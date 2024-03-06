import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, ReactNode } from "react";

import { Button } from "~/components/buttons";
import { CustomClasses } from "~/components/types";
import { Slider } from "~/components/ui/slider";
import { useTranslation } from "~/hooks";

/** Liquidity to be removed. */
export type RemovableShareLiquidity = {
  shareValue: PricePretty;
  shares: CoinPretty;
  underlyingCoins: CoinPretty[];
};

export const RemoveLiquidity: FunctionComponent<
  {
    /** Raw percentage as integer. e.g. `50` => 50% */
    percentage: string;
    setPercentage: (percentage: string) => void;
    actionButton: ReactNode;
  } & RemovableShareLiquidity &
    CustomClasses
> = observer(
  ({
    percentage,
    setPercentage,
    className,
    shareValue,
    shares,
    underlyingCoins,
    actionButton,
  }) => {
    const { t } = useTranslation();

    const percentageMultiplier = new Dec(percentage).quo(new Dec(100));
    const removableValueWithPercentage = shareValue.mul(percentageMultiplier);
    const removableSharesWithPercentage = shares.mul(percentageMultiplier);

    return (
      <>
        <div
          className={classNames(
            "mx-auto flex w-[420px] flex-col gap-9 text-center md:w-full md:gap-5",
            className
          )}
        >
          <div className="flex flex-col gap-1">
            <h2 className="mt-12 md:mt-7">
              {removableValueWithPercentage.toString()}
            </h2>
            <h5 className="text-osmoverse-100 md:text-h6 md:font-h6">
              {t("removeLiquidity.sharesAmount", {
                shares: removableSharesWithPercentage
                  .trim(true)
                  .hideDenom(true)
                  .toString(),
              })}
            </h5>
          </div>
          <div className="flex flex-wrap place-content-around items-center gap-4 rounded-xl border border-osmoverse-600 py-2 px-3 text-osmoverse-300">
            {underlyingCoins.map((asset) => (
              <div
                className="flex items-center gap-2"
                key={asset.currency.coinDenom}
              >
                {asset.currency.coinImageUrl && (
                  <Image
                    alt="token icon"
                    src={asset.currency.coinImageUrl}
                    height={16}
                    width={16}
                  />
                )}
                <span className="max-w-xs truncate">
                  {asset.mul(percentageMultiplier).trim(true).toString()}
                </span>
              </div>
            ))}
          </div>
          <Slider
            className="my-8 w-full"
            value={[parseInt(percentage)]}
            onValueChange={(value: number[]) =>
              setPercentage(value[0].toString())
            }
            min={0}
            max={100}
            step={1}
          />
          <div className="mb-14 grid h-9 w-full grid-cols-4 gap-5 md:mb-6 md:gap-1">
            <Button
              className="!h-full"
              mode="amount"
              onClick={() => setPercentage("25")}
              disabled={shareValue.toDec().isZero()}
            >
              25%
            </Button>
            <Button
              className="!h-full"
              mode="amount"
              onClick={() => setPercentage("50")}
              disabled={shareValue.toDec().isZero()}
            >
              50%
            </Button>
            <Button
              className="!h-full"
              mode="amount"
              onClick={() => setPercentage("75")}
              disabled={shareValue.toDec().isZero()}
            >
              75%
            </Button>
            <Button
              className="!h-full"
              mode="amount"
              onClick={() => setPercentage("100")}
              disabled={shareValue.toDec().isZero()}
            >
              {t("components.MAX")}
            </Button>
          </div>
        </div>
        {actionButton}
      </>
    );
  }
);
