import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { DecUtils } from "@keplr-wallet/unit";
import { Bridge, BridgeAsset } from "@osmosis-labs/bridge";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNil, shorten } from "@osmosis-labs/utils";
import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FunctionComponent, ReactNode, useState } from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { QuoteDetailRow } from "~/components/bridge/quote-detail";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { NomicPendingTransfers } from "~/components/nomic/nomic-pending-transfers";
import { useScreenManager } from "~/components/screen-manager";
import { Tooltip } from "~/components/tooltip";
import { Button, IconButton } from "~/components/ui/button";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { BridgeScreen } from "~/hooks/bridge";
import { useClipboard } from "~/hooks/use-clipboard";
import { useHumanizedRemainingTime } from "~/hooks/use-humanized-remaining-time";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api, RouterOutputs } from "~/utils/trpc";

import { EventName } from "../../config/analytics-events";

const QRCode = dynamic(
  () => import("~/components/qrcode").then((module) => module.QRCode),
  {
    loading: () => <Spinner className="text-black" />,
  }
);

interface DepositAddressScreenProps {
  direction: "deposit" | "withdraw";
  canonicalAsset: MinimalAsset;
  chainSelection: React.ReactNode;
  assetDropdown: React.ReactNode;
  fromChain: BridgeChainWithDisplayInfo;
  toChain: BridgeChainWithDisplayInfo;
  fromAsset: BridgeAsset;
  toAsset: BridgeAsset;
  bridge: Bridge;
}

