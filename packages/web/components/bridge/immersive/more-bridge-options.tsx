import { BridgeAsset, BridgeChain } from "@osmosis-labs/bridge";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React from "react";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals";
import { api } from "~/utils/trpc";

interface MoreBridgeOptionsProps extends ModalBaseProps {
  direction: "deposit" | "withdraw";
  fromAsset: BridgeAsset | undefined;
  toAsset: BridgeAsset | undefined;
  fromChain: BridgeChain | undefined;
  toChain: BridgeChain | undefined;
  toAddress: string | undefined;
}

export const MoreBridgeOptions = observer(
  ({
    direction,
    fromAsset,
    toAsset,
    fromChain,
    toChain,
    toAddress,
    ...modalProps
  }: MoreBridgeOptionsProps) => {
    const { t } = useTranslation();

    const { data: externalUrlsData, isLoading: isLoadingExternalUrls } =
      api.bridgeTransfer.getExternalUrls.useQuery(
        {
          fromAsset,
          toAsset,
          fromChain,
          toChain,
          toAddress,
        },
        {
          enabled:
            !!fromAsset && !!toAsset && !!fromChain && !!toChain && !!toAddress,
        }
      );

    return (
      <ModalBase
        title={t(
          direction === "deposit"
            ? "transfer.moreBridgeOptions.titleDeposit"
            : "transfer.moreBridgeOptions.titleWithdraw"
        )}
        className="!max-w-[30rem]"
        {...modalProps}
      >
        <p className="body1 py-4 text-center text-osmoverse-300">
          {t(
            direction === "deposit"
              ? "transfer.moreBridgeOptions.descriptionDeposit"
              : "transfer.moreBridgeOptions.descriptionWithdraw",
            {
              asset: fromAsset.denom,
              chain: toChain.chainName ?? "",
            }
          )}
        </p>
        <div className="flex flex-col gap-1 pt-4">
          {isLoadingExternalUrls ? (
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
                          direction === "deposit"
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
