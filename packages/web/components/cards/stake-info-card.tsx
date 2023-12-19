import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { FunctionComponent, useCallback } from "react";

import { Button } from "~/components/buttons";
import { OsmoverseCard } from "~/components/cards/osmoverse-card";
import { useTranslation, useWindowSize } from "~/hooks";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

const OSMO_IMG_URL = `${process.env.NEXT_PUBLIC_BASEPATH}/tokens/osmo.svg`;

export const StakeInfoCard: FunctionComponent<{
  availableAmount?: CoinPretty;
  setInputAmount: (amount: string) => void;
  inputAmount: string | undefined;
  handleHalfButtonClick: () => void;
  handleMaxButtonClick: () => void;
  isMax?: boolean;
  isHalf?: boolean;
}> = observer(
  ({
    availableAmount,
    inputAmount,
    setInputAmount,
    handleHalfButtonClick,
    handleMaxButtonClick,
    isMax = false,
    isHalf = false,
  }) => {
    const { t } = useTranslation();
    const { isMobile } = useWindowSize();

    const { chainStore, priceStore } = useStore();
    const osmo = chainStore.osmosis.stakeCurrency;

    // amount fiat value
    const outAmountValue =
      inputAmount && new Dec(inputAmount).gt(new Dec(0))
        ? priceStore.calculatePrice(
            new CoinPretty(
              osmo,
              new Dec(inputAmount).mul(
                DecUtils.getTenExponentNInPrecisionRange(osmo.coinDecimals)
              )
            )
          )
        : undefined;

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (
          !isNaN(Number(e.target.value)) &&
          Number(e.target.value) >= 0 &&
          Number(e.target.value) <= Number.MAX_SAFE_INTEGER &&
          e.target.value.length <= (isMobile ? 19 : 26)
        ) {
          const { value } = e.target;
          setInputAmount(value);
        }
      },
      [setInputAmount, isMobile]
    );

    const formattedAvailableAmount = formatPretty(
      availableAmount || new CoinPretty(osmo, 0),
      { maxDecimals: 2 }
    );

    return (
      <OsmoverseCard>
        <div className="flex place-content-between items-center transition-opacity">
          <div className="caption flex">
            <span className="text-white-full">{t("stake.available")}</span>
            <span className="ml-1.5 text-wosmongton-300">
              {formattedAvailableAmount}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              mode="amount"
              className={classNames(
                "caption py-1 px-1.5",
                isHalf ? "bg-wosmongton-100/20" : "bg-transparent"
              )}
              onClick={handleHalfButtonClick}
            >
              {t("swap.HALF")}
            </Button>
            <Button
              mode="amount"
              className={classNames(
                "caption py-1 px-1.5",
                isMax ? "bg-wosmongton-100/20" : "bg-transparent"
              )}
              onClick={handleMaxButtonClick}
            >
              {t("stake.MAX")}
            </Button>
          </div>
        </div>
        <div className="flex items-start gap-1 pt-2 text-left">
          <div className="mr-1 flex shrink-0 items-center overflow-hidden rounded-full md:h-7 md:w-7">
            <Image
              src={OSMO_IMG_URL}
              alt="osmosis icon"
              width={isMobile ? 30 : 46}
              height={isMobile ? 30 : 46}
            />
          </div>
          <div className="flex flex-shrink flex-col">
            <h6 className="flex flex-shrink items-center md:text-h6 md:font-h6">
              OSMO
            </h6>
            <span className="caption w-fit text-osmoverse-400">Osmosis</span>
          </div>
          <div className="flex-end flex w-full flex-grow flex-col place-content-around items-center overflow-hidden text-right">
            <input
              type="number"
              className={classNames(
                "placeholder:text-white w-full bg-transparent text-right text-white-full focus:outline-none md:text-subtitle1",
                "text-h5 font-h5 md:font-subtitle1",
                "overflow-hidden"
              )}
              placeholder="0"
              onChange={handleInputChange}
              value={inputAmount}
            />
            <h5
              className={classNames(
                "w-full truncate text-right text-osmoverse-300 transition-opacity md:text-h6 md:font-h6",
                outAmountValue ? "opacity-100" : "opacity-50"
              )}
            >
              {`≈ ${outAmountValue || "0"}`}
            </h5>
          </div>
        </div>
      </OsmoverseCard>
    );
  }
);
