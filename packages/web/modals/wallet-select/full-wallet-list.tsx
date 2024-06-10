import { WalletRepo } from "@cosmos-kit/core";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo } from "react";

import { useTranslation, WalletSelectOption } from "~/hooks";
import { useSelectableWallets } from "~/modals/wallet-select/use-selectable-wallets";
import { ModalView, OnConnectWallet } from "~/modals/wallet-select/utils";

export const FullWalletList: FunctionComponent<{
  walletRepo: WalletRepo | undefined;
  onConnect: OnConnectWallet;
  isMobile: boolean;
  modalView: ModalView;
  walletOptions: WalletSelectOption[];
}> = observer(
  ({ walletRepo, onConnect, isMobile, modalView, walletOptions }) => {
    const { t } = useTranslation();
    const { cosmosWallets, evmWallets } = useSelectableWallets({
      includedWallets: walletOptions.map((option) => option.walletType),
      isMobile,
    });

    const evmOption = useMemo(
      () =>
        walletOptions.find(
          (
            option
          ): option is Extract<WalletSelectOption, { walletType: "evm" }> =>
            option.walletType === "evm"
        ),
      [walletOptions]
    );

    /**
     * Categorizes wallets into three distinct categories:
     * 1. Mobile Wallets: Wallets that use the "wallet-connect" mode.
     * 2. Installed Wallets: Wallets that have a defined window property present in the current window.
     * 3. Other Wallets: Wallets that do not fall into the above two categories.
     *
     * Note: The object keys are the translation keys for the category name.
     */
    const categories = useMemo(
      () =>
        [...cosmosWallets, ...evmWallets].reduce(
          (acc, wallet) => {
            if (wallet.walletType === "evm") {
              acc["walletSelect.installedWallets"].push(wallet);
              return acc;
            }

            if (wallet.walletType === "cosmos") {
              if (wallet.mode === "wallet-connect") {
                acc["walletSelect.mobileWallets"].push(wallet);
                return acc;
              }

              if (
                wallet.windowPropertyName &&
                wallet.windowPropertyName in window
              ) {
                acc["walletSelect.installedWallets"].push(wallet);
                return acc;
              }

              acc["walletSelect.otherWallets"].push(wallet);
              return acc;
            }

            return acc;
          },
          {
            "walletSelect.installedWallets": [] as (
              | typeof cosmosWallets
              | typeof evmWallets
            )[number][],
            "walletSelect.mobileWallets": [] as (
              | typeof cosmosWallets
              | typeof evmWallets
            )[number][],
            "walletSelect.otherWallets": [] as (
              | typeof cosmosWallets
              | typeof evmWallets
            )[number][],
          }
        ),
      [cosmosWallets, evmWallets]
    );

    if (evmWallets.length > 0) {
      throw new Error(
        "Evm wallets are not supported in 'full' view layout yet."
      );
    }

    return (
      <section className="flex flex-col gap-8 py-8 pl-8 sm:pl-3">
        <h1 className="z-10 text-h6 font-h6 tracking-wider sm:text-center">
          {t("connectWallet")}
        </h1>
        <div className="z-10 flex flex-col gap-8 overflow-auto pr-5">
          {Object.entries(categories)
            .filter(([_, wallets]) => wallets.length > 0)
            .map(([categoryName, wallets]) => {
              const isDisabled = modalView === "initializingOneClickTrading";
              return (
                <div key={categoryName} className="flex flex-col">
                  <h2
                    className={classNames(
                      "subtitle1 text-osmoverse-100 sm:hidden",
                      isDisabled && "opacity-70"
                    )}
                  >
                    {t(categoryName)}
                  </h2>

                  <div className="flex flex-col sm:flex-row sm:overflow-x-auto">
                    {wallets.map((wallet) => {
                      if (wallet.walletType === "evm") {
                        return (
                          <button
                            className={classNames(
                              "button flex w-full items-center gap-3 rounded-xl px-3 font-bold text-osmoverse-100 transition-colors hover:bg-osmoverse-700",
                              "col-span-2 py-3 font-normal",
                              "sm:w-fit sm:flex-col",
                              walletRepo?.current?.walletName === wallet.name &&
                                "bg-osmoverse-700",
                              "disabled:opacity-70"
                            )}
                            key={wallet.id}
                            onClick={() =>
                              onConnect({
                                walletType: "evm",
                                wallet,
                                chainId: evmOption?.chainId,
                              })
                            }
                            disabled={isDisabled}
                          >
                            {typeof wallet.icon === "string" && (
                              <img
                                src={wallet.icon}
                                width={40}
                                height={40}
                                alt="Wallet logo"
                              />
                            )}
                            <span>{wallet.name}</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          className={classNames(
                            "button flex w-full items-center gap-3 rounded-xl px-3 font-bold text-osmoverse-100 transition-colors hover:bg-osmoverse-700",
                            "col-span-2 py-3 font-normal",
                            "sm:w-fit sm:flex-col",
                            walletRepo?.current?.walletName === wallet.name &&
                              "bg-osmoverse-700",
                            "disabled:opacity-70"
                          )}
                          key={wallet.name}
                          onClick={() =>
                            onConnect({ walletType: "cosmos", wallet })
                          }
                          disabled={isDisabled}
                        >
                          {typeof wallet.logo === "string" && (
                            <img
                              src={wallet.logo}
                              width={40}
                              height={40}
                              alt="Wallet logo"
                            />
                          )}
                          <span>{wallet.prettyName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    );
  }
);
