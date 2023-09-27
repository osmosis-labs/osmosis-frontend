import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { OsmoverseCard } from "~/components/cards/osmoverse-card";
import { useWindowSize } from "~/hooks";
import { useStore } from "~/stores";

const OSMO_IMG_URL = "/tokens/osmo.svg";

export const StakeInfoCard: FunctionComponent<{
  balance?: string;
  setInputAmount: (amount: string) => void;
  inputAmount: string | undefined;
  handleHalfButtonClick: () => void;
  handleMaxButtonClick: () => void;
}> = observer(
  ({
    balance,
    inputAmount,
    setInputAmount,
    handleHalfButtonClick,
    handleMaxButtonClick,
  }) => {
    const t = useTranslation();
    const isMobile = useWindowSize();

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
        const { value } = e.target;
        setInputAmount(value);
      },
      [setInputAmount]
    );

    return (
      <OsmoverseCard>
        <div className="flex place-content-between items-center transition-opacity">
          <div className="caption flex">
            <span className="text-white-full md:text-xs">
              {t("stake.available")}
            </span>
            <h5 className="caption ml-1.5 text-wosmongton-300 md:text-h6 md:font-h6">
              {balance}
            </h5>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              mode="amount"
              className="caption py-1 px-1.5"
              onClick={handleHalfButtonClick}
            >
              {t("swap.HALF")}
            </Button>
            <Button
              mode="amount"
              className="caption py-1 px-1.5"
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
          <div className="flex-end flex w-full flex-grow flex-col place-content-around items-center text-right">
            <input
              type="number"
              className={classNames(
                "w-full bg-transparent text-right text-white-full placeholder:text-white-disabled focus:outline-none md:text-subtitle1",
                Number(inputAmount?.length) >= 14
                  ? "caption"
                  : "text-h5 font-h5 md:font-subtitle1"
              )}
              placeholder="0"
              onChange={handleInputChange}
              value={inputAmount || ""}
            />
            <h5
              className={classNames(
                "w-full text-right text-osmoverse-300 transition-opacity md:text-h6 md:font-h6",
                outAmountValue ? "opacity-100" : "opacity-0"
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
