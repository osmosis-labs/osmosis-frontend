import { observer } from "mobx-react-lite";
import Image from "next/image";
import React from "react";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

interface MoreBridgeOptionsProps extends ModalBaseProps {
  type: "deposit" | "withdraw";
}

export const MoreBridgeOptions = observer(
  ({ type, ...modalProps }: MoreBridgeOptionsProps) => {
    const {
      accountStore,
      chainStore: {
        osmosis: { prettyChainName },
      },
    } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);
    const { t } = useTranslation();

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
          toChain: {
            chainId: accountStore.osmosisChainId,
            chainType: "cosmos",
          },
          toAddress: wallet?.address ?? "",
        },
        {
          enabled: !!asset,
        }
      );

    return (
      <ModalBase
        title={t(
          type === "deposit"
            ? "transfer.moreBridgeOptions.titleDeposit"
            : "transfer.moreBridgeOptions.titleWithdraw"
        )}
        className="!max-w-[30rem]"
        {...modalProps}
      >
        <h1 className="body1 py-4 text-center text-osmoverse-300">
          {t(
            type === "deposit"
              ? "transfer.moreBridgeOptions.descriptionDeposit"
              : "transfer.moreBridgeOptions.descriptionWithdraw",
            {
              asset: asset?.coinDenom ?? "",
              chain: prettyChainName,
            }
          )}
        </h1>
        <div className="flex flex-col gap-1 pt-4">
          {isLoadingExternalUrls || isLoadingAsset ? (
            <>
              {new Array(3).fill(undefined).map((_, i) => (
                <SkeletonLoader key={i} className="h-[76px] w-full" />
              ))}
            </>
          ) : (
            <>
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
                      <span>
                        {t(
                          type === "deposit"
                            ? "transfer.moreBridgeOptions.depositWith"
                            : "transfer.moreBridgeOptions.withdrawWith"
                        )}{" "}
                        {providerName}
                      </span>
                    </div>
                    <Icon id="arrow-up-right" className="text-osmoverse-400" />
                  </a>
                )
              )}
            </>
          )}
        </div>
      </ModalBase>
    );
  }
);
