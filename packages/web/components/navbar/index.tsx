import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { WalletStatus } from "@keplr-wallet/stores";
import { NewButton } from "../buttons";
import { useStore } from "../../stores";
import { CustomClasses } from "../types";

export const NavBar: FunctionComponent<
  { title: string; backElementClassNames?: string } & CustomClasses
> = observer(({ title, className, backElementClassNames }) => {
  const {
    navBarStore,
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();

  const account = accountStore.getAccount(chainId);

  const walletConnected = account.walletStatus === WalletStatus.Loaded;

  const [hoverWalletInfo, setHoverWalletInfo] = useState(false);

  return (
    <>
      <div
        className={classNames(
          "fixed z-[1000] flex place-content-between items-center bg-osmoverse-900 h-navbar w-[calc(100vw_-_12.875rem)] px-8",
          className
        )}
      >
        <div className="flex items-center gap-9">
          <h4>{navBarStore.title || title}</h4>
          {navBarStore.callToActionButtons.map((button, index) => (
            <NewButton
              mode={index > 0 ? "secondary" : undefined}
              key={index}
              {...button}
            >
              <span className="subtitle1 mx-auto">{button.label}</span>
            </NewButton>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <NavBarButton
            iconUrl="/icons/setting.svg"
            hoverIconUrl="/icons/setting-hover.svg"
          />
          {!walletConnected ? (
            <NewButton
              onClick={() => {
                account.init();
                setHoverWalletInfo(false);
              }}
              className="w-[168px] h-10"
            >
              <span className="mx-auto button">Connect Wallet</span>
            </NewButton>
          ) : hoverWalletInfo ? (
            <NewButton
              className="w-[168px] h-10"
              mode="secondary"
              onMouseLeave={() => setHoverWalletInfo(false)}
              onClick={() => {
                account.disconnect();
                setHoverWalletInfo(false);
              }}
            >
              <span className="mx-auto button">Disconnect</span>
            </NewButton>
          ) : (
            <div
              className="flex items-center gap-3 px-2 py-1 rounded-xl border border-osmoverse-700"
              onMouseOver={() => setHoverWalletInfo(true)}
              onClick={() => setHoverWalletInfo(true)}
            >
              <Image
                alt="wallet-icon"
                src={navBarStore.walletInfo.logoUrl}
                height={28}
                width={28}
              />

              <div className="flex leading-tight flex-col text-center">
                <span className="text-button font-button">
                  {navBarStore.walletInfo.balance.toString()}
                </span>
                <span className="caption">
                  {Bech32Address.shortenAddress(
                    navBarStore.walletInfo.bech32Address,
                    16
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Back-layer element to occupy space for the caller */}
      <div
        className={classNames(
          "bg-osmoverse-900 h-navbar",
          backElementClassNames
        )}
      />
    </>
  );
});

const NavBarButton: FunctionComponent<{
  iconUrl: string;
  hoverIconUrl: string;
}> = ({ iconUrl, hoverIconUrl }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex bg-osmoverse-700 items-center px-3 py-2 rounded-xl hover:bg-osmoverse-600"
    >
      <Image
        alt="settings"
        src={hovered ? hoverIconUrl : iconUrl}
        height={24}
        width={24}
      />
    </button>
  );
};
