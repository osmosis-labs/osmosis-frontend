import { WalletStatus } from "@cosmos-kit/core";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import classNames from "classnames";
import Image from "next/image";
import { FunctionComponent, useCallback, useState } from "react";

import { Button } from "~/components/ui/button";
import { IS_TESTNET } from "~/config";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";

export type PoolType = ObservableQueryPool["type"];

export interface PoolTypeConfig {
  imageSrc: string;
  caption: string;
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
            imageSrc: "/icons/weighted-pool.svg",
            caption: t("pools.createPool.weightedPool"),
          };
        case "stable":
          return {
            imageSrc: "/icons/stable-pool.svg",
            caption: t("pools.createPool.stablePool"),
          };
        case "concentrated":
          return {
            imageSrc: "/icons/stable-pool.svg",
            // TODO: i18n
            caption: "Concentrated pool",
          };
      }
    },
    [t]
  );

  const disableNext =
    account?.walletStatus !== WalletStatus.Connected || !selectedType;

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="flex w-full flex-wrap justify-center gap-4">
        {types.map((type) => {
          const { caption, imageSrc } = getTypeConfig(type)!;
          return (
            <button
              className="w-full max-w-[296px]"
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
                  <Image src={imageSrc} alt={caption} height={64} width={64} />
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
