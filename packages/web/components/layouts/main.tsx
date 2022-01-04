import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import classNames from "classnames";

export type MainLayoutMenu = {
  label: string;
  link: string;
  icon: string;
  iconSelected?: string;
  selectionTest?: RegExp;
};

export type MainLayoutProps = React.PropsWithChildren<{
  menus: MainLayoutMenu[];
}>;

export function MainLayout({ children, menus }: MainLayoutProps) {
  const router = useRouter();
  const [isOpenSidebar, setIsOpenSidebar] = useState<boolean>(false);

  const closeSidebar = () => setIsOpenSidebar(false);

  return (
    <React.Fragment>
      {isOpenSidebar && (
        <div
          className="fixed z-20 w-full h-full bg-black bg-opacity-75 md:hidden"
          onClick={closeSidebar}
        />
      )}
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
            <button className="flex items-center justify-center w-full h-9 py-3.5 rounded-md bg-primary-200 mb-8">
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
