import { WalletStatus } from "@cosmos-kit/core";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import classNames from "classnames";
import Image from "next/image";
import { FunctionComponent, useCallback, useState } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { IS_TESTNET, SpriteIconId } from "~/config";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";

type PoolType = ObservableQueryPool["type"];

interface PoolTypeConfig {
  imageSrc: string;
  caption: string;
  iconId?: SpriteIconId;
}

export const SelectType: FunctionComponent<{
  types: PoolType[];
  selectType: (type: PoolType) => void;
}> = ({ types, selectType }) => {
  const { chainStore, accountStore } = useStore();
  const { t } = useTranslation();

  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const [selectedType, setSelectedType] = useState<PoolType | null>(null);

  const getTypeConfig = useCallback(
    (type: PoolType): PoolTypeConfig | undefined => {
      switch (type) {
        case "weighted":
          return {
            iconId: "weighted-pool",
            imageSrc: "/icons/weighted-pool.svg",
            caption: t("pools.createPool.weightedPool"),
          };
        case "stable":
          return {
            iconId: "stable-pool",
            imageSrc: "/icons/stable-pool.svg",
            caption: t("pools.createPool.stablePool"),
          };
        case "concentrated":
          return {
            iconId: "concentrated-pool",
            imageSrc: "/icons/stable-pool.svg",
            // TODO: i18n
            caption: "Supercharged pool",
          };
      }
    },
    [t]
  );

  const disableNext =
    account?.walletStatus !== WalletStatus.Connected || !selectedType;

  // Supercharged is the recommended path: render it on its own row above
  // the others, larger and with a highlighted border + "Recommended" badge.
  const recommendedType: PoolType = "concentrated";
  const recommended = types.find((t) => t === recommendedType);
  const others = types.filter((t) => t !== recommendedType);

  return (
    <div className="flex flex-col gap-8 pt-8">
      {recommended && (
        <div className="flex justify-center">
          {(() => {
            const type = recommended;
            const { caption, imageSrc, iconId } = getTypeConfig(type)!;
            const isSelected = selectedType === type;
            return (
              <button
                className="w-full max-w-[616px]"
                key={type}
                onClick={() => setSelectedType(type)}
              >
                <div
                  className={classNames(
                    "relative flex flex-col gap-5 rounded-2xl border-2 py-12",
                    isSelected
                      ? "border-wosmongton-300 bg-wosmongton-500"
                      : "border-wosmongton-500 bg-osmoverse-900"
                  )}
                >
                  <span className="caption absolute right-4 top-4 rounded-full bg-wosmongton-500 px-3 py-1 text-white-full">
                    {t("pools.createPool.recommended")}
                  </span>
                  <div
                    className={classNames("mx-auto transition", {
                      "-rotate-6 scale-110": isSelected,
                    })}
                  >
                    {iconId ? (
                      <Icon id={iconId} width={96} height={96} />
                    ) : (
                      <Image
                        src={imageSrc}
                        alt={caption}
                        height={96}
                        width={96}
                      />
                    )}
                  </div>
                  <div className="mx-auto">
                    <h5 className="md:subtitle1">{caption}</h5>
                  </div>
                </div>
              </button>
            );
          })()}
        </div>
      )}
      <div className="flex w-full justify-center gap-4 md:flex-wrap">
        {others.map((type) => {
          const { caption, imageSrc, iconId } = getTypeConfig(type)!;
          return (
            <button
              className="min-w-0 flex-1 md:w-full md:max-w-[296px] md:flex-none"
              key={type}
              onClick={() => setSelectedType(type)}
            >
              <div
                className={classNames(
                  "flex flex-col gap-4 rounded-2xl bg-osmoverse-900 py-10",
                  {
                    "bg-wosmongton-500": selectedType === type,
                  }
                )}
              >
                <div
                  className={classNames("mx-auto transition", {
                    "-rotate-6 scale-110": selectedType === type,
                  })}
                >
                  {iconId ? (
                    <Icon id={iconId} width={64} height={64} />
                  ) : (
                    <Image
                      src={imageSrc}
                      alt={caption}
                      height={64}
                      width={64}
                    />
                  )}
                </div>
                <div className="mx-auto">
                  <h6 className="md:caption">{caption}</h6>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {IS_TESTNET && (
        <div>
          <Button
            onClick={() => {
              account?.osmosis.sendCreateConcentratedPoolMsg(
                "uion",
                "uosmo",
                100,
                0.0001
              );
            }}
          >
            Create test 100 OSMO / 100 ION CL pool (0.01% spread)
          </Button>
        </div>
      )}
      <Button
        className="w-full"
        onClick={() => {
          if (selectedType) selectType(selectedType);
        }}
        disabled={disableNext}
      >
        {t("pools.createPool.buttonNext")}
      </Button>
    </div>
  );
};
