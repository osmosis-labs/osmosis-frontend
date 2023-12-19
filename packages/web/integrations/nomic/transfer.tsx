import { Network, validate } from "bitcoin-address-validation";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  DepositInfo,
  DepositSuccess,
  deriveNomicAddress,
  generateDepositAddress,
  getPendingDeposits,
} from "nomic-bitcoin";
import { useEffect, useState } from "react";
import { FunctionComponent } from "react";

import { displayToast, ToastType } from "~/components/alert";
import { BridgeAnimation } from "~/components/animation";
import { GradientView } from "~/components/assets/gradient-view";
import { Button } from "~/components/buttons";
import { InputBox } from "~/components/input";
import SkeletonLoader from "~/components/skeleton-loader";
import { IS_TESTNET } from "~/config";
import { useAmountConfig, useFakeFeeConfig } from "~/hooks";
import { useTranslation } from "~/hooks/language";
import { SourceChain } from "~/integrations/bridge-info";
import { BridgeIntegrationProps } from "~/modals";
import { useStore } from "~/stores";
import { IBCBalance } from "~/stores/assets";

const MIN_WITHDRAW_AMOUNT = 1000; //sats

export const displayBtc = (num: number): string => {
  const multiplier = Math.pow(10, 8);
  const res = Math.floor((Number(num) / 1e8) * multiplier) / multiplier;
  let resStr = Number(res).toFixed(8).toLocaleString();
  return resStr.replace(/\.?0+$/, "") + " BTC";
};

type BridgeInfo = Omit<DepositSuccess, "code" | "reason"> & {
  minimumDeposit: number;
};

/** Nomic-specific bridge transfer integration UI. */
const NomicTransfer: FunctionComponent<
  {
    isWithdraw: boolean;
    balanceOnOsmosis: IBCBalance;
    selectedSourceChainKey: SourceChain;
    onRequestClose: () => void;
    onRequestSwitchWallet: () => void;
    isTestNet?: boolean;
  } & BridgeIntegrationProps
