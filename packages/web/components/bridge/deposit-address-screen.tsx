import { MinimalAsset } from "@osmosis-labs/types";
import { shorten } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FunctionComponent, ReactNode, useState } from "react";

import { Icon } from "~/components/assets";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { useScreenManager } from "~/components/screen-manager";
import { Tooltip } from "~/components/tooltip";
import { IconButton } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { BridgeScreen } from "~/hooks/bridge";
import { useClipboard } from "~/hooks/use-clipboard";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";

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
  fromChain: BridgeChainWithDisplayInfo;
}

export const DepositAddressScreen = observer(
  ({
    direction,
    canonicalAsset,
    chainSelection,
    fromChain,
  }: DepositAddressScreenProps) => {
    const { setCurrentScreen } = useScreenManager();
    const { t } = useTranslation();
    const [showQrCode, setShowQrCode] = useState(false);

    const { hasCopied, onCopy } = useClipboard("test", 3000);

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

        {showQrCode ? (
          <div className="z-20 flex w-full items-center gap-4 rounded-2xl bg-osmoverse-100 p-4">
            <div className="flex h-[180px] w-[180px] items-center justify-center">
              <QRCode
                value="test"
                size={220}
                logoUrl={canonicalAsset.coinImageUrl}
              />
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
                  onClick={() => setShowQrCode(true)}
                />
              </Tooltip>

              <div className="flex flex-col">
                <p className="subtitle1 text-white-full">
                  {t("transfer.yourDepositAddress", {
                    denom: canonicalAsset.coinDenom,
                  })}
                </p>
                <p className="text-osmoverse-300">
                  {shorten("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", {
                    prefixLength: 9,
                    suffixLength: 5,
                  })}
                </p>
              </div>
            </div>
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
                onClick={onCopy}
              />
            </Tooltip>
          </div>
        )}

        <div className="z-10 -mt-2 flex w-full items-center gap-4 rounded-b-2xl bg-osmoverse-1000 px-4 pb-4 pt-6">
          <Icon
            id="alert-triangle"
            width={24}
            height={24}
            className="flex-shrink-0 self-start text-rust-400"
          />
          <p className="body2 text-osmoverse-200">
            {t("transfer.receiveOnlyAsset", {
              denom: canonicalAsset.coinDenom,
              network: fromChain.prettyName,
            })}
          </p>
        </div>

        <DepositInfoRow label={<span>{t("transfer.receiveAsset")}</span>}>
          <p className="text-osmoverse-100">{canonicalAsset.coinDenom}</p>
        </DepositInfoRow>
        <DepositInfoRow label={<span>{t("transfer.minimumDeposit")}</span>}>
          <p className="text-right text-osmoverse-100">
            0.0001207 BTC ($10.00)
          </p>
        </DepositInfoRow>
        <DepositInfoRow
          label={
            true ? (
              <div className="flex items-center gap-2">
                <Spinner className="text-wosmongton-500" />{" "}
                <span>{t("transfer.estimatingTime")}</span>
              </div>
            ) : (
              <span>{t("transfer.estimatedTime")}</span>
            )
          }
        >
          <p className="text-osmoverse-100">
            {true ? (
              <span className="text-osmoverse-300">
                {t("transfer.calculatingFees")}
              </span>
            ) : (
              "test"
            )}
          </p>
        </DepositInfoRow>
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
      <p>{label}</p>
      {children}
    </div>
  );
};
