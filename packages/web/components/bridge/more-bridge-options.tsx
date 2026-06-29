import type { Bridge, BridgeAsset } from "@osmosis-labs/bridge";
import Image from "next/image";
import Link from "next/link";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { ExternalUrlConvertOption } from "~/components/bridge/external-url-convert";
import { SkeletonLoader } from "~/components/loaders";
import { useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals";
import type { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { api } from "~/utils/trpc";

type ExternalUrl = {
  urlProviderName: string;
  url: URL;
  logo: string;
  convertToVariant?: {
    coinMinimalDenom: string;
    symbol: string;
  };
};

interface MoreBridgeOptionsProps {
  direction: "deposit" | "withdraw";
  fromAsset?: BridgeAsset;
  toAsset?: BridgeAsset;
  fromChain?: BridgeChainWithDisplayInfo;
  toChain?: BridgeChainWithDisplayInfo;
  toAddress?: string;
  bridges: Bridge[];
}

function ExternalProviderList({
  direction,
  fromAsset,
  toAsset,
  fromChain,
  toChain,
  toAddress,
  bridges,
}: MoreBridgeOptionsProps) {
  const { t } = useTranslation();

  const { data: externalUrlsData, isLoading: isLoadingExternalUrls } =
    api.bridgeTransfer.getExternalUrls.useQuery(
      {
        bridges,
        fromAsset,
        toAsset,
        fromChain,
        toChain,
        toAddress: toAddress ?? "",
      },
      {
        enabled: !!fromAsset && !!toAsset && (!!fromChain || !!toChain),

        // skip batching so this query does not get
        // batched with getSupportedAssetsByBridge query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  if (isLoadingExternalUrls) {
    return (
      <>
        {new Array(3).fill(undefined).map((_, i) => (
          <SkeletonLoader key={i} className="h-[76px] w-full" />
        ))}
      </>
    );
  }

  if (externalUrlsData?.externalUrls.length === 0) {
    return (
      <p className="body1 pb-4 pt-2 text-center text-osmoverse-300">
        {t("transfer.moreBridgeOptions.noAlternativesFound")}
      </p>
    );
  }

  // On a withdrawal the source asset is the (possibly alloyed) asset being sent.
  const withdrawAlloyMinimalDenom =
    direction === "withdraw" ? fromAsset?.address : undefined;

  // Single provider: centered splash with large logo and primary CTA
  if (externalUrlsData?.externalUrls.length === 1) {
    const externalUrl = externalUrlsData.externalUrls[0];
    const { urlProviderName: providerName, logo } = externalUrl;
    return (
      <div className="flex flex-col items-center gap-6 py-4">
        <Image
          alt={`${providerName} logo`}
          src={logo}
          width={100}
          height={100}
          className="rounded-2xl"
        />
        <ExternalUrlOption
          externalUrl={externalUrl}
          direction={direction}
          withdrawAlloyMinimalDenom={withdrawAlloyMinimalDenom}
        >
          {({ href, onClick }) => (
            <a
              href={href}
              onClick={onClick}
              {...(href ? { target: "_blank", rel: "noreferrer" } : {})}
              className="subtitle1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-wosmongton-700 px-6 py-4 transition-colors duration-200 hover:bg-wosmongton-700/80"
            >
              {t(
                direction === "deposit"
                  ? "transfer.moreBridgeOptions.depositWith"
                  : "transfer.moreBridgeOptions.withdrawWith"
              )}{" "}
              {providerName}
              <Icon id="arrow-up-right" className="text-white-full" />
            </a>
          )}
        </ExternalUrlOption>
      </div>
    );
  }

  return (
    <>
      {externalUrlsData?.externalUrls.map((externalUrl) => {
        const { urlProviderName: providerName, url, logo } = externalUrl;
        return (
          <ExternalUrlOption
            key={url.toString()}
            externalUrl={externalUrl}
            direction={direction}
            withdrawAlloyMinimalDenom={withdrawAlloyMinimalDenom}
          >
            {({ href, onClick }) => (
              <a
                href={href}
                onClick={onClick}
                {...(href ? { target: "_blank", rel: "noreferrer" } : {})}
                className="subtitle1 md:caption flex w-full cursor-pointer items-center justify-between rounded-2xl bg-osmoverse-700 px-4 py-4 transition-colors duration-200 hover:bg-osmoverse-700/50 md:bg-transparent md:px-2 md:py-2"
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
            )}
          </ExternalUrlOption>
        );
      })}
      {/* These open third-party sites; the links are tied to a specific
          bridge/variant, not the route selected here, so the user confirms the
          actual route on the provider's site. */}
      <p className="caption pt-2 text-center text-osmoverse-400">
        {t("transfer.moreBridgeOptions.externalSiteCaveat")}
      </p>
    </>
  );
}

/**
 * Renders one external-URL bridge option. When the option carries a
 * `convertToVariant` (an alloy withdrawal whose third-party site only
 * recognises a specific variant), it routes the click through the pre-convert
 * flow; otherwise it opens the URL directly. Both the single-provider splash
 * and the multi-provider list use this so the convert path is never bypassed.
 */
const ExternalUrlOption: FunctionComponent<{
  externalUrl: ExternalUrl;
  direction: "deposit" | "withdraw";
  withdrawAlloyMinimalDenom?: string;
  children: (props: { href?: string; onClick?: () => void }) => React.ReactNode;
}> = ({ externalUrl, direction, withdrawAlloyMinimalDenom, children }) => {
  const { url, urlProviderName, convertToVariant } = externalUrl;

  // Pre-convert only applies to an alloy withdrawal whose site needs a variant.
  // ExternalUrlConvertOption decides per-balance whether to actually intercept
  // the click (convert) or fall through to opening the URL.
  if (
    direction === "withdraw" &&
    withdrawAlloyMinimalDenom &&
    convertToVariant
  ) {
    return (
      <ExternalUrlConvertOption
        url={url}
        providerName={urlProviderName}
        alloyMinimalDenom={withdrawAlloyMinimalDenom}
        convertToVariant={convertToVariant}
      >
        {children}
      </ExternalUrlConvertOption>
    );
  }

  // No convert needed: render as a real link so middle-click / open-in-new-tab
  // keep working.
  return <>{children({ href: url.toString() })}</>;
};

/** Inline provider list for assets that only support external transfers (e.g. NAM). */
export const ExternalOnlyProviderList: FunctionComponent<
  MoreBridgeOptionsProps & { assetDenom: string }
> = ({ assetDenom, direction, ...rest }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex animate-[fadeIn_0.25s] gap-3 rounded-[20px] border-2 border-osmoverse-500 p-5 py-3">
        <Icon
          id="alert-triangle"
          className="h-6 w-6 shrink-0 text-osmoverse-400"
        />
        <div className="flex flex-col">
          <h1 className="body2">
            {t("transfer.noNativeTransfers", { asset: assetDenom })}
          </h1>
          <p className="body2 text-osmoverse-300">
            {t("transfer.noNativeTransfersDescription", { asset: assetDenom })}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <ExternalProviderList direction={direction} {...rest} />
      </div>
      <div className="caption py-1 text-center text-osmoverse-400">
        {t("transfer.risks")}{" "}
        <Link
          href="/disclaimer#providers-and-bridge-disclaimer"
          target="_blank"
          className="mx-auto text-xs font-semibold text-wosmongton-300 hover:text-rust-200"
        >
          {t("transfer.learnMore")}
        </Link>
      </div>
    </div>
  );
};

export const MoreBridgeOptionsModal: FunctionComponent<
  MoreBridgeOptionsProps & ModalBaseProps
> = ({
  direction,
  fromAsset,
  toAsset,
  fromChain,
  toChain,
  toAddress,
  bridges,
  ...modalProps
}) => {
  const { t } = useTranslation();

  const denom = fromAsset?.denom ?? "";

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
      {/* Route-neutral copy: these external providers are third-party sites and
          their links are tied to a specific bridge/variant, not to the from/to
          chain the user selected here. Stating a "from {x} to {y}" route would
          overpromise — the user picks the actual route on the provider's site.
          (`fromChain`/`toChain` retained in props for the underlying query.) */}
      <p className="body1 md:body2 py-4 text-center text-osmoverse-300 md:py-2">
        {t(
          direction === "deposit"
            ? "transfer.moreBridgeOptions.depositDescriptionUnknown"
            : "transfer.moreBridgeOptions.withdrawDescriptionUnknown",
          { denom }
        )}
      </p>
      <div className="flex flex-col gap-1 pt-4 md:gap-0 md:pt-2">
        <ExternalProviderList
          direction={direction}
          fromAsset={fromAsset}
          toAsset={toAsset}
          fromChain={fromChain}
          toChain={toChain}
          toAddress={toAddress}
          bridges={bridges}
        />
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
