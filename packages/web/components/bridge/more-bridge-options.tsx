import type { Bridge, BridgeAsset } from "@osmosis-labs/bridge";
import Image from "next/image";
import Link from "next/link";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { SkeletonLoader } from "~/components/loaders";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals";
import type { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { api } from "~/utils/trpc";

import { Button } from "../ui/button";

interface MoreBridgeOptionsProps {
  direction: "deposit" | "withdraw";
  fromAsset?: BridgeAsset;
  toAsset?: BridgeAsset;
  canonicalAssetDenom?: string;
  fromChain?: BridgeChainWithDisplayInfo;
  toChain?: BridgeChainWithDisplayInfo;
  toAddress?: string;
  bridges: Bridge[];
}

export const MoreBridgeOptionsModal: FunctionComponent<
  MoreBridgeOptionsProps & ModalBaseProps
> = ({
  direction,
  fromAsset,
  toAsset,
  canonicalAssetDenom,
  fromChain,
  toChain,
  toAddress,
  bridges,
  ...modalProps
}) => {
  const { t } = useTranslation();

  const { data: externalUrlsData, isLoading: isLoadingExternalUrls } =
    api.bridgeTransfer.getExternalUrls.useQuery(
      {
        bridges,
        fromAsset: fromAsset,
        toAsset: toAsset,
        fromChain: fromChain,
        toChain: toChain,
        toAddress: toAddress ?? "",
      },
      {
        enabled:
          !!fromAsset &&
          !!toAsset &&
          !!fromChain &&
          !!toChain &&
          !!toAddress &&
          !!bridges.length,

        // skip batching so this query does not get
        // batched with getSupportedAssetsByBridge query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const denom = canonicalAssetDenom ?? fromAsset?.denom ?? "";

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
        {!fromChain || !toChain
          ? t(
              direction === "deposit"
                ? "transfer.moreBridgeOptions.depositDescriptionUnknown"
                : "transfer.moreBridgeOptions.withdrawDescriptionUnknown",
              { denom }
            )
          : t(
              direction === "deposit"
                ? "transfer.moreBridgeOptions.chooseAnAlternativeProviderDeposit"
                : "transfer.moreBridgeOptions.chooseAnAlternativeProviderWithdraw",
              {
                asset: denom,
                fromChain: fromChain.prettyName,
                toChain: toChain.prettyName,
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

      <div className="caption pb-3 pt-5 text-center text-osmoverse-400">
        {t("transfer.risks")}{" "}
        <Link
          href="/disclaimer#providers-and-bridge-disclaimer"
          target="_blank"
          className="mx-auto text-xs font-semibold text-wosmongton-300 hover:text-rust-200"
        >
          {t("transfer.learnMore")}
        </Link>
      </div>
    </ModalBase>
  );
};

export const OnlyExternalBridgeSuggest: FunctionComponent<
  MoreBridgeOptionsProps & { onDone: () => void }
> = ({
  direction,
  toChain,
  toAsset,
  canonicalAssetDenom,
  fromChain,
  fromAsset,
  toAddress,
  bridges,
  onDone,
}) => {
  const { t } = useTranslation();

  const { data: externalUrlsData, isLoading: isLoadingExternalUrls } =
    api.bridgeTransfer.getExternalUrls.useQuery(
      {
        bridges,
        fromAsset: fromAsset,
        toAsset: toAsset,
        fromChain: fromChain,
        toChain: toChain,
        toAddress: toAddress,
      },
      {
        // skip batching so this query does not get
        // batched with getSupportedAssetsByBridge query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  // special splash screen for only one external bridge option
  if (externalUrlsData?.externalUrls.length === 1) {
    const { url, logo, urlProviderName } = externalUrlsData.externalUrls[0];

    const denom = canonicalAssetDenom ?? fromAsset?.denom ?? "";
    const translatedText =
      !fromChain || !toChain
        ? t(
            direction === "deposit"
              ? "transfer.moreBridgeOptions.depositDescriptionUnknown"
              : "transfer.moreBridgeOptions.withdrawDescriptionUnknown",
            { denom }
          )
        : t(
            direction === "deposit"
              ? "transfer.moreBridgeOptions.singleDescriptionDeposit"
              : "transfer.moreBridgeOptions.singleDescriptionWithdraw",
            {
              denom,
              networkA: fromChain.prettyName ?? "",
              networkB: toChain.prettyName ?? "",
              service: urlProviderName,
            }
          );

    /** Extract text that matches denom in translation and wrap in blue span. */
    const wrappedText = translatedText.replace(
      new RegExp(denom, "g"),
      `<span class="text-wosmongton-300">${denom}</span>`
    );

    return (
      <div className="flex w-full flex-col">
        <div className="flex w-full flex-col text-center">
          <Image
            className="mx-auto py-6"
            alt="provider logo"
            src={logo}
            height={64}
            width={64}
          />

          <p
            className="body1 md:body2 py-6 px-8 text-osmoverse-300 md:p-0"
            dangerouslySetInnerHTML={{ __html: wrappedText }}
          />
        </div>
        <div className="flex flex-col gap-3 py-3">
          <Button asChild>
            <a
              className="md:body1 text-h6 font-h6"
              href={url.toString()}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("transfer.openNoun", { noun: urlProviderName })}
              <Icon
                className="ml-3"
                id="top-right-arrow"
                height={24}
                width={24}
              />
            </a>
          </Button>
          <Button variant="secondary" onClick={onDone}>
            <div className="md:body1 text-h6 font-h6">{t("transfer.done")}</div>
          </Button>
        </div>
      </div>
    );
  }

  const denom = canonicalAssetDenom ?? fromAsset?.denom ?? "";
  const translatedText =
    !fromChain || !toChain
      ? t(
          direction === "deposit"
            ? "transfer.moreBridgeOptions.depositDescriptionUnknown"
            : "transfer.moreBridgeOptions.withdrawDescriptionUnknown",
          { denom }
        )
      : t(
          direction === "deposit"
            ? "transfer.moreBridgeOptions.descriptionDeposit"
            : "transfer.moreBridgeOptions.descriptionWithdraw",
          {
            denom,
            networkA: fromChain.prettyName,
            networkB: toChain.prettyName,
          }
        );

  /** Extract text that matches denom in translation and wrap in blue span. */
  const wrappedText = translatedText.replace(
    new RegExp(denom, "g"),
    `<span class="text-wosmongton-300">${denom}</span>`
  );

  return (
    <div>
      <p
        className="body1 md:body2 py-4 px-8 text-center text-osmoverse-300 md:px-4 md:py-2"
        dangerouslySetInnerHTML={{ __html: wrappedText }}
      />
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
                  className="subtitle1 md:caption flex items-center justify-between rounded-lg bg-transparent px-4 py-4 transition-colors duration-200 hover:bg-osmoverse-700/50 md:px-2 md:py-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-[42px] w-[44px] items-center">
                      <Image
                        alt={`${providerName} logo`}
                        src={logo}
                        width={44}
                        height={42}
                      />
                    </div>
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

      <div className="caption py-3 text-center text-osmoverse-400">
        {t("transfer.risks")}{" "}
        <Link
          href="/disclaimer#providers-and-bridge-disclaimer"
          target="_blank"
          className="mx-auto text-xs font-semibold text-wosmongton-300 hover:text-rust-200"
        >
          {t("transfer.learnMore")}
        </Link>
      </div>

      <Button className="w-full" variant="secondary" onClick={onDone}>
        <div className="md:body1 text-h6 font-h6">{t("transfer.done")}</div>
      </Button>
    </div>
  );
};
