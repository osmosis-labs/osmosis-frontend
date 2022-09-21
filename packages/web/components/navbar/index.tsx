import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useStore } from "../../stores";
import { CustomClasses } from "../types";

export const NavBar: FunctionComponent<
  { title: string; backElementClassNames?: string } & CustomClasses
> = observer(({ title, className, backElementClassNames }) => {
  const { navBarStore } = useStore();

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div
        className={classNames(
          "fixed z-[1000] flex place-content-between items-center bg-osmoverse-900 h-[88px] w-[calc(100vw_-_12.875rem)] px-8",
          className
        )}
      >
        <h4>{navBarStore.title || title}</h4>

        <div className="flex gap-3 items-center">
          <Button iconUrl="/icons/setting.svg" />
          <div className="flex items-center gap-3 px-2 py-1 rounded-xl border border-osmoverse-700">
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
                  13
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Back-layer element to occupy space for the caller */}
      <div
        className={classNames(
          "bg-osmoverse-900 h-[88px]",
          backElementClassNames
        )}
      />
    </>
  );
});

const Button: FunctionComponent<{ iconUrl: string }> = ({ iconUrl }) => (
  <button className="flex bg-osmoverse-700 items-center px-3 py-2 rounded-xl">
    <Image alt="settings" src={iconUrl} height={24} width={24} />
  </button>
);
