import React, { FunctionComponent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import classNames from "classnames";
import { useStore } from "../../stores";
import { WalletStatus } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";

export type MainLayoutMenu = {
  label: string;
  link: string;
  icon: string;
  iconSelected?: string;
  selectionTest?: RegExp;
};

export interface MainLayoutProps {
  menus: MainLayoutMenu[];
}

export const MainLayout: FunctionComponent<MainLayoutProps> = observer(
  ({ children, menus }) => {
    const router = useRouter();

    const { chainStore, accountStore, queriesStore } = useStore();
    const account = accountStore.getAccount(chainStore.osmosis.chainId);
    const queries = queriesStore.get(chainStore.osmosis.chainId);

    return (
      <React.Fragment>
        <div className="fixed w-sidebar h-full bg-card flex flex-col px-5 py-6">
          <Image
            src="/osmosis-logo-main.svg"
            alt="osmosis logo"
            width="100%"
            height="48px"
          />

          <div className="h-full flex flex-col justify-between">
            <ul className="mt-16">
              {menus.map((menu) => {
                const selected = menu.selectionTest
                  ? menu.selectionTest.test(router.pathname)
                  : false;

                return (
                  <li key={menu.label} className="h-16 flex items-center">
                    <Link href={menu.link} passHref>
                      <a
                        className={classNames(
                          "flex items-center opacity-75 hover:opacity-100",
                          {
                            "opacity-100 transition-all": selected,
                          }
                        )}
                        target={menu.selectionTest ? "_self" : "_blank"}
                      >
                        <div className="h-11 w-11 relative">
                          <Image
                            className="absolute top-0 left-0 transition-all"
                            src={
                              selected
                                ? "/icons/border-selected.svg"
                                : "/icons/border-unselected.svg"
                            }
                            layout="fill"
                            alt="menu icon border"
                          />
                          <div className="w-5 h-5 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <Image
                              src={
                                selected
                                  ? menu.iconSelected ?? menu.icon
                                  : menu.icon
                              }
                              width={20}
                              height={20}
                              alt="menu icon"
                            />
                          </div>
                        </div>
                        <p
                          className={classNames(
                            "ml-2.5 text-base overflow-x-hidden font-bold transition-all max-w-24",
                            selected
                              ? "text-white-high"
                              : "text-iconDefault group-hover:text-white-mid"
                          )}
                        >
                          {menu.label}
                        </p>
                        {!menu.selectionTest && (
                          <div className="ml-2">
                            <Image
                              src="/icons/link-deco.svg"
                              alt="link"
                              width={12}
                              height={12}
                            />
                          </div>
                        )}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div>
              <div className="w-full">
                {account.walletStatus === WalletStatus.Loaded ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="p-4">
                        <Image
                          src="/icons/wallet.svg"
                          alt="wallet"
                          width={20}
                          height={20}
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-white-high text-base">
                          {account.name}
                        </p>
                        <p className="opacity-50 text-white-emphasis text-sm">
                          {queries.queryBalances
                            .getQueryBech32Address(account.bech32Address)
                            .stakable.balance.trim(true)
                            .maxDecimals(2)
                            .shrink(true)
                            .upperCase(true)
                            .toString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        account.disconnect();
                      }}
                      className="bg-transparent border border-opacity-30 border-secondary-200 h-9 w-full rounded-md py-2 px-1 flex items-center justify-center mb-8"
                    >
                      <Image
                        src="/icons/sign-out-secondary.svg"
                        alt="sign-out"
                        width={20}
                        height={20}
                      />
                      <p className="text-sm max-w-24 ml-3 text-secondary-200 font-semibold overflow-x-hidden truncate transition-all">
                        Sign Out
                      </p>
                    </button>
                  </div>
                ) : (
                  <button
                    className="flex items-center justify-center w-full h-9 py-3.5 rounded-md bg-primary-200 mb-8"
                    onClick={(e) => {
                      e.preventDefault();
                      account.init();
                    }}
                  >
                    <Image
                      src="/icons/wallet.svg"
                      alt="connect wallet icon"
                      width={20}
                      height={20}
                    />
                    <span className="ml-2.5 text-white-high font-semibold">
                      Connect Wallet
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center transition-all overflow-x-hidden w-full">
                <a
                  href="https://twitter.com/osmosiszone"
                  target="_blank"
                  className="opacity-75 hover:opacity-100 cursor-pointer mb-0.5 mr-1"
                  rel="noreferrer"
                >
                  <Image
                    src="/icons/twitter.svg"
                    alt="twitter"
                    width={32}
                    height={32}
                  />
                </a>
                <a
                  href="https://medium.com/@Osmosis"
                  target="_blank"
                  className="opacity-75 hover:opacity-100 cursor-pointer mr-1"
                  rel="noreferrer"
                >
                  <Image
                    className="w-9 h-9"
                    src="/icons/medium.svg"
                    alt="medium"
                    width={36}
                    height={36}
                  />
                </a>
                <a
                  href="https://discord.gg/osmosis"
                  target="_blank"
                  className="opacity-75 hover:opacity-100 cursor-pointer mb-0.5"
                  rel="noreferrer"
                >
                  <Image
                    src="/icons/discord.svg"
                    alt="discord"
                    width={36}
                    height={36}
                  />
                </a>
                <a
                  href="https://t.me/osmosis_chat"
                  target="_blank"
                  className="opacity-75 hover:opacity-100 cursor-pointer mb-0.5"
                  rel="noreferrer"
                >
                  <Image
                    src="/icons/telegram.svg"
                    alt="telegram"
                    width={36}
                    height={36}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="ml-sidebar">{children}</div>
      </React.Fragment>
    );
  }
);
