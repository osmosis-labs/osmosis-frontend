import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  DepositInfo,
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

export const displayBtc = (num: number): string => {
  const multiplier = Math.pow(10, 8);
  const res = Math.floor((Number(num) / 1e8) * multiplier) / multiplier;
  let resStr = Number(res).toFixed(8).toLocaleString();
  return resStr.replace(/\.?0+$/, "") + " BTC";
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
    const t = useTranslation();

    const { chainId } = chainStore.osmosis;
    const osmosisAccount = accountStore.getWallet(chainId);
    const address = osmosisAccount?.address ?? "";
    const osmoIcnsName =
      queriesExternalStore.queryICNSNames.getQueryContract(address).primaryName;

    const osmosisPath = {
      address: osmoIcnsName === "" ? address : osmoIcnsName,
      networkName: chainStore.osmosis.chainName,
      iconUrl: "/tokens/osmo.svg",
      source: "account" as const,
    };
    const bitcoinPath = {
      address: "",
      networkName: selectedSourceChainKey,
      iconUrl: "/tokens/nbtc.svg",
      source: "counterpartyAccount" as const,
    };
    let [from, to] = [
      isWithdraw ? osmosisPath : bitcoinPath,
      isWithdraw ? bitcoinPath : osmosisPath,
    ];

    let isMobile = false;

    const availableBalance = balanceOnOsmosis.balance;

    const [inputFocused, setInputFocused] = useState(false);
    const [proceeded, setProceeded] = useState(isWithdraw);
    const [reachedCapacityLimit, setReachedCapacityLimit] = useState<
      boolean | undefined
    >(undefined);
    const [qrBlob, setQrBlob] = useState<string | undefined>(undefined);
    const [depositAddress, setDepositAddress] = useState<string | undefined>(
      undefined
    );
    const [pendingDepositAmount, setPendingDepositAmount] = useState<
      number | undefined
    >(undefined);
    const [bridgeFee, setBridgeFee] = useState<number | undefined>(undefined);
    const [minerFee, setMinerFee] = useState<number | undefined>(undefined);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [withdrawAddress, setWithdrawAddress] = useState("");

    const nomicChainId = IS_TESTNET ? "nomic-testnet-4d" : "nomic-stakenet-3";

    useAmountConfig;

    useEffect(() => {
      if (!osmosisAccount || !osmosisAccount.address) return;
      const relayers = IS_TESTNET
        ? ["https://relayer.nomic-testnet.mappum.io:8443"]
        : [];
      generateDepositAddress({
        relayers,
        channel: IS_TESTNET ? "channel-0" : "",
        network: IS_TESTNET ? "testnet" : "bitcoin",
        receiver: osmosisAccount.address,
      }).then((res) => {
        if (res.code === 0) {
          setBridgeFee(res.bridgeFeeRate);
          setMinerFee(res.minerFeeRate);
          setDepositAddress(res.bitcoinAddress);
          setQrBlob(res.qrCodeData);
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
      });

      getPendingDeposits(relayers, osmosisAccount.address).then((deposits) => {
        setPendingDepositAmount(
          deposits.reduce((acc: number, deposit: DepositInfo) => {
            acc += deposit.amount;
            return acc;
          }, 0)
        );
      });
    }, [osmosisAccount, isWithdraw]);

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
      await osmosisAccount.cosmos.sendIBCTransferMsg(
        {
          portId: "transfer",
          channelId: IS_TESTNET ? "channel-3572" : "",
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
        {!proceeded ? (
          <div className="flex max-w-md flex-col items-center px-2 pt-8">
            <div className="flex flex-col gap-4">
              <div className="mb-4 flex justify-center">
                <img
                  className="h-16 w-16"
                  src="/tokens/nbtc.svg"
                  alt="nbtc logo"
                />
              </div>
              <p className="body2 rounded-2xl text-center text-osmoverse-100">
                Nomic has a capacity limit of <strong>21 BTC</strong> while
                undergoing auditing (est. completion January 2024).
              </p>
              <p className="body2 rounded-2xl text-center text-osmoverse-100">
                Learn more at{" "}
                <a
                  className="text-wosmongton-300"
                  href="https://app.nomic.io/bitcoin"
                >
                  app.nomic.io/bitcoin
                </a>
                .
              </p>
            </div>

            {reachedCapacityLimit === true ? (
              <div className="flex w-full flex-col">
                <div className="body2 border-gradient-neutral mt-5 w-full rounded-[10px] border border-wosmongton-400 px-3 py-2 text-center text-wosmongton-100">
                  The bridge is currently at capacity. Please try again later.
                </div>
              </div>
            ) : (
              <div className="mt-8 flex max-w-md">
                <Button
                  onClick={() => setProceeded(true)}
                  disabled={reachedCapacityLimit === undefined}
                  className={classNames(
                    "w-50 !px-6 transition-opacity duration-300 hover:opacity-75"
                  )}
                >
                  Proceed
                </Button>
              </div>
            )}
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
                        Enter Bitcoin Address{/* TODO: translations */}
                      </span>
                    ) : (
                      <h6>Enter Bitcoin Address{/* TODO: translations */}</h6>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <div
                      className={classNames(
                        "flex h-fit w-full flex-nowrap justify-between rounded-lg border bg-osmoverse-1000 px-2 text-white-high",
                        {
                          "border-osmoverse-200": inputFocused,
                          "border-osmoverse-1000": !inputFocused,
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
                            onFocus={(_: any) => setInputFocused(true)}
                            onBlur={(_: any) => setInputFocused(false)}
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
                    <strong>WARNING:</strong> Only use{" "}
                    <strong>Bitcoin (BTC)</strong> addresses.
                    <br />
                    Addresses for other networks or tokens (such as BCH) could
                    result in loss of funds.
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
                    <span>Bitcoin Miner Fee{/* TODO: translations */}</span>
                    <SkeletonLoader isLoaded={Boolean(minerFee)}>
                      <span>{`${(minerFee as number) * 100}%`}</span>
                    </SkeletonLoader>
                  </div>
                  <div className="flex place-content-between items-center">
                    <span>Nomic Bridge Fee{/* TODO: translations */}</span>
                    <SkeletonLoader isLoaded={Boolean(bridgeFee)}>
                      <span>{`${((bridgeFee as number) * 100).toFixed(
                        2
                      )}%`}</span>
                    </SkeletonLoader>
                  </div>
                  <div className="flex place-content-between items-center">
                    <span>Estimated Time{/* TODO: translations */}</span>
                    <span>5 minutes</span>
                  </div>
                </div>
                <div className="mt-3 flex w-full items-center justify-center md:mt-4">
                  {connectCosmosWalletButtonOverride ?? (
                    <Button
                      className={classNames(
                        "transition-opacity duration-300 hover:opacity-75"
                      )}
                      onClick={withdraw}
                    >
                      Withdraw BTC
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
                        Pending deposits {/* TODO: translations */}
                        <button className="cursor-pointer text-wosmongton-100 disabled:cursor-default">
                          {displayBtc(pendingDepositAmount)}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex w-full flex-col gap-3">
                    <SkeletonLoader isLoaded={Boolean(depositAddress)}>
                      <div className="flex h-fit w-full flex-nowrap justify-between rounded-2xl  border border-white-faint px-2 text-white-high">
                        <label className="flex w-full shrink grow justify-between gap-5 p-4">
                          {!depositAddress ? null : (
                            <span className="md:text-xs">
                              {depositAddress.slice(0, 26)}...
                              {depositAddress.slice(34)}
                            </span>
                          )}
                          <img
                            width="24"
                            height="24"
                            className="inline rounded-sm hover:cursor-pointer active:bg-osmoverse-600"
                            src="/icons/copy.svg"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                depositAddress as string
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
                    <SkeletonLoader isLoaded={Boolean(qrBlob)}>
                      <div
                        className="h-32 w-32 overflow-hidden rounded-lg p-1 md:h-24 md:w-24"
                        style={{ background: "white" }}
                      >
                        <img
                          src={qrBlob}
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
                          <strong>WARNING:</strong> This address expires in{" "}
                          <strong>4 days</strong>.
                        </span>
                      </div>
                      <div>
                        <span className="body2 md:caption mb-3 px-4">
                          Use of address after this time will result in loss of
                          funds.
                        </span>
                      </div>
                    </GradientView>
                  </div>
                </div>
                <div className="caption my-2 flex w-full flex-col gap-2.5 rounded-lg border border-white-faint p-2.5 text-wireframes-lightGrey">
                  <div className="flex place-content-between items-center">
                    <span>Bitcoin Miner Fee{/* TODO: translations */}</span>
                    <SkeletonLoader isLoaded={Boolean(minerFee)}>
                      <span>{`${(minerFee as number) * 100}%`}</span>
                    </SkeletonLoader>
                  </div>
                  <div className="flex place-content-between items-center">
                    <span>Nomic Bridge Fee</span>
                    <SkeletonLoader isLoaded={Boolean(bridgeFee)}>
                      <span>{`${((bridgeFee as number) * 100).toFixed(
                        2
                      )}%`}</span>
                    </SkeletonLoader>
                  </div>
                  <div className="flex place-content-between items-center">
                    <span>Estimated Arrival{/* TODO: translations */}</span>
                    <span>6 confirmations</span>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-center opacity-80">
              <div className="flex gap-1">
                <span>Powered by </span>
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
                      src="/logos/nomic.svg"
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

// accommodate next/dynamic
export default NomicTransfer;
