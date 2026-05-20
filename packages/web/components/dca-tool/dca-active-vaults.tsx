import { Disclosure } from "@headlessui/react";
import { Asset } from "@osmosis-labs/types";
import { CoinPretty, Int } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { Button } from "~/components/ui/button";
import { AssetLists } from "~/config/generated/asset-lists";
import { useTranslation } from "~/hooks";
import { DcaVault, useDcaVaults } from "~/hooks/dca/use-dca-vaults";
import { formatPretty } from "~/utils/formatter";

/** Pretty-prints a base-unit string amount using the matching asset's decimals.
 *  Falls back to the raw amount + denom when the asset can't be resolved (e.g.
 *  a denom that isn't on the assetlist). */
function formatVaultAmount(amount: string, asset: Asset | undefined): string {
  if (!asset) return amount;
  return formatPretty(
    new CoinPretty(
      {
        coinDecimals: asset.decimals,
        coinDenom: asset.symbol,
        coinMinimalDenom: asset.coinMinimalDenom,
      },
      new Int(amount || "0")
    )
  );
}

interface VaultRowProps {
  vault: DcaVault;
  onCancel: (id: string) => void;
}

const VaultRow = ({ vault, onCancel }: VaultRowProps) => {
  const { t } = useTranslation();

  const sendAsset = useMemo(
    () =>
      getAssetFromAssetList({
        assetLists: AssetLists,
        coinMinimalDenom: vault.sendDenom,
      })?.rawAsset,
    [vault.sendDenom]
  );
  const targetAsset = useMemo(
    () =>
      getAssetFromAssetList({
        assetLists: AssetLists,
        coinMinimalDenom: vault.targetDenom,
      })?.rawAsset,
    [vault.targetDenom]
  );

  const sendLabel = sendAsset?.symbol ?? vault.sendDenom;
  const targetLabel = targetAsset?.symbol ?? vault.targetDenom;

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-osmoverse-800 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="body2 text-white">
          {sendLabel} → {targetLabel}
        </span>
        <span
          className={classNames(
            "caption rounded-full px-2 py-0.5",
            vault.status === "Active"
              ? "bg-bullish-400/20 text-bullish-400"
              : "bg-osmoverse-600 text-osmoverse-300"
          )}
        >
          {vault.status}
        </span>
      </div>
      <div className="caption flex flex-col gap-0.5 text-osmoverse-400">
        <span>
          {t("dca.vaultSwapAmount")}:{" "}
          {formatVaultAmount(vault.swapAmount, sendAsset)} /{" "}
          {vault.timeInterval}
        </span>
        <span>
          {t("dca.vaultBalance")}: {formatVaultAmount(vault.balance, sendAsset)}
        </span>
        <span>
          {t("dca.vaultReceived")}:{" "}
          {formatVaultAmount(vault.receivedAmount, targetAsset)}
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="self-end"
        onClick={() => onCancel(vault.id)}
      >
        {t("dca.cancelVault")}
      </Button>
    </div>
  );
};

export const DcaActiveVaults = observer(() => {
  const { t } = useTranslation();

  const { vaults, isLoading, cancelVault } = useDcaVaults();

  const activeVaults = vaults.filter(
    (v) => v.status === "Active" || v.status === "Scheduled"
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-3">
        <Spinner />
      </div>
    );
  }

  if (activeVaults.length === 0) return null;

  return (
    <Disclosure defaultOpen>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full items-center justify-between rounded-2xl border border-osmoverse-800 px-4 py-3 hover:bg-osmoverse-850">
            <span className="subtitle2 text-osmoverse-200">
              {t("dca.activeVaults", { count: activeVaults.length.toString() })}
            </span>
            <Icon
              id="chevron-down"
              width={14}
              height={14}
              className={classNames("text-osmoverse-400 transition-transform", {
                "rotate-180": open,
              })}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="flex flex-col gap-2">
            {activeVaults.map((vault) => (
              <VaultRow key={vault.id} vault={vault} onCancel={cancelVault} />
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
});

// Re-export so consumers can import alongside DcaActiveVaults
export type { DcaVault };
