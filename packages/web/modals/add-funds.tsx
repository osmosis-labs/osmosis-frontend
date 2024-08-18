import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { MinimalAsset } from "@osmosis-labs/types";
import classNames from "classnames";
import Image from "next/image";
import { parseAsString, useQueryStates } from "nuqs";
import { useCallback } from "react";

import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";
import { useBridgeStore } from "~/hooks/bridge";
import { ModalBase } from "~/modals/base";

interface AddFundsModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  from?: "buy" | "swap";
  fromAsset?:
    | (MinimalAsset &
        Partial<{
          amount: CoinPretty;
          usdValue: PricePretty;
        }>)
    | undefined;
  setFromAssetDenom?: (value: string) => void;
  setToAssetDenom?: (value: string) => void;
  standalone?: boolean;
}

export function AddFundsModal({
  isOpen,
  onRequestClose,
  from,
  fromAsset,
  setFromAssetDenom: _setFromAssetDenom,
  setToAssetDenom: _setToAssetDenom,
  standalone,
}: AddFundsModalProps) {
  const { t } = useTranslation();
  const bridgeAsset = useBridgeStore((state) => state.bridgeAsset);

  const [, set] = useQueryStates({
    tab: parseAsString,
    to: parseAsString,
    from: parseAsString,
  });

  const setFromAssetDenom = useCallback(
    (value: string) =>
      _setFromAssetDenom ? _setFromAssetDenom(value) : set({ from: value }),
    [_setFromAssetDenom, set]
  );

  const setToAssetDenom = useCallback(
    (value: string) =>
      _setToAssetDenom ? _setToAssetDenom(value) : set({ to: value }),
    [_setToAssetDenom, set]
  );

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      hideCloseButton
      className="w-[512px] rounded-5xl !p-0"
    >
      <div className="flex h-auto w-full flex-col bg-osmoverse-850 pb-8">
        <div className="relative flex h-20 items-center justify-center p-4">
          <h6>{t("limitOrders.addFunds")}</h6>
          <button
            onClick={onRequestClose}
            className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-800"
          >
            <Icon id="thin-x" className="text-wosmongton-200" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center pb-3 text-center">
          {from === "buy" ? (
            <span className="flex w-[448px] flex-wrap justify-center gap-1 text-osmoverse-300">
              <span>{t("limitOrders.youNeed")}</span> <StableCoinsInfoTooltip />{" "}
              <span>{t("limitOrders.fundsOsmosisToBuyAssets")}</span>
              <span>{t("limitOrders.chooseAnOption")}</span>
            </span>
          ) : (
            <span className="flex w-[448px] flex-wrap justify-center gap-1 text-osmoverse-300">
              {t("limitOrders.errors.noAssetAvailable", {
                coinName: fromAsset?.coinName ?? "",
              })}
            </span>
          )}
        </div>
        <div className="flex flex-col py-3 px-4">
          {from === "buy" ? (
            <button
              type="button"
              onClick={() => {
                bridgeAsset({ anyDenom: "USDC", direction: "deposit" });
                onRequestClose();
              }}
              className="flex items-center gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-osmoverse-900"
            >
              <Image
                src="/tokens/generated/usdc.svg"
                width={48}
                height={48}
                alt="USDC logo"
              />
              <div className="flex w-full flex-col gap-1">
                <span className="subtitle1">{t("transfer.deposit")} USDC</span>
                <span className="body2 text-osmoverse-300">
                  {t("limitOrders.transferFromAnotherNetwork")}
                </span>
              </div>
              <div className="flex h-6 w-6 items-center justify-center">
                <Icon
                  id="chevron-right"
                  width={10}
                  height={17}
                  className="text-wosmongton-200"
                />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                bridgeAsset({
                  anyDenom: fromAsset?.coinDenom ?? "ATOM",
                  direction: "deposit",
                });
                onRequestClose();
              }}
              className="flex items-center gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-osmoverse-900"
            >
              <div className="flex h-12 min-w-[48px] items-center justify-center">
                <Icon
                  id="deposit"
                  width={32}
                  height={32}
                  className="text-wosmongton-200"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <span className="subtitle1">
                  {t("transfer.deposit")} {fromAsset?.coinName}
                </span>
                <span className="body2 text-osmoverse-300">
                  {t("limitOrders.transferFromAnotherNetwork")}
                </span>
              </div>
              <div className="flex h-6 w-6 items-center justify-center">
                <Icon
                  id="chevron-right"
                  width={10}
                  height={17}
                  className="text-wosmongton-200"
                />
              </div>
            </button>
          )}
          {from === "buy" ? (
            <button
              type="button"
              onClick={() => {
                bridgeAsset({ anyDenom: "USDT", direction: "deposit" });
                onRequestClose();
              }}
              className="flex items-center gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-osmoverse-900"
            >
              <Image
                src="https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.svg"
                width={48}
                height={48}
                alt="USDT logo"
              />
              <div className="flex w-full flex-col gap-1">
                <span className="subtitle1">{t("transfer.deposit")} USDT</span>
                <span className="body2 text-osmoverse-300">
                  {t("limitOrders.transferFromAnotherNetwork")}
                </span>
              </div>
              <div className="flex h-6 w-6 items-center justify-center">
                <Icon
                  id="chevron-right"
                  width={10}
                  height={17}
                  className="text-wosmongton-200"
                />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                set({ tab: "swap" });
                setFromAssetDenom?.("USDC");
                setToAssetDenom?.(fromAsset?.coinDenom ?? "ATOM");
                onRequestClose();
              }}
              className="flex items-center gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-osmoverse-900"
            >
              <Image
                src={fromAsset?.coinImageUrl ?? ""}
                width={48}
                height={48}
                alt={classNames(`${fromAsset?.coinDenom} logo`)}
              />
              <div className="flex w-full flex-col gap-1">
                <span className="subtitle1">
                  {t("limitOrders.buy")} {fromAsset?.coinDenom}
                </span>
                <span className="body2 text-osmoverse-300">
                  {t("limitOrders.buyWith", { coinA: "USDC", coinB: "USDT" })}
                </span>
              </div>
              <div className="flex h-6 w-6 items-center justify-center">
                <Icon
                  id="chevron-right"
                  width={10}
                  height={17}
                  className="text-wosmongton-200"
                />
              </div>
            </button>
          )}
          {from === "buy" ? (
            <button
              type="button"
              onClick={() => {
                if (!standalone) set({ tab: "swap" });
                setFromAssetDenom?.("OSMO");
                setToAssetDenom?.("USDC");
                onRequestClose();
              }}
              className="flex items-center gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-osmoverse-900"
            >
              <div className="flex h-12 min-w-[48px] items-center justify-center">
                <Icon
                  id="exchange"
                  width={32}
                  height={32}
                  className="h-8 w-8 text-wosmongton-400"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <span className="subtitle1">
                  {t("limitOrders.sellAnAsset")}
                </span>
                <span className="body2 text-osmoverse-300">
                  {t("limitOrders.tradeAnotherAssetOr", {
                    coinA: "USDC",
                    coinB: "USDT",
                  })}
                </span>
              </div>
              <div className="flex h-6 w-6 items-center justify-center">
                <Icon
                  id="chevron-right"
                  width={10}
                  height={17}
                  className="text-wosmongton-200"
                />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!standalone) set({ tab: "swap" });
                setFromAssetDenom?.("");
                setToAssetDenom?.(fromAsset?.coinDenom ?? "");
                onRequestClose();
              }}
              className="flex items-center gap-4 rounded-2xl p-4 text-left transition-colors hover:bg-osmoverse-900"
            >
              <div className="flex h-12 min-w-[48px] items-center justify-center">
                <Icon
                  id="exchange"
                  width={32}
                  height={32}
                  className="h-8 w-8 text-wosmongton-400"
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <span className="subtitle1">
                  {t("limitOrders.swapAnAsset")}
                </span>
                <span className="body2 text-osmoverse-300">
                  {t("limitOrders.tradeAnotherAsset", {
                    coinDenom: fromAsset?.coinDenom ?? "",
                  })}
                </span>
              </div>
              <div className="flex h-6 w-6 items-center justify-center">
                <Icon
                  id="chevron-right"
                  width={10}
                  height={17}
                  className="text-wosmongton-200"
                />
              </div>
            </button>
          )}
        </div>
        <div className="flex w-full px-8 pt-3">
          <button
            type="button"
            onClick={onRequestClose}
            className="flex h-14 w-full items-center justify-center rounded-2xl py-4 transition-colors hover:bg-osmoverse-900"
          >
            <h6 className="text-wosmongton-200">{t("limitOrders.cancel")}</h6>
          </button>
        </div>
      </div>
    </ModalBase>
  );
}

