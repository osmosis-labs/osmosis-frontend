import { Dec } from "@keplr-wallet/unit";
import { MappedLimitOrder } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent, useEffect, useState } from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { Breakpoint, useWindowSize } from "~/hooks";

export const OpenOrders: FunctionComponent<{
  orders?: MappedLimitOrder[];
}> = ({ orders }) => {
  const openOrders = orders?.filter((order) => order.status === "open");

  console.log("openOrders", openOrders);

  const { width } = useWindowSize();

  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (width > Breakpoint.xl) {
      setIsOpen(true);
    }
  }, [width]);

  if (!openOrders) return null;

  return (
    <div className="flex w-full flex-col py-3">
      <div
        className="flex cursor-pointer items-center justify-between py-3"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <h6>Open Orders</h6>
        {width > Breakpoint.xl && (
          <Icon
            id="chevron-down"
            className={classNames("transition-transform", {
              "rotate-180": isOpen,
            })}
          />
        )}
      </div>
      {isOpen && (
        <>
          <div className="flex flex-col space-y-3">
            {openOrders.map(
              ({ baseAsset, quoteAsset, quantity, price }, index) => {
                const assetAmount = new Dec(quantity).toString();
                const assetDenom = baseAsset?.symbol;
                const fiatValue = new Dec(quantity).mul(price).toString();
                return (
                  <div
                    key={baseAsset?.symbol}
                    className="body2 flex w-full justify-between"
                  >
                    <div className="flex items-center space-x-1">
                      <FallbackImg
                        src={baseAsset?.rawAsset.logoURIs.svg}
                        alt={baseAsset?.symbol}
                        fallbacksrc="/icons/question-mark.svg"
                        width={20}
                        height={20}
                        className="inline-block"
                      />
                      <span>{baseAsset?.currency?.coinDenom}</span>
                      <span className="text-osmoverse-400">
                        {`${assetAmount} ${assetDenom}`}
                      </span>
                    </div>
                    <div>
                      {/* {displayFiatPrice(fiatValue, quoteAsset.symbol, t)} */}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </>
      )}
    </div>
  );
};
