import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  useWindowSize,
  useWindowScroll,
  useBooleanWithWindowEvent,
} from "../../hooks";
import { SidebarBottom } from "../complex/sidebar-bottom";
import { IS_FRONTIER } from "../../config";

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

    const { height, isMobile } = useWindowSize();
    const [_, isScrolledTop] = useWindowScroll();
    const [showSidebar, setShowSidebar] = useBooleanWithWindowEvent(false);

    const smallVerticalScreen = height < 800;

    const showFixedLogo = !smallVerticalScreen || (isMobile && !showSidebar);

    const showBlockLogo = smallVerticalScreen;

    return (
      <React.Fragment>
        {showFixedLogo && (
          <div className="z-50 fixed w-sidebar px-5 pt-6">
            <Image
              src={
                IS_FRONTIER
                  ? "/osmosis-logo-frontier.svg"
                  : "/osmosis-logo-main.svg"
              }
              alt="osmosis logo"
              width={178}
              height={48}
            />
          </div>
        )}
        <div
          className={classNames(
            "z-40 fixed w-sidebar h-full bg-card flex flex-col px-5 py-6 overflow-x-hidden overflow-y-auto",
            {
              hidden: !showSidebar && isMobile,
            }
          )}
        >
          {showBlockLogo && (
            <div className="z-50 w-sidebar mx-auto">
              <Image
                src={
                  IS_FRONTIER
                    ? "/osmosis-logo-frontier.svg"
                    : "/osmosis-logo-main.svg"
                }
                alt="osmosis logo"
                width={165}
                height={45}
              />
            </div>
          )}
          <div className="h-full flex flex-col justify-between">
            <ul className="my-auto">
              {menus.map(
                ({ label, link, icon, iconSelected, selectionTest }) => {
                  const selected = selectionTest
                    ? selectionTest.test(router.pathname)
                    : false;
                  return (
                    <li key={label} className="h-16 flex items-center">
                      <Head>
                        {selected && <title key="title">{label}</title>}
                      </Head>
                      <Link href={link} passHref>
                        <a
                          className={classNames(
                            "flex items-center opacity-75 hover:opacity-100",
                            {
                              "opacity-100 transition-all": selected,
                            }
                          )}
                          target={selectionTest ? "_self" : "_blank"}
                        >
                          <div className="h-11 w-11 relative">
                            <Image
                              className="absolute top-0 left-0 transition-all"
                              src={`${
                                IS_FRONTIER
                                  ? "/icons/hexagon-border-white"
                                  : "/icons/hexagon-border"
                              }${selected ? "-selected" : ""}.svg`}
                              layout="fill"
                              alt="menu icon border"
                            />
                            <div className="w-5 h-5 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                              <Image
                                src={selected ? iconSelected ?? icon : icon}
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
                            {label}
                          </p>
                          {!selectionTest && (
                            <div className="ml-2">
                              <Image
                                src={
                                  IS_FRONTIER
                                    ? "/icons/link-deco-white.svg"
                                    : "/icons/link-deco.svg"
                                }
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
                }
              )}
            </ul>
            <SidebarBottom />
          </div>
        </div>
        <div
          className={classNames(
            "fixed flex z-40 h-mobile-header w-screen items-center justify-end px-5",
            {
              "bg-black/80": !isScrolledTop && isMobile,
              hidden: showSidebar || !isMobile,
            }
          )}
        >
          <div
            className={classNames({ hidden: showSidebar })}
            onClick={() => setShowSidebar(true)}
          >
            <Image
              alt="menu"
              src={IS_FRONTIER ? "/icons/menu-white.svg" : "/icons/menu.svg"}
              height={38}
              width={38}
            />
          </div>
        </div>
        {showSidebar && (
          <div className="fixed ml-sidebar md:ml-0 h-screen w-screen bg-black/30" />
        )}
        <div className="ml-sidebar md:ml-0 h-screen">{children}</div>
      </React.Fragment>
    );
  }
);