function StableCoinsInfoTooltip() {
  const { t } = useTranslation();

  return (
    <Tooltip
      rootClassNames="!p-0 w-[280px] !border-0 !rounded-none !bg-transparent"
      content={
        <div className="relative flex items-start gap-3 rounded-xl border border-[#39383D] bg-osmoverse-1000 p-3">
          <Icon
            id="info"
            width={16}
            height={16}
            className="h-4 min-w-[16px] text-osmoverse-500"
          />
          <div className="flex flex-col gap-1">
            <span className="caption">
              {t("limitOrders.whatIsAStablecoin.title")}
            </span>
            <span className="caption text-osmoverse-300">
              {t("limitOrders.whatIsAStablecoin.description")}
            </span>
          </div>
          <svg
            width="254"
            height="7"
            viewBox="0 0 254 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -bottom-[7px]"
          >
            <g clipPath="url(#clip0_5247_12139)">
              <path
                d="M127 -7.14258L134.071 -0.0715104L129.121 4.87824C127.95 6.04981 126.05 6.04981 124.879 4.87824L119.929 -0.0715104L127 -7.14258Z"
                fill="#090524"
              />
              <path
                d="M127.354 -7.49613L127 -7.84968L126.646 -7.49613L119.575 -0.425064L119.222 -0.0715104L119.575 0.282043L124.525 5.23179C125.892 6.59862 128.108 6.59862 129.475 5.23179L134.425 0.282043L134.778 -0.0715104L134.425 -0.425064L127.354 -7.49613Z"
                stroke="#E4E1FB"
                strokeOpacity="0.2"
              />
            </g>
            <defs>
              <clipPath id="clip0_5247_12139">
                <rect width="254" height="7" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
      }
      className="underline decoration-dotted underline-offset-4"
    >
      <>{t("limitOrders.stablecoin")}</>
    </Tooltip>
  );
}