> = observer(
  ({
    isWithdraw,
    balanceOnOsmosis,
    selectedSourceChainKey,
    connectCosmosWalletButtonOverride,
  }) => {
    const { chainStore, accountStore, queriesExternalStore, queriesStore } =
      useStore();
    const { t } = useTranslation();

    const { chainId } = chainStore.osmosis;
    const osmosisAccount = accountStore.getWallet(chainId);
    const address = osmosisAccount?.address ?? "";
    const osmoIcnsName =
      queriesExternalStore.queryICNSNames.getQueryContract(address).primaryName;

    const osmosisPath = {
      address: osmoIcnsName === "" ? address : osmoIcnsName,
      networkName: chainStore.osmosis.chainName,
      iconUrl: `${process.env.NEXT_PUBLIC_BASEPATH}/tokens/osmo.svg`,
      source: "account" as const,
    };
    const bitcoinPath = {
      address: "",
      networkName: selectedSourceChainKey,
      iconUrl: `${process.env.NEXT_PUBLIC_BASEPATH}/tokens/nbtc.svg`,
      source: "counterpartyAccount" as const,
    };
    let [from, to] = [
      isWithdraw ? osmosisPath : bitcoinPath,
      isWithdraw ? bitcoinPath : osmosisPath,
    ];

    let isMobile = false;

    const availableBalance = balanceOnOsmosis.balance;

    const [isInputFocused, setIsInputFocused] = useState(false);
    const [hasProceeded, setHasProceeded] = useState(isWithdraw);

    const [isLoadingDepositAddress, setIsLoadingDepositAddress] =
      useState(false);
    const [reachedCapacityLimit, setReachedCapacityLimit] = useState<
      boolean | undefined
    >(undefined);
    const [pendingDepositAmount, setPendingDepositAmount] = useState<
      number | undefined
    >(undefined);

    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawAddress, setWithdrawAddress] = useState("");

    const [bridgeInfo, setBridgeInfo] = useState<BridgeInfo | undefined>(
      undefined
    );

    const nomicChainId = IS_TESTNET ? "nomic-testnet-4d" : "nomic-stakenet-3";

    useEffect(() => {
      if (!osmosisAccount || !osmosisAccount.address) return;
      const relayers = IS_TESTNET
        ? ["https://testnet-relayer.nomic.io:8443"]
        : ["https://relayer.nomic.mappum.io:8443"];
      setIsLoadingDepositAddress(true);
      generateDepositAddress({
        relayers,
        channel: balanceOnOsmosis.destChannelId,
        network: IS_TESTNET ? "testnet" : "bitcoin",
        receiver: osmosisAccount.address,
      })
        .then((res) => {
          if (res.code === 0) {
            setBridgeInfo({
              ...res,
              minimumDeposit:
                1000 / (1 - res.bridgeFeeRate) + res.minerFeeRate * 1e8,
            });
            setReachedCapacityLimit(false);
          } else {
            if (res.code === 2) {
              setReachedCapacityLimit(true);
              return;
            }

            displayToast(
              {
                message: "Unknown Error",
                caption: res.reason,
              },
              ToastType.ERROR
            );
          }
        })
        .finally(() => setIsLoadingDepositAddress(false));

      getPendingDeposits(relayers, osmosisAccount.address).then((deposits) => {
        setPendingDepositAmount(
          deposits.reduce((acc: number, deposit: DepositInfo) => {
            acc += deposit.amount;
            return acc;
          }, 0)
        );
      });
    }, [osmosisAccount, isWithdraw, balanceOnOsmosis.destChannelId]);

    const feeConfig = useFakeFeeConfig(
      chainStore,
      chainId,
      osmosisAccount?.cosmos.msgOpts.ibcTransfer.gas ?? 0
    );
    const withdrawAmountConfig = useAmountConfig(
      chainStore,
      queriesStore,
      chainId,
      address,
      feeConfig,
      balanceOnOsmosis.balance.currency
    );

    async function withdraw() {
      let memo = `withdraw:${withdrawAddress}`;
      if (!osmosisAccount || !osmosisAccount.address) {
        displayToast(
          {
            message: "Osmosis Account Error",
            caption: "Osmosis account not found",
          },
          ToastType.ERROR
        );
        return;
      }

      if (
        !validate(
          withdrawAddress,
          IS_TESTNET ? Network.testnet : Network.mainnet
        )
      ) {
        displayToast(
          {
            message: "Invalid Withdraw Address",
            caption: "Please enter a valid Bitcoin address",
          },
          ToastType.ERROR
        );
        return;
      }

      if (Number(withdrawAmount) < MIN_WITHDRAW_AMOUNT / 1e8) {
        displayToast(
          {
            message: "Invalid Withdraw Amount",
            caption: "Minimum withdraw amount is 0.00001 nBTC",
          },
          ToastType.ERROR
        );

        return;
      }

      await osmosisAccount.cosmos.sendIBCTransferMsg(
        {
          portId: "transfer",
          channelId: balanceOnOsmosis.sourceChannelId,
          counterpartyChainId: nomicChainId,
        },
        withdrawAmount,
        withdrawAmountConfig.sendCurrency,
        deriveNomicAddress(osmosisAccount.address),
        undefined,
        memo
      );
    }

    return (
      <div className="flex w-full flex-col items-center gap-5 md:gap-4">
        {!hasProceeded ? (
          <div className="flex max-w-md flex-col items-center px-2 pt-8">
            <div className="flex flex-col gap-4">
              <div className="mb-4 flex justify-center">
                <img
                  className="h-16 w-16"
                  src={`${process.env.NEXT_PUBLIC_BASEPATH}/tokens/nbtc.svg`}
                  alt="nbtc logo"
                />
              </div>
              <p className="body2 rounded-2xl text-center text-osmoverse-100">
                {t("assets.nomic.nomicCapacityLimit")} <strong>21 BTC</strong>{" "}
                {t("assets.nomic.undergoAudit")}
              </p>
              <p className="body2 rounded-2xl text-center text-osmoverse-100">
                {t("assets.nomic.learnMore")}{" "}
                <a
                  className="text-wosmongton-300"
                  href="https://app.nomic.io/bitcoin"
                >
                  app.nomic.io/bitcoin
                </a>
                .
              </p>
            </div>

            <div className="mt-8 flex w-full flex-row justify-center">
              {reachedCapacityLimit === true ? (
                <div className="body2 border-gradient-neutral w-full rounded-[10px] border border-wosmongton-400 px-3 py-4 text-center text-wosmongton-100">
                  {t("assets.nomic.bridgeAtCapacity")}
                </div>
              ) : (
                <>
                  {connectCosmosWalletButtonOverride ?? (
                    <Button
                      onClick={() => setHasProceeded(true)}
                      disabled={!bridgeInfo || isLoadingDepositAddress}
                      className={classNames(
                        "w-1/3 !px-6 transition-opacity duration-300 hover:opacity-75"
                      )}
                    >
                      {isLoadingDepositAddress
                        ? t("assets.nomic.loading")
                        : t("assets.nomic.proceed")}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <BridgeAnimation
              className={`mx-auto mt-6 -mb-4`}
              transferPath={[from, to]}
            />
            {isWithdraw ? (
              <>
                <div
                  className={classNames(
                    "mt-4 flex w-full flex-col gap-4 transition-opacity duration-300"
                  )}
                >
                  <div className="flex place-content-between items-baseline">
                    {isMobile ? (
                      <span className="subtitle1">
                        {t("assets.nomic.enterBitcoinAddress")}
                      </span>
                    ) : (
                      <h6>{t("assets.nomic.enterBitcoinAddress")}</h6>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <div
                      className={classNames(
                        "flex h-fit w-full flex-nowrap justify-between rounded-lg border bg-osmoverse-1000 px-2 text-white-high",
                        {
                          "border-osmoverse-200": isInputFocused,
                          "border-osmoverse-1000": !isInputFocused,
                        }
                      )}
                    >
                      <label className="flex w-full shrink grow justify-center gap-2 p-3">
                        <span className="w-full">
                          <input
                            id="text-input"
                            className={classNames(
                              "md:leading-0 w-full appearance-none bg-transparent pt-px align-middle leading-10 placeholder:text-osmoverse-500 md:p-0"
                            )}
                            autoComplete="off"
                            onClick={(e: any) => e.target.select()}
                            onFocus={(_: any) => setIsInputFocused(true)}
                            onBlur={(_: any) => setIsInputFocused(false)}
                            value={withdrawAddress}
                            onInput={(e) =>
                              setWithdrawAddress(e.currentTarget.value)
                            }
                          />
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <GradientView
                  className="text-center"
                  gradientClassName="bg-superfluid"
                  bgClassName="bg-osmoverse-900"
                >
                  <p className="body2 md:caption">
                    <strong>{t("assets.nomic.warning")}</strong>{" "}
                    {t("assets.nomic.onlyUse")}{" "}
                    <strong>{t("assets.nomic.bitcoin")}</strong>{" "}
                    {t("assets.nomic.addresses")}
                  </p>
                </GradientView>
                <div
                  className={classNames(
                    "flex w-full flex-col gap-4 transition-opacity duration-300"
                  )}
                >
                  <div className="flex place-content-between items-baseline">
                    {isMobile ? (
                      <span className="subtitle1">
                        {t("assets.ibcTransfer.selectAmount")}
                      </span>
                    ) : (
                      <h6>{t("assets.ibcTransfer.selectAmount")}</h6>
                    )}
                    <div
                      className={classNames(
                        "caption text-xs text-white-high transition-opacity",
                        availableBalance ? "opacity-100" : "opacity-0"
                      )}
                    >
                      {isMobile
                        ? t("assets.transfer.availableMobile")
                        : t("assets.transfer.availableOn", {
                            network: from.networkName,
                          })}{" "}
                      <button
                        className="cursor-pointer text-wosmongton-100 disabled:cursor-default"
                        disabled={availableBalance?.toDec().isZero()}
                        onClick={() => {
                          setWithdrawAmount(
                            availableBalance?.toDec().toString() ?? ""
                          );
                        }}
                      >
                        {availableBalance?.trim(true).toString()}
                      </button>
                    </div>
                  </div>
                  <InputBox
                    type="number"
                    className="p-3 text-h6"
                    inputClassName="text-right"
                    currentValue={withdrawAmount}
                    onInput={setWithdrawAmount}
                  />
                </div>
                <div className="caption my-2 flex w-full flex-col gap-2.5 rounded-lg border border-white-faint p-2.5 text-wireframes-lightGrey">
                  <div className="flex place-content-between items-center">
                    <span>{t("assets.nomic.minWithdrawal")}</span>
                    <span>{`~0.00003 BTC`}</span>
                  </div>
                  <div className="flex place-content-between items-center">
                    <span>{t("assets.nomic.bitcoinMinerFee")}</span>
                    <SkeletonLoader isLoaded={Boolean(bridgeInfo)}>
                      <span>{`~0.00002 BTC`}</span>
                    </SkeletonLoader>
                  </div>
                  <div className="flex place-content-between items-center">
                    <span>{t("assets.nomic.estimatedTimeTag")}</span>
                    <span>{t("assets.nomic.estimatedTime")}</span>
                  </div>
                </div>
                <div className="mt-3 flex w-full items-center justify-center md:mt-4">
                  {connectCosmosWalletButtonOverride ?? (
                    <Button
                      className={classNames(
                        "transition-opacity duration-300 hover:opacity-75"
                      )}
                      disabled={
                        withdrawAmountConfig.sendCurrency.coinDenom.toLowerCase() !==
                        "nbtc"
                      }
                      onClick={withdraw}
                    >
                      {t("assets.ibcTransfer.titleWithdraw", {
                        coinDenom: IS_TESTNET ? "tNBTC" : "nBTC",
                      })}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div
                  className={classNames(
                    "flex w-full flex-col gap-4 transition-opacity duration-300"
                  )}
                >
                  <div className="flex place-content-between items-baseline">
                    {pendingDepositAmount && pendingDepositAmount > 0 ? (
                      <div
                        className={classNames(
                          "caption text-xs text-white-high transition-opacity"
                        )}
                      >
                        {t("assets.nomic.pendingDeposits")}{" "}
                        <button className="cursor-pointer text-wosmongton-100 disabled:cursor-default">
                          {displayBtc(pendingDepositAmount)}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex w-full flex-col gap-3">
                    <SkeletonLoader isLoaded={Boolean(bridgeInfo)}>
                      <div className="flex h-fit w-full flex-nowrap justify-between rounded-2xl  border border-white-faint px-2 text-white-high">
                        <label className="flex w-full shrink grow justify-between gap-5 p-4">
                          {!bridgeInfo?.bitcoinAddress ? null : (
                            <span className="truncate md:text-xs">
                              {bridgeInfo?.bitcoinAddress.slice(0, 26)}...
                              {bridgeInfo?.bitcoinAddress.slice(34)}
                            </span>
                          )}
                          <img
                            width="24"
                            height="24"
                            className="inline rounded-sm hover:cursor-pointer active:bg-osmoverse-600"
                            src={`${process.env.NEXT_PUBLIC_BASEPATH}/icons/copy.svg`}
                            onClick={() =>
                              navigator.clipboard.writeText(
                                bridgeInfo?.bitcoinAddress as string
                              )
                            }
                            alt="copy icon"
                          ></img>
                        </label>
                      </div>
                    </SkeletonLoader>
                  </div>
                </div>
                <div className="flex justify-between gap-3 ">
                  <div className="justify-even flex h-fit">
                    <SkeletonLoader isLoaded={Boolean(bridgeInfo)}>
                      <div
                        className="h-32 w-32 overflow-hidden rounded-lg p-1 md:h-24 md:w-24"
                        style={{ background: "white" }}
                      >
                        <img
                          src={bridgeInfo?.qrCodeData}
                          alt="A QR code representation of the Bitcoin deposit address"
                        />
                      </div>
                    </SkeletonLoader>
                  </div>
                  <div className="flex grow">
                    <GradientView
                      className="flex h-full grow flex-col justify-center text-center"
                      gradientClassName="bg-superfluid"
                      bgClassName="grow flex bg-osmoverse-900"
                    >
                      <div>
                        <span className="body2 md:caption mb-3">
                          <strong>{t("assets.nomic.warning")}</strong>{" "}
                          {t("assets.nomic.depositExpiration")}{" "}
                          <strong>{t("assets.nomic.expirationTime")}</strong>.
                        </span>
                      </div>
                      <div>
                        <span className="body2 md:caption mb-3 px-4">
                          {t("assets.nomic.lossOfFunds")}
                        </span>
                      </div>
                    </GradientView>
                  </div>
                </div>
                <div className="caption my-2 flex w-full flex-col gap-2.5 rounded-lg border border-white-faint p-2.5 text-wireframes-lightGrey">
                  <div className="flex place-content-between items-center">
                    <span>{t("assets.nomic.minDeposit")}</span>
                    <SkeletonLoader isLoaded={Boolean(bridgeInfo)}>
                      <span>{`${displayBtc(
                        bridgeInfo?.minimumDeposit as number
                      )}`}</span>
                    </SkeletonLoader>
                  </div>
                  <div className="flex place-content-between items-center">
                    <span>{t("assets.nomic.bitcoinMinerFee")}</span>
                    <SkeletonLoader isLoaded={Boolean(bridgeInfo)}>
                      <span>{`${bridgeInfo?.minerFeeRate} BTC`}</span>
                    </SkeletonLoader>
                  </div>
                  <div className="flex place-content-between items-center">
                    <span>{t("assets.nomic.bridgeFee")}</span>
                    <SkeletonLoader isLoaded={Boolean(bridgeInfo)}>
                      <span>{`${(
                        (bridgeInfo?.bridgeFeeRate as number) * 100
                      ).toFixed(2)}%`}</span>
                    </SkeletonLoader>
                  </div>
                  <div className="flex place-content-between items-center">
                    <span>{t("assets.nomic.estimatedArrival")}</span>
                    <span>{t("assets.nomic.confirmations")}</span>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-center opacity-80">
              <div className="flex gap-1">
                <span>{t("assets.nomic.poweredBy")}</span>
                <div className="flex">
                  <a href="https://nomic.io">
                    <img
                      alt="Nomic"
                      style={{
                        width: "82px",
                        marginTop: -2,
                        marginLeft: 8,
                      }}
                      className="inline"
                      src={`${process.env.NEXT_PUBLIC_BASEPATH}/logos/nomic.svg`}
                    />
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

export default NomicTransfer;
