import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { BridgeAnimation } from "~/components/animation";
import { GradientView } from "~/components/assets/gradient-view";
import { Button } from "~/components/buttons";
import { InputBox } from "~/components/input";
import { SourceChain } from "~/integrations/bridge-info";
import { BridgeIntegrationProps } from "~/modals";
import { useStore } from "~/stores";
import { IBCBalance } from "~/stores/assets";

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
    const { chainStore, accountStore, queriesExternalStore } = useStore();
    const t = useTranslation();

    const { chainId } = chainStore.osmosis;
    const osmosisAccount = accountStore.getWallet(chainId);
    const address = osmosisAccount?.address ?? "";
    const osmoIcnsName =
      queriesExternalStore.queryICNSNames.getQueryContract(address).primaryName;

    // chain path info whether withdrawing or depositing
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

    const isDepositAddressLoading = false;

    let isMobile = false;
    let pendingDeposits = ""; //"0.1201";

    const availableBalance = balanceOnOsmosis.balance;

    const [inputFocused, setInputFocused] = useState(false);

    return (
      <div className="flex flex-col gap-5 overflow-x-auto md:gap-4">
        <BridgeAnimation
          className={`mx-auto mt-6 -mb-4`}
          transferPath={[from, to]}
        />

        {isWithdraw ? (
          <>
            <div
              className={classNames(
                "flex flex-col gap-4 transition-opacity duration-300"
              )}
            >
              <div className="flex place-content-between items-baseline">
                {isMobile ? (
                  <span className="subtitle1">
                    Destination Address{/* TODO: translations */}
                  </span>
                ) : (
                  <h6>Destination Address{/* TODO: translations */}</h6>
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
                  <label className="flex w-full shrink grow justify-center gap-5 p-4">
                    <span className="w-full">
                      <input
                        id="text-input"
                        className={classNames(
                          "md:leading-0 w-full appearance-none bg-transparent pt-px align-middle leading-10 placeholder:text-osmoverse-500 md:p-0"
                        )}
                        placeholder="Enter a Bitcoin address"
                        autoComplete="off"
                        onClick={(e: any) => e.target.select()}
                        onFocus={(_: any) => setInputFocused(true)}
                        onBlur={(_: any) => setInputFocused(false)}
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
                "flex flex-col gap-4 transition-opacity duration-300"
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
                currentValue=""
                onInput={() => {}}
              />
            </div>
            <div className="caption my-2 flex flex-col gap-2.5 rounded-lg border border-white-faint p-2.5 text-wireframes-lightGrey">
              <div className="flex place-content-between items-center">
                <span>Miner Fee{/* TODO: translations */}</span>
                <span>~0.00001 BTC {/* TODO */}</span>
              </div>
              <div className="flex place-content-between items-center">
                <span>Bridge Fee{/* TODO: translations */}</span>
                <span>0%</span>
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
                    "transition-opacity duration-300 hover:opacity-75",
                    { "opacity-30": isDepositAddressLoading }
                  )}
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
                "flex flex-col gap-4 transition-opacity duration-300"
              )}
            >
              <div className="flex place-content-between items-baseline">
                {isMobile ? (
                  <span className="subtitle1">
                    Deposit Address{/* TODO: translations */}
                  </span>
                ) : (
                  <h6>Deposit Address{/* TODO: translations */}</h6>
                )}
                {pendingDeposits ? (
                  <div
                    className={classNames(
                      "caption text-xs text-white-high transition-opacity"
                    )}
                  >
                    Pending deposits {/* TODO: translations */}
                    <button className="cursor-pointer text-wosmongton-100 disabled:cursor-default">
                      0.1201 BTC
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex h-fit w-full flex-nowrap justify-between rounded-lg border-osmoverse-1000 bg-osmoverse-1000 px-2 text-white-high">
                  <label className="flex w-full shrink grow justify-center gap-5 p-4">
                    <span className="md:text-xs">
                      tb1qcukl5w2ptvfk2u9838c8pn6carraj4dlcztz7ft60c9uhsw3m8cspg2vxz
                    </span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-3 ">
              <div className="justify-even flex h-fit">
                <div className="h-32 w-32 rounded-lg bg-osmoverse-200 p-2 md:h-24 md:w-24">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=tb1qcukl5w2ptvfk2u9838c8pn6carraj4dlcztz7ft60c9uhsw3m8cspg2vxz"
                    alt="A QR code representing the Bitcoin deposit address."
                  />
                </div>
              </div>
              <div className="flex grow justify-end">
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
                  {/* <br />
            <span className="body2 md:caption"><strong>WARNING:</strong> Only deposit <strong>Bitcoin (BTC)</strong>.<br />Using other networks or tokens will result in loss of funds.</span> */}
                </GradientView>
              </div>
            </div>
            <div className="caption my-2 flex flex-col gap-2.5 rounded-lg border border-white-faint p-2.5 text-wireframes-lightGrey">
              <div className="flex place-content-between items-center">
                <span>Miner Fee{/* TODO: translations */}</span>
                <span>~0.0001 BTC {/* TODO */}</span>
              </div>
              <div className="flex place-content-between items-center">
                <span>Bridge Fee{/* TODO: translations */}</span>
                <span>0.5%</span>
              </div>
              <div className="flex place-content-between items-center">
                <span>Arrival{/* TODO: translations */}</span>
                <span>6 confirmations</span>
              </div>
            </div>
          </>
        )}
        <div className="mt-3 flex justify-center opacity-80">
          <div className="flex gap-2">
            <span>Powered by </span>
            <div className="flex w-24">
              <a href="https://nomic.io">
                <img
                  alt="The Nomic logo"
                  className="inline w-full"
                  src="https://nomic.io/logo.svg"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

// accommodate next/dynamic
export default NomicTransfer;
