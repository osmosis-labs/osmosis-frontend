import { Dec, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import Image from "next/image";
import { useQueryState } from "nuqs";
import { ReactNode, useMemo } from "react";

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
  makerFee: Dec;
}

export const ReviewLimitOrderModal: React.FC<ReviewLimitOrderModalProps> = ({
  isOpen,
  onRequestClose,
  placeLimitState,
  orderDirection,
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

  const [orderType] = useQueryState("type");

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      hideCloseButton
      className="flex w-[512px] flex-col rounded-2xl bg-osmoverse-850 !p-0"
    >
      <div className="relative flex h-20 w-full items-center justify-center p-4">
        <h6>
          {orderDirection === OrderDirection.Bid ? "Buy" : "Sell"}{" "}
          {placeLimitState.baseAsset?.coinName}
        </h6>
        <button
          onClick={onRequestClose}
          className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800"
        >
          <Icon id="thin-x" className="text-wosmongton-200" />
        </button>
      </div>
      <div className="flex flex-col px-8 pb-8">
        {placeLimitState.baseAsset && (
          <div className="flex flex-col gap-4 pb-3">
            <div className="flex w-full justify-center">
              <Image
                width={48}
                height={48}
                src={placeLimitState.baseAsset.coinImageUrl!}
                alt={placeLimitState.baseAsset.coinDenom}
              />
            </div>
            <div className="flex w-full flex-col items-center justify-center">
              <h5>
                ≈{" "}
                {placeLimitState.inAmountInput.amount
                  ? formatPretty(placeLimitState.inAmountInput.amount)
                  : "0"}
              </h5>
              <span className="text-body1 text-osmoverse-300">
                at ${formatPretty(placeLimitState.priceState.price)}
              </span>
            </div>
          </div>
        )}
        <div className="flex w-full flex-col pt-3">
          {placeLimitState.quoteAsset &&
            orderDirection === OrderDirection.Bid && (
              <RecapRow
                left="Pay With"
                right={
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
                }
              />
            )}
          <RecapRow
            left="Amount"
            right={
              <span className="text-osmoverse-100">
                ≈{" "}
                {placeLimitState.inAmountInput.fiatValue
                  ? formatPretty(placeLimitState.paymentFiatValue!)
                  : "$0"}
              </span>
            }
          />
          <RecapRow
            left={"Total Estimated Fees"}
            right={<>≈ {formatPretty(fee)}</>}
          />
          <hr className="my-2 text-osmoverse-700" />
          <RecapRow left="Total" right={<>≈ {formatPretty(total)}</>} />
          <RecapRow
            left="Order Type"
            right={
              <span className="text-osmoverse-100">
                {orderType === "limit" ? "Limit order" : "Market order"}
              </span>
            }
          />
          {placeLimitState.quoteAsset &&
            orderDirection === OrderDirection.Ask && (
              <RecapRow
                left="Recieve asset"
                right={
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
                }
              />
            )}
          {orderType === "limit" && (
            <RecapRow
              left="Limit Price"
              right={
                <div className="flex  items-center justify-center text-osmoverse-100">
                  <div className="mr-2 flex items-center justify-between rounded-xl border border-osmoverse-700 px-3 py-1 text-caption text-osmoverse-300">
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
              }
            />
          )}
          <div className="body2 flex h-8 w-full items-center justify-between">
            <span className="text-osmoverse-300">More details</span>
            <span className="cursor-pointer text-wosmongton-300">Show</span>
          </div>
          <div className="body2 mt-3 flex h-[38px] w-full items-center justify-center">
            <span className="text-caption text-osmoverse-300">
              Disclaimer lorem ipsum.{" "}
              <a className="text-wosmongton-300">Learn more</a>
            </span>
          </div>
          <div className="body2 flex w-full justify-between gap-3 pt-3">
            <Button
              mode="unstyled"
              onClick={onRequestClose}
              className="rounded-xl border border-osmoverse-700"
            >
              <h6 className="text-wosmongton-200">Cancel</h6>
            </Button>
            <Button onClick={placeLimitState.placeLimit}>
              <h6>Confirm</h6>
            </Button>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};

function RecapRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="body2 flex h-8 w-full items-center justify-between">
      <span className="text-osmoverse-300">{left}</span>
      {right}
    </div>
  );
}