export const DepositAddressScreen = observer(
  ({
    direction,
    canonicalAsset,
    chainSelection,
    assetDropdown,
    fromChain,
    bridge,
    toChain,
    fromAsset,
    toAsset,
  }: DepositAddressScreenProps) => {
    const { accountStore } = useStore();
    const { logEvent } = useAmplitudeAnalytics();

    const osmosisAddress = accountStore.getWallet(
      accountStore.osmosisChainId
    )?.address;

    const { setCurrentScreen } = useScreenManager();
    const { t } = useTranslation();
    const [showQrCode, setShowQrCode] = useState(false);

    const { data, isLoading, refetch, remove } =
      api.bridgeTransfer.getDepositAddress.useQuery(
        {
          bridge,
          fromChain,
          toChain,
          fromAsset,
          toAsset,
          toAddress: osmosisAddress!,
        },
        {
          enabled: !!osmosisAddress,
          refetchOnWindowFocus: false,
          useErrorBoundary: true,
          cacheTime: 0,
          staleTime: 0,
        }
      );

    const { hasCopied, onCopy } = useClipboard(
      data?.depositData?.depositAddress ?? "",
      3000
    );

    const expirationTimeDayjs = data?.depositData?.expirationTimeMs
      ? dayjs(data.depositData.expirationTimeMs)
      : undefined;

    const isExpired = expirationTimeDayjs?.isBefore(dayjs());
    const willExpireIn4Hours = expirationTimeDayjs?.isBefore(
      dayjs().add(4, "hour")
    );

    return (
      <div className="relative flex w-full flex-col items-center justify-center p-4 text-osmoverse-200 md:py-2 md:px-0">
        <div className="mb-8 flex flex-col gap-3">
          <div className="flex w-full items-center justify-center gap-3 text-body1 font-body1">
            {!canonicalAsset ? (
              <SkeletonLoader className="h-8 w-full max-w-sm md:h-4" />
            ) : (
              <>
                <span>
                  {direction === "deposit"
                    ? t("transfer.deposit")
                    : t("transfer.withdraw")}
                </span>{" "}
                <button
                  className="flex items-center gap-3"
                  onClick={() => setCurrentScreen(BridgeScreen.Asset)}
                >
                  <Image
                    width={32}
                    height={32}
                    src={canonicalAsset.coinImageUrl ?? "/"}
                    alt="token image"
                  />{" "}
                  <span>
                    {canonicalAsset.coinName} ({canonicalAsset.coinDenom})
                  </span>
                </button>
              </>
            )}
          </div>

          <p className="text-center text-h5 font-h5 text-white-full md:text-h6 md:font-h6">
            {t("transfer.sendFromWalletOrExchange")}
          </p>
        </div>

        {chainSelection}

        <div
          className={classNames(
            "relative flex w-full flex-col",
            isExpired &&
              "after:absolute after:inset-0 after:z-30 after:cursor-not-allowed after:rounded-2xl after:bg-osmoverse-1000/40"
          )}
        >
          {showQrCode ? (
            <div className="z-20 flex w-full items-center gap-4 rounded-2xl bg-osmoverse-100 p-4">
              <div className="flex h-[180px] w-[180px] items-center justify-center">
                {isLoading || !data?.depositData?.depositAddress ? (
                  <Spinner className="text-black" />
                ) : (
                  <QRCode
                    value={data?.depositData?.depositAddress}
                    size={220}
                    logoUrl={canonicalAsset.coinImageUrl}
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col items-center gap-3">
                <Icon
                  id="scan-line"
                  className="text-osmoverse-400"
                  width={32}
                  height={32}
                />
                <p className="subtitle1 text-osmoverse-1000">
                  {t("transfer.scanWithMobileWallet")}
                </p>
                <p className="body2 text-osmoverse-600">{t("transfer.or")}</p>
                <button
                  disabled={isLoading || isExpired}
                  onClick={onCopy}
                  className="subtitle1 text-wosmongton-700 hover:text-wosmongton-800"
                >
                  {hasCopied
                    ? t("transfer.copied")
                    : t("transfer.copyToClipboard")}
                </button>
              </div>
            </div>
          ) : (
            <div className="z-20 flex w-full items-center justify-between rounded-2xl bg-osmoverse-850 p-4">
              <div className="flex flex-col">
                <p className="subtitle1 text-white-full">
                  {t("transfer.yourDepositAddress", {
                    denom: canonicalAsset.coinDenom,
                  })}
                </p>
                {!isExpired && (
                  <SkeletonLoader
                    isLoaded={!!data?.depositData?.depositAddress}
                    className={
                      !data?.depositData?.depositAddress
                        ? "h-5 w-32"
                        : undefined
                    }
                  >
                    <p
                      className={
                        willExpireIn4Hours
                          ? "text-rust-400"
                          : "text-osmoverse-300"
                      }
                    >
                      {shorten(data?.depositData?.depositAddress ?? "", {
                        prefixLength: 9,
                        suffixLength: 5,
                      })}
                    </p>
                  </SkeletonLoader>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Tooltip content={t("transfer.showQrCode")}>
                  <IconButton
                    icon={
                      <Icon
                        id="qr"
                        className="transition-color text-osmoverse-400 duration-200 group-hover:text-white-full"
                      />
                    }
                    className="group flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800 hover:!bg-osmoverse-700 active:!bg-osmoverse-800"
                    aria-label={t("transfer.showQrCode")}
                    onClick={() => {
                      logEvent([EventName.DepositWithdraw.qrOpened]);
                      setShowQrCode(true);
                    }}
                    disabled={isLoading || isExpired}
                  />
                </Tooltip>
                <Tooltip
                  content={
                    hasCopied
                      ? t("transfer.copied")
                      : t("transfer.copyAddressToClipboard")
                  }
                >
                  <IconButton
                    icon={
                      <Icon
                        id={hasCopied ? "check-mark-slim" : "copy"}
                        className={
                          hasCopied
                            ? "text-white-full"
                            : "transition-color text-osmoverse-400 duration-200 group-hover:text-white-full"
                        }
                      />
                    }
                    className="group flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800 hover:!bg-osmoverse-700 active:!bg-osmoverse-800"
                    aria-label={t("transfer.copyAddress")}
                    onClick={() => {
                      logEvent([EventName.DepositWithdraw.addressCopied]);
                      onCopy();
                    }}
                    disabled={isLoading || isExpired}
                  />
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        <div className="z-10 -mt-2 flex w-full items-center gap-4 rounded-b-2xl bg-osmoverse-1000 px-4 pb-4 pt-6">
          <Icon
            id="alert-triangle"
            width={24}
            height={24}
            className="flex-shrink-0 self-start text-rust-400"
          />
          <div className="flex flex-col gap-6">
            <p className="body2 text-wosmongton-300">
              This address expires in{" "}
              <SkeletonLoader
                isLoaded={!isLoading}
                className={isLoading ? "inline h-[20px] w-[50.7px]" : "inline"}
              >
                {!!expirationTimeDayjs ? (
                  <RemainingTime unix={expirationTimeDayjs.unix()} />
                ) : (
                  ""
                )}
              </SkeletonLoader>
            </p>
            {isExpired ? (
              <p className="body2 text-osmoverse-200">
                <span className="font-bold">
                  {t("transfer.doNotSendFundsToThisAddress")}
                </span>{" "}
                {t("transfer.addressExpired")}
              </p>
            ) : willExpireIn4Hours ? (
              <p className="body2 text-osmoverse-200">
                {t("transfer.addressAboutToExpire")}
              </p>
            ) : (
              <p className="body2 text-o smoverse-200">
                {t("transfer.receiveOnlyAsset", {
                  denom: canonicalAsset.coinDenom,
                  network: fromChain.prettyName,
                })}
              </p>
            )}
          </div>
        </div>

        {isExpired || willExpireIn4Hours ? (
          <div className="flex w-full flex-col py-3">
            <Button
              className="md:body1 text-h6 font-h6"
              onClick={() => {
                remove();
                refetch();
              }}
            >
              {t("transfer.createNewDepositAddress")}
            </Button>
          </div>
        ) : (
          <>
            <div className="w-full pb-2 pt-4">{assetDropdown}</div>
            <DepositInfoRow label={<span>{t("transfer.minimumDeposit")}</span>}>
              <SkeletonLoader
                isLoaded={!!data?.depositData}
                className={!data?.depositData ? "h-5 w-24" : undefined}
              >
                <p className="text-right text-white-full">
                  {data?.depositData?.minimumDeposit.amount.toString()}{" "}
                  {data?.depositData?.minimumDeposit.fiatValue ? (
                    <>
                      ({data.depositData.minimumDeposit.fiatValue.toString()})
                    </>
                  ) : null}
                </p>
              </SkeletonLoader>
            </DepositInfoRow>
            <TransferDetails
              isLoading={isLoading}
              depositData={data?.depositData}
              fromChain={fromChain}
            />
          </>
        )}

        <div className="mb-3 mt-6 h-[1px] w-full border border-osmoverse-800" />

        {bridge === "Nomic" && (
          <NomicPendingTransfers fromChain={fromChain} toChain={toChain} />
        )}
      </div>
    );
  }
);

const DepositInfoRow: FunctionComponent<{
  label: ReactNode;
  children: ReactNode;
}> = ({ label, children }) => {
  return (
    <div className="body1 md:body2 flex w-full items-center justify-between gap-2 py-3">
      <p className="text-osmoverse-300">{label}</p>
      {children}
    </div>
  );
};

const TransferDetails: FunctionComponent<{
  isLoading: boolean;
  depositData:
    | RouterOutputs["bridgeTransfer"]["getDepositAddress"]["depositData"]
    | undefined;
  fromChain: BridgeChainWithDisplayInfo;
}> = ({ isLoading, depositData, fromChain }) => {
  const [detailsRef, { height: detailsHeight, y: detailsOffset }] =
    useMeasure<HTMLDivElement>();
  const { t } = useTranslation();

  const totalFees = depositData?.networkFee.fiatValue;
  const showTotalFeeIneqSymbol = totalFees
    ? totalFees
        .toDec()
        .lt(DecUtils.getTenExponentN(totalFees.fiatCurrency.maxDecimals))
    : false;

  return (
    <Disclosure>
      {({ open }) => (
        <div
          className="flex w-full flex-col gap-3 overflow-clip py-3 transition-height duration-300 ease-inOutBack"
          style={{
            height: open
              ? (detailsHeight + detailsOffset ?? 288) + 46 // collapsed height
              : 36,
          }}
        >
          <DisclosureButton>
            <div className="flex animate-[fadeIn_0.25s] items-center justify-between">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Spinner className="text-wosmongton-500" />
                  <p className="body1 md:body2 text-osmoverse-100">
                    {t("transfer.estimatingTime")}
                  </p>
                </div>
              ) : open ? (
                <p className="subtitle1 text-osmoverse-300">
                  {t("transfer.transferDetails")}
                </p>
              ) : null}

              {!isLoading && depositData?.estimatedTime && !open && (
                <div className="flex items-center gap-1">
                  <Icon id="stopwatch" className="h-4 w-4 text-osmoverse-400" />
                  <p className="body1 md:body2 text-osmoverse-300 first-letter:capitalize">
                    {t(depositData?.estimatedTime)}
                  </p>
                </div>
              )}

              {isLoading ? (
                <span className="body1 md:body2 text-osmoverse-300">
                  {t("transfer.calculatingFees")}
                </span>
              ) : null}

              {!isLoading ? (
                <div className="flex items-center gap-2 md:gap-1">
                  <div className="flex items-center gap-2 md:gap-1">
                    {!open && totalFees && (
                      <span className="subtitle1 md:body2 text-white-full">
                        {!showTotalFeeIneqSymbol && "~"}{" "}
                        {totalFees
                          .inequalitySymbol(showTotalFeeIneqSymbol)
                          .toString()}
                        {" + "}
                        {depositData.providerFee.toString()}{" "}
                        {t("transfer.fees")}
                      </span>
                    )}

                    <Icon
                      id="chevron-down"
                      width={16}
                      height={16}
                      className={classNames(
                        "text-osmoverse-300 transition-transform duration-150",
                        {
                          "rotate-180": open,
                        }
                      )}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </DisclosureButton>
          <DisclosurePanel ref={detailsRef} className="flex flex-col gap-3">
            {!!depositData && (
              <>
                <EstimatedTimeRow
                  depositData={depositData}
                  isRefetchingQuote={isLoading}
                />
                <ProviderFeesRow
                  depositData={depositData}
                  isRefetchingQuote={isLoading}
                />
                <NetworkFeeRow
                  depositData={depositData}
                  isRefetchingQuote={isLoading}
                  fromChainName={fromChain.prettyName}
                />
              </>
            )}
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  );
};

const EstimatedTimeRow: FunctionComponent<{
  depositData: RouterOutputs["bridgeTransfer"]["getDepositAddress"]["depositData"];
  isRefetchingQuote: boolean;
}> = ({ depositData, isRefetchingQuote }) => {
  const { t } = useTranslation();

  return (
    <QuoteDetailRow
      label={t("transfer.estimatedTime")}
      isLoading={isRefetchingQuote}
    >
      <div className="flex items-center gap-1">
        <Icon id="stopwatch" className="h-4 w-4 text-osmoverse-400" />{" "}
        <p className="text-osmoverse-100 first-letter:capitalize">
          {t(depositData.estimatedTime)}
        </p>
      </div>
    </QuoteDetailRow>
  );
};

const ProviderFeesRow: FunctionComponent<{
  depositData: RouterOutputs["bridgeTransfer"]["getDepositAddress"]["depositData"];
  isRefetchingQuote: boolean;
}> = ({ depositData, isRefetchingQuote }) => {
  const { t } = useTranslation();
  return (
    <QuoteDetailRow
      label={t("transfer.providerFees")}
      isLoading={isRefetchingQuote}
    >
      <p className="text-osmoverse-100">{depositData.providerFee.toString()}</p>
    </QuoteDetailRow>
  );
};

const NetworkFeeRow: FunctionComponent<{
  depositData: RouterOutputs["bridgeTransfer"]["getDepositAddress"]["depositData"];
  isRefetchingQuote: boolean;
  fromChainName?: string;
}> = ({ depositData, isRefetchingQuote, fromChainName }) => {
  const { t } = useTranslation();
  return (
    <QuoteDetailRow
      label={t("transfer.networkFee", {
        networkName: fromChainName ?? "",
      })}
      isLoading={isRefetchingQuote}
    >
      <p className="text-osmoverse-100">
        {isNil(depositData.networkFee.fiatValue) &&
        isNil(depositData.networkFee.amount) ? (
          <Tooltip
            content={t("transfer.unknownFeeTooltip", {
              networkName: fromChainName ?? "",
            })}
          >
            <div className="flex items-center gap-2">
              <Icon id="help-circle" className="h-4 w-4 text-osmoverse-400" />
              <p className="text-osmoverse-300">{t("transfer.unknown")}</p>
            </div>
          </Tooltip>
        ) : (
          <>
            {depositData.networkFee.fiatValue
              ? depositData.networkFee.fiatValue.toString()
              : depositData.networkFee.amount.toString()}
            {depositData.networkFee.fiatValue &&
            depositData.networkFee.amount ? (
              <span
                title={depositData.networkFee.amount.toString()}
                className="text-osmoverse-300"
              >
                {" "}
                (
                {trimPlaceholderZeros(
                  depositData.networkFee.amount.hideDenom(true).toString()
                )}{" "}
                <span>
                  {shorten(depositData.networkFee.amount.denom, {
                    prefixLength: 8,
                    suffixLength: 3,
                  })}
                </span>
                )
              </span>
            ) : (
              ""
            )}
          </>
        )}
      </p>
    </QuoteDetailRow>
  );
};

const RemainingTime = ({ unix }: { unix: number }) => {
  const { t } = useTranslation();
  const { humanizedRemainingTime } = useHumanizedRemainingTime({ unix });

  if (!humanizedRemainingTime) return null;

  return (
    <span className="text-inherit">
      {humanizedRemainingTime?.value}{" "}
      {t(humanizedRemainingTime?.unitTranslationKey)}
    </span>
  );
};
