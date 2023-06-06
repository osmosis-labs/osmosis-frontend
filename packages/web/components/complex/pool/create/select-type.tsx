import { WalletStatus } from "@keplr-wallet/stores";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import classNames from "classnames";
import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Button } from "~/components/buttons";
import { IS_TESTNET } from "~/config";
import { useStore } from "~/stores";

export type PoolType = ObservableQueryPool["type"];

export const SelectType: FunctionComponent<{
  types: PoolType[];
  selectType: (type: PoolType) => void;
}> = ({ types, selectType }) => {
  const { chainStore, accountStore } = useStore();
  const t = useTranslation();

  const account = accountStore.getAccount(chainStore.osmosis.chainId);

  const [selectedType, setSelectedType] = useState<PoolType | null>(null);

  const disableNext =
    account.walletStatus !== WalletStatus.Loaded || !selectedType;

  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="flex w-full gap-4">
        {types.map((type) => (
          <button
            className="w-full"
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
                <Image
                  src={
                    type === "weighted"
                      ? "/icons/weighted-pool.svg"
                      : "/icons/stable-pool.svg"
                  }
                  alt={type === "weighted" ? "weighted pool" : "stable pool"}
                  height={64}
                  width={64}
                />
              </div>
              <div className="mx-auto">
                <h6 className="md:caption">
                  {type === "weighted"
                    ? t("pools.createPool.weightedPool")
                    : t("pools.createPool.stablePool")}
                </h6>
              </div>
            </div>
          </button>
        ))}
      </div>
      {IS_TESTNET && (
        <div>
          <Button
            onClick={() => {
              account.osmosis.sendCreateConcentratedPoolMsg(
                "uion",
                "uosmo",
                100,
                0
              );
            }}
          >
            Create test 100 OSMO / 100 ION CL pool
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
