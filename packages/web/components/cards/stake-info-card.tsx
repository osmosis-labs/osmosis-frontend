import { CoinPretty, Dec, DecUtils, IntPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import Image from "next/image";
import React, { FunctionComponent, useCallback, useMemo } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { OsmoverseCard } from "~/components/cards/osmoverse-card";
import { useWindowSize } from "~/hooks";
import { useStore } from "~/stores";

const OSMO_IMG_URL = "/tokens/osmo.svg";

export const StakeInfoCard: FunctionComponent<{
  balance?: string;
  setInputAmount: (amount: string | undefined) => void;
  inputAmount: string | undefined;
}> = ({ balance, inputAmount, setInputAmount }) => {
  const t = useTranslation();
  const isMobile = useWindowSize();

  const { chainStore, priceStore } = useStore();
  const osmo = chainStore.osmosis.stakeCurrency;

  // amount fiat value
  const outAmountValue = useMemo(
    () =>
      inputAmount && inputAmount !== "" && new Dec(inputAmount).gt(new Dec(0))
        ? priceStore.calculatePrice(
            new CoinPretty(
              osmo,
              new Dec(inputAmount).mul(
                DecUtils.getTenExponentNInPrecisionRange(osmo.coinDecimals)
              )
            )
          )
        : undefined,
    [inputAmount, osmo, priceStore]
  );

  const handleHalfButtonClick = useCallback(() => {
    setInputAmount(
      new IntPretty(new Dec(Number(balance)).quo(new Dec(2)))
        .maxDecimals(4)
        .trim(true)
        .toString()
    );
  }, [balance, setInputAmount]);

  const handleMaxButtonClick = useCallback(() => {
    setInputAmount(balance);
  }, [balance, setInputAmount]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (
        !isNaN(Number(e.target.value)) &&
        Number(e.target.value) >= 0 &&
        Number(e.target.value) <= Number.MAX_SAFE_INTEGER &&
        e.target.value.length <= (isMobile ? 19 : 26)
      ) {
        setInputAmount(e.target.value);
      }
    },
    [isMobile, setInputAmount]
  );

  return (
    <OsmoverseCard>
      <div className="flex place-content-between items-center transition-opacity">
        <div className="flex">
          <span className="caption text-sm text-white-full md:text-xs">
            {t("stake.available")}
          </span>
          <span className="caption ml-1.5 text-sm text-wosmongton-300 md:text-xs">
            {balance}&nbsp;OSMO
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            mode="amount"
            className="py-1 px-1.5 text-xs"
            onClick={handleHalfButtonClick}
          >
            {t("swap.HALF")}
          </Button>
          <Button
            mode="amount"
            className="py-1 px-1.5 text-xs"
            onClick={handleMaxButtonClick}
          >
            {t("stake.MAX")}
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 py-3 px-2 text-left">
        <div className="mr-1 flex h-[50px] shrink-0 overflow-hidden rounded-full md:h-7 md:w-7">
          <Image
            src={OSMO_IMG_URL}
            alt="osmosis icon"
            width={isMobile ? 30 : 50}
            height={isMobile ? 30 : 50}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center text-lg">
            {isMobile ? <span className="subtitle1">OSMO</span> : <h4>OSMO</h4>}
          </div>
          <span className="subtitle2 md:caption w-32 text-xs text-osmoverse-400">
            Osmosis
          </span>
        </div>
        <div className="flex w-full flex-col items-end">
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
            value={inputAmount}
          />
          <div
            className={classNames(
              "subtitle1 md:caption text-osmoverse-300 transition-opacity",
              outAmountValue ? "opacity-100" : "opacity-0"
            )}
          >
            {`≈ $ ${outAmountValue || "0"}`}
          </div>
        </div>
      </div>
    </OsmoverseCard>
  );
};
