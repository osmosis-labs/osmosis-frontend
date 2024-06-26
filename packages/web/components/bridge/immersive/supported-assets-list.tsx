import { BridgeChain } from "@osmosis-labs/bridge";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useEffect } from "react";

import { useBridgesSupportedAssets } from "~/components/bridge/immersive/use-bridges-supported-assets";
import { useWalletSelect } from "~/hooks";
import { useEvmWalletAccount } from "~/hooks/evm-wallet";
import { useStore } from "~/stores";
import { api, RouterOutputs } from "~/utils/trpc";

type SupportedAsset = ReturnType<
  typeof useBridgesSupportedAssets
>["supportedAssetsByChainId"][string][number];

interface BaseSupportedAssetListProps {
  supportedAssets: SupportedAsset[];
  selectedAssetAddress: string;
  onSelectAsset: (asset: SupportedAsset) => void;
}

interface SupportedAssetEvmListProps extends BaseSupportedAssetListProps {
  chain: Extract<BridgeChain, { chainType: "evm" }>;
}

interface SupportedAssetCosmosListProps extends BaseSupportedAssetListProps {
  chain: Extract<BridgeChain, { chainType: "cosmos" }>;
}

export const SupportedAssetEvmList = (props: SupportedAssetEvmListProps) => {
  const { address: evmAddress } = useEvmWalletAccount();

  return <SupportedAssetInnerList {...props} />;
};

export const SupportedAssetCosmosList = observer(
  (props: SupportedAssetCosmosListProps) => {
    const { chain, supportedAssets } = props;

    const { accountStore } = useStore();
    const { onOpenWalletSelect } = useWalletSelect();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);

    const counterpartyAccountRepo = accountStore.getWalletRepo(chain.chainId);
    const counterpartyAccount = accountStore.getWallet(chain.chainId);

    // TODO: Move this to root
    useEffect(() => {
      if (typeof chain.chainId !== "string" || !!counterpartyAccount?.address)
        return;
      counterpartyAccountRepo?.connect(wallet?.walletName).catch(() =>
        onOpenWalletSelect({
          walletOptions: [{ walletType: "cosmos", chainId: chain.chainId }],
        })
      );
    }, [
      chain.chainId,
      counterpartyAccount?.address,
      counterpartyAccountRepo,
      onOpenWalletSelect,
      wallet?.walletName,
    ]);

    const { data: assets, isLoading } =
      api.local.bridgeTransfer.getSupportedAssetsBalances.useQuery(
        {
          type: "cosmos",
          assets: supportedAssets as Extract<
            SupportedAsset,
            { chainType: "cosmos" }
          >[],
          userOsmoAddress: counterpartyAccount?.address!,
        },
        {
          enabled: !!counterpartyAccount?.address,
        }
      );

    if (!assets) return null;

    return (
      <SupportedAssetInnerList
        {...props}
        assets={assets}
        isLoading={isLoading}
      />
    );
  }
);

interface SupportedAssetInnerListProps extends BaseSupportedAssetListProps {
  assets: NonNullable<
    RouterOutputs["local"]["bridgeTransfer"]["getSupportedAssetsBalances"]
  >;
  isLoading: boolean;
}

const SupportedAssetInnerList: FunctionComponent<
  SupportedAssetInnerListProps
> = ({
  supportedAssets,
  selectedAssetAddress,
  onSelectAsset,
  assets,
  isLoading,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between rounded-2xl bg-osmoverse-1000">
      {assets.map((asset, index) => {
        const isActive =
          asset.amount.currency.coinMinimalDenom === selectedAssetAddress;
        return (
          <button
            key={asset.coinDenom + index}
            className={classNames(
              "subtitle1 flex w-1/3 flex-col items-center rounded-lg py-3 px-2",
              {
                "bg-osmoverse-825 text-wosmongton-100": isActive,
                "text-osmoverse-100": !isActive,
              }
            )}
            onClick={() =>
              onSelectAsset(
                supportedAssets.find(
                  (a) => a.address === asset.amount.currency.coinMinimalDenom
                )!
              )
            }
          >
            <span>{asset.coinDenom}</span>
            <span className="body2 text-osmoverse-300">
              {asset.usdValue.toString()}
            </span>
          </button>
        );
      })}
    </div>
  );
};
