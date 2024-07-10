import { BridgeAsset, BridgeChain } from "@osmosis-labs/bridge";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React from "react";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals";
import { api } from "~/utils/trpc";

interface BridgeOptionsModalProps extends ModalBaseProps {
  direction: "deposit" | "withdraw";
  fromAsset: BridgeAsset | undefined;
  toAsset: BridgeAsset | undefined;
  fromChain: BridgeChain | undefined;
  toChain: BridgeChain | undefined;
  toAddress: string | undefined;
}

export const MoreBridgeOptionsModal = observer(
  ({
    direction,
    fromAsset,
    toAsset,
    fromChain,
    toChain,
    toAddress,
    ...modalProps
  }: BridgeOptionsModalProps) => {
    const { t } = useTranslation();

    const { data: externalUrlsData, isLoading: isLoadingExternalUrls } =
      api.bridgeTransfer.getExternalUrls.useQuery(
        {
          fromAsset: fromAsset!,
          toAsset: toAsset!,
          fromChain: fromChain!,
          toChain: toChain!,
          toAddress: toAddress!,
        },
        {
          enabled:
            !!fromAsset && !!toAsset && !!fromChain && !!toChain && !!toAddress,
        }
      );

    return (
      <ModalBase
        title={
          <div className="md:subtitle1 mx-auto text-h6 font-h6">
            {t(
              direction === "deposit"
                ? "transfer.moreBridgeOptions.titleDeposit"
                : "transfer.moreBridgeOptions.titleWithdraw"
            )}
          </div>
        }
        className="!max-w-[30rem]"
        {...modalProps}
      >
        <p className="body1 md:body2 py-4 text-center text-osmoverse-300 md:py-2">
          {t(
            direction === "deposit"
              ? "transfer.moreBridgeOptions.descriptionDeposit"
              : "transfer.moreBridgeOptions.descriptionWithdraw",
            {
              asset: fromAsset?.denom ?? "",
              chain: toChain?.chainName ?? "",
            }
          )}
        </p>
        <div className="flex flex-col gap-1 pt-4 md:gap-0 md:pt-2">
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
                    className="subtitle1 md:caption flex items-center justify-between rounded-2xl bg-osmoverse-700 px-4 py-4 transition-colors duration-200 hover:bg-osmoverse-700/50 md:bg-transparent md:px-2 md:py-2"
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
