import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";

import { SearchBox } from "~/components/input";
import { useTranslation, WalletSelectOption } from "~/hooks";
import { useSelectableWallets } from "~/modals/wallet-select/use-selectable-wallets";
import { OnConnectWallet } from "~/modals/wallet-select/utils";

export const SimpleWalletList: FunctionComponent<{
  onConnect: OnConnectWallet;
  isMobile: boolean;
  walletOptions: WalletSelectOption[];
}> = observer(({ onConnect, isMobile, walletOptions }) => {
  const [search, setSearch] = useState("");

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

  if (cosmosWallets.length > 0) {
    throw new Error(
      "Cosmos wallets are not supported in 'simple' view layout yet."
    );
  }

  return (
    <section className="flex flex-col gap-8 py-8 px-3">
      <h1 className="z-10 self-center text-h6 font-h6 tracking-wider sm:text-center">
        {t("connectWallet")}
      </h1>

      <div className="flex w-full flex-col gap-3">
        <SearchBox
          className="!w-full"
          size="medium"
          placeholder="Search wallets"
          onInput={(nextValue) => {
            setSearch(nextValue);
          }}
          currentValue={search}
        />

        <div className="flex flex-col sm:flex-row sm:overflow-x-auto">
          {evmWallets
            .filter((wallet) => {
              if (!search) return true;
              return wallet.name.toLowerCase().includes(search.toLowerCase());
            })
            .map((wallet) => {
              return (
                <button
                  className={classNames(
                    "button flex w-full items-center gap-3 rounded-xl px-3 font-bold text-osmoverse-100 transition-colors hover:bg-osmoverse-700",
                    "col-span-2 py-3 font-normal",
                    "sm:w-fit sm:flex-col",
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
            })}
        </div>
      </div>
    </section>
  );
});
