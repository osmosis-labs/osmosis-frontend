import Image from "next/image";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { BaseCell } from "..";
import { useStore } from "../../../stores";
import { useDeterministicIntegerFromString } from "../../../hooks";

const poolCardIconBackgroundColorsToTailwindBgImage = {
  socialLive: "bg-gradients-socialLive",
  greenBeach: "bg-gradients-greenBeach",
  kashmir: "bg-gradients-kashmir",
  frost: "bg-gradients-frost",
  cherry: "bg-gradients-cherry",
  sunset: "bg-gradients-sunset",
  orangeCoral: "bg-gradients-orangeCoral",
  pinky: "bg-gradients-pinky",
} as const;

const PoolCardIconBackgroundColors: (keyof typeof poolCardIconBackgroundColorsToTailwindBgImage)[] =
  [
    "socialLive",
    "greenBeach",
    "kashmir",
    "frost",
    "cherry",
    "sunset",
    "orangeCoral",
    "pinky",
  ];

export interface PoolCompositionCell {
  poolId: string;
}

/** Displays pool composition as a cell in a table.
 *
 *  Accepts the base hover flag.
 */
export const PoolCompositionCell: FunctionComponent<
  Partial<BaseCell & PoolCompositionCell>
> = ({ value, rowHovered, poolId }) => {
  const { queriesOsmosisStore, chainStore } = useStore();
  const deterministicInteger = useDeterministicIntegerFromString(poolId);

  const queryOsmosis = queriesOsmosisStore.get(chainStore.osmosis.chainId);

  const pool = queryOsmosis.queryGammPools.getPool(poolId);

  return (
    <React.Fragment>
      {pool ? (
        <div className="flex items-center">
          <div
            className={
              "absolute z-10 w-[2.125rem] h-[2.125rem] rounded-full border-[1px] bg-card border-enabledGold flex items-center justify-center"
            }
          >
            {pool.poolAssets[0].amount.currency.coinImageUrl ? (
              <Image
                src={pool.poolAssets[0].amount.currency.coinImageUrl}
                alt={pool.poolAssets[0].amount.currency.coinDenom}
                width={28}
                height={28}
              />
            ) : (
              <div
                className={classNames(
                  "w-7 h-7 bg-blue rounded-full flex items-center justify-center",
                  poolCardIconBackgroundColorsToTailwindBgImage[
                    PoolCardIconBackgroundColors[
                      deterministicInteger % PoolCardIconBackgroundColors.length
                    ]
                  ]
                )}
              >
                <Image
                  src="/icons/OSMO.svg"
                  alt="no token icon"
                  width={22}
                  height={22}
                />
              </div>
            )}
          </div>
          <div
            className={
              "ml-5 w-[2.125rem] h-[2.125rem] rounded-full border-[1px] border-enabledGold shrink-0 flex items-center justify-center"
            }
          >
            {pool.poolAssets.length >= 3 ? (
              <div className="body1 text-white-mid ml-2.5">{`+${
                pool.poolAssets.length - 1
              }`}</div>
            ) : pool.poolAssets[1].amount.currency.coinImageUrl ? (
              <Image
                src={pool.poolAssets[1].amount.currency.coinImageUrl}
                alt={pool.poolAssets[1].amount.currency.coinDenom}
                width={28}
                height={28}
              />
            ) : (
              <div
                className={classNames(
                  "w-7 h-7 bg-blue rounded-full flex items-center justify-center",
                  poolCardIconBackgroundColorsToTailwindBgImage[
                    PoolCardIconBackgroundColors[
                      deterministicInteger % PoolCardIconBackgroundColors.length
                    ]
                  ]
                )}
              >
                <Image
                  src="/icons/OSMO.svg"
                  alt="no token icon"
                  width={22}
                  height={22}
                />
              </div>
            )}
          </div>
          <div className="ml-4 mr-1 flex flex-col items-start text-white-full">
            <span
              className={classNames({
                "text-secondary-200": rowHovered,
              })}
            >
              {pool.poolAssets.length >= 3
                ? `${pool.poolAssets.length} Token Pool`
                : pool.poolAssets
                    .map((asset) => asset.amount.currency.coinDenom)
                    .join("/")}
            </span>
            <span
              className={classNames("text-sm font-caption opacity-60", {
                "text-secondary-600": rowHovered,
              })}
            >
              Pool #{poolId}
            </span>
          </div>
          <Image
            alt="trade"
            src="/icons/trade-green-check.svg"
            height={24}
            width={24}
          />
        </div>
      ) : (
        <span>{value ?? "No pool"}</span>
      )}
    </React.Fragment>
  );
};
