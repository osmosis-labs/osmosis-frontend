import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import Image from "next/image";
import { useMemo } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { OrderDirection, PlaceLimitState } from "~/hooks/limit-orders";
import { ModalBase } from "~/modals/base";
import { formatPretty } from "~/utils/formatter";

export interface ReviewLimitOrderModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  placeLimitState: PlaceLimitState;
  orderDirection: OrderDirection;
  orderType: "limit" | "market";
  makerFee: Dec;
}

export const ReviewLimitOrderModal: React.FC<ReviewLimitOrderModalProps> = ({
  isOpen,
  onRequestClose,
  placeLimitState,
  orderDirection,
  orderType,
  makerFee,
}) => {
  //TODO: Retrieve maker fee from contract
  const fee = useMemo(() => {
    return (
      placeLimitState.paymentFiatValue?.mul(makerFee) ??
      new PricePretty(DEFAULT_VS_CURRENCY, 0)
    );
  }, [placeLimitState.paymentFiatValue, makerFee]);

  //TODO: Normalize price against the dollar
  const total = useMemo(() => {
    if (
      placeLimitState.paymentFiatValue &&
      !placeLimitState.paymentFiatValue?.toDec().isZero()
    ) {
      return placeLimitState.paymentFiatValue!.sub(fee);
    }
    return new PricePretty(DEFAULT_VS_CURRENCY, 0);
  }, [placeLimitState.paymentFiatValue, fee]);

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={`${orderDirection === OrderDirection.Bid ? "Buy" : "Sell"} ${
        placeLimitState.baseAsset.coinName
      }`}
    >
      <div className="mt-6 flex flex-col">
        <div className="flex w-full justify-center">
          <Image
            width={48}
            height={48}
            src={placeLimitState.baseAsset.coinImageUrl!}
            alt={placeLimitState.baseAsset.coinDenom}
          />
        </div>
        <div className="flex w-full flex-col items-center justify-center py-4">
          <span className="text-h5">
            ≈{" "}
            {placeLimitState.inAmountInput.amount
              ? formatPretty(placeLimitState.inAmountInput.amount)
              : "0"}
          </span>
          <span className="text-body1 text-osmoverse-300">
            at ${formatPretty(placeLimitState.priceState.price)}
          </span>
        </div>
      </div>
      <div className="my-4 flex w-full flex-col">
        <div className="flex w-full justify-between py-2 text-body2">
          <span className="text-osmoverse-300">Amount</span>
          <span className="text-osmoverse-100">
            ≈{" "}
            {placeLimitState.inAmountInput.fiatValue
              ? formatPretty(placeLimitState.paymentFiatValue!)
              : "$0"}
          </span>
        </div>
        <div className="flex w-full justify-between py-2 text-body2">
          <span className="text-osmoverse-300">Total Estimated Fees</span>
          <span className="text-osmoverse-100">≈ {formatPretty(fee)}</span>
        </div>
        <hr className="my-2 text-osmoverse-700" />
        <div className="flex w-full justify-between py-2 text-body2">
          <span className="text-osmoverse-300">Total</span>
          <span className="text-osmoverse-100">≈ {formatPretty(total)}</span>
        </div>
        <div className="flex w-full justify-between py-2 text-body2">
          <span className="text-osmoverse-300">
            {orderDirection === OrderDirection.Ask
              ? "Receive Asset"
              : "Pay With"}
          </span>
          <span className="text-osmoverse-100">
            <Image
              width={24}
              height={24}
              src={placeLimitState.quoteAsset.coinImageUrl!}
              alt={placeLimitState.quoteAsset.coinDenom}
              className="inline"
            />{" "}
            {placeLimitState.quoteAsset.coinDenom}
          </span>
        </div>
        <div className="flex w-full justify-between py-2 text-body2">
          <span className="text-osmoverse-300">Order Type</span>
          <span className="text-osmoverse-100">
            {orderType === "limit" ? "Limit order" : "Market order"}
          </span>
        </div>
        <div className="flex w-full justify-between py-2 text-body2">
          <span className="text-osmoverse-300">Limit price</span>
          <div className="flex  items-center justify-center text-osmoverse-100">
            <div className="mr-2 flex items-center justify-center justify-between rounded-xl border border-osmoverse-700 px-3 py-1 text-caption text-osmoverse-300">
              {!placeLimitState.priceState.percentAdjusted.isZero() && (
                <Icon
                  id="triangle-down"
                  style={{
                    transform:
                      placeLimitState.priceState.percentAdjusted.isPositive()
                        ? "rotate(180deg)"
                        : "rotate(00deg)",
                  }}
                  width={10}
                  height={6}
                  className="mr-1"
                />
              )}
              <div>
                {formatPretty(
                  placeLimitState.priceState.percentAdjusted
                    .mul(new Dec(100))
                    .abs()
                )}
                %
              </div>
            </div>
            <div> ${formatPretty(placeLimitState.priceState.price)}</div>
          </div>
        </div>
        <div className="flex w-full justify-between py-2 text-body2">
          <span className="text-osmoverse-300">More details</span>
          <span className="cursor-pointer text-wosmongton-300">Show</span>
        </div>
        <div className="mt-5 flex w-full items-center justify-center py-2 text-body2">
          <span className="text-caption text-osmoverse-300">
            Disclaimer lorem ipsum.{" "}
            <a className="text-wosmongton-300">Learn more.</a>
          </span>
        </div>
        <div className="mt-4 flex w-full justify-between space-x-2 py-2 text-body2">
          <Button
            mode="unstyled"
            onClick={onRequestClose}
            className="rounded-xl border border-osmoverse-700 text-h6 text-wosmongton-200"
          >
            Cancel
          </Button>
          <Button onClick={placeLimitState.placeLimit}>Confirm</Button>
        </div>
      </div>
    </ModalBase>
  );
};
