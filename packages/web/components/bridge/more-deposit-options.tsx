import Image from "next/image";
import React from "react";

import { Icon } from "~/components/assets";
import { ModalBase, ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const MoreDepositOptions = (modalProps: ModalBaseProps) => {
  const {
    accountStore,
    chainStore: {
      osmosis: { chainId, prettyChainName },
    },
  } = useStore();
  const wallet = accountStore.getWallet(chainId);

  // TODO: Use context state to get the fromAsset, toAsset, fromChain, and toChain
  const { data: asset, isLoading: isLoadingAsset } =
    api.edge.assets.getAssetWithPrice.useQuery({
      findMinDenomOrSymbol: "USDC",
    });
  const { data: externalUrlsData, isLoading: isLoadingExternalUrls } =
    api.bridgeTransfer.getExternalUrls.useQuery(
      {
        fromAsset: {
          address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
          decimals: asset!.coinDecimals,
          denom: asset!.coinDenom,
          sourceDenom: asset!.sourceDenom,
        },
        toAsset: {
          address: asset!.coinMinimalDenom,
          decimals: asset!.coinDecimals,
          denom: asset!.coinDenom,
          sourceDenom: asset!.sourceDenom,
        },
        fromChain: { chainId: 43114, chainType: "evm" },
        toChain: { chainId, chainType: "cosmos" },
        toAddress: wallet?.address ?? "",
      },
      {
        enabled: !!asset,
      }
    );

  return (
    <ModalBase
      title="More deposit options"
      className="!max-w-[30rem]"
      {...modalProps}
    >
      <h1 className="body1 py-4 text-center text-osmoverse-300">
        Choose from the following alternative providers to deposit (aka
        “bridge”) your {asset?.coinDenom} to {prettyChainName}.
      </h1>
      {isLoadingExternalUrls || isLoadingAsset ? (
        <p>loading...</p>
      ) : (
        <div className="flex flex-col gap-1 pt-4">
          {externalUrlsData?.externalUrls.map(
            ({ urlProviderName: providerName, url, logo }) => (
              <a
                key={url.toString()}
                href={url.toString()}
                target="_blank"
                rel="noreferrer"
                className="subtitle1 flex items-center justify-between rounded-2xl bg-osmoverse-700 px-4 py-4 transition-colors duration-200 hover:bg-osmoverse-700/50"
              >
                <div className="flex items-center gap-3">
                  <Image
                    alt={`${providerName} logo`}
                    src={logo}
                    width={44}
                    height={42}
                  />
                  <span>Deposit with {providerName}</span>
                </div>
                <Icon id="arrow-up-right" className="text-osmoverse-400" />
              </a>
            )
          )}
        </div>
      )}
    </ModalBase>
  );
};
