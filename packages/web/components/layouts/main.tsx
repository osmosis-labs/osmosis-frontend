import Image from "next/image";
import Link from "next/link";
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

    const { isMobile } = useWindowSize();
    const [_, isScrolledTop] = useWindowScroll();
    const [showSidebar, setShowSidebar] = useBooleanWithWindowEvent(false);

    return (
      <React.Fragment>
        <div className="z-50 fixed w-sidebar px-5 pt-6">
          <Image
            src="/osmosis-logo-main.svg"
            alt="osmosis logo"
            width={178}
            height={48}
          />
        </div>
        <div
          className={classNames(
            "z-40 fixed w-sidebar h-full bg-card flex flex-col px-5 py-6",
            {
              hidden: !showSidebar && isMobile,
            }
          )}
        >
          <div className="h-full flex flex-col justify-between">
            <ul className="mt-32">
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
                            src={`/icons/hexagon-border${
                              selected ? "-selected" : ""
                            }.svg`}
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
            <SidebarBottom />
          </div>
        </div>
        <div
          className={classNames(
            "fixed flex z-40 h-24 w-screen items-center place-content-end px-8",
            {
              "bg-black/30": !isScrolledTop && isMobile,
              hidden: showSidebar || !isMobile,
            }
          )}
        >
          <div
            className={classNames({ hidden: showSidebar })}
            onClick={() => setShowSidebar(true)}
          >
            <Image alt="menu" src="/icons/menu.svg" height={38} width={38} />
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
