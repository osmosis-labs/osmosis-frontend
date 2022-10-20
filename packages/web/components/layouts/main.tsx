import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { FunctionComponent, useEffect } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  useWindowSize,
  useWindowScroll,
  useBooleanWithWindowEvent,
  useAmplitudeAnalytics,
} from "../../hooks";
import { AmplitudeEvent, IS_FRONTIER } from "../../config";
import { NavBar } from "../navbar";
import dayjs from "dayjs";
import { setLanguage } from "react-multi-lang";
import { useStore } from "../../stores";

export type MainLayoutMenu = {
  label: string;
  link: string;
  icon: string;
  iconSelected?: string;
  selectionTest?: RegExp;
  amplitudeEvent?: AmplitudeEvent;
};

export interface MainLayoutProps {
  menus: MainLayoutMenu[];
}

export const MainLayout: FunctionComponent<MainLayoutProps> = observer(
  ({ children, menus }) => {
    const router = useRouter();
    const { userSettings } = useStore();
    const currentLanguage: string | undefined =
      userSettings.getUserSettingById("language")?.state.language;
    const { logEvent } = useAmplitudeAnalytics();

    const { height, isMobile } = useWindowSize();
    const [_, isScrolledTop] = useWindowScroll();
    const [showSidebar, setShowSidebar] = useBooleanWithWindowEvent(false);

    const smallVerticalScreen = height < 850;

    const showFixedLogo = !smallVerticalScreen || isMobile;

    const showBlockLogo = smallVerticalScreen && !isMobile;

    const selectedMenuItem = menus.find(
      ({ selectionTest }) => selectionTest?.test(router.pathname) ?? false
    );

    useEffect(() => {
      if (currentLanguage) {
        dayjs.locale(currentLanguage);
        setLanguage(currentLanguage);
      }
    }, [currentLanguage]);

    return (
      <React.Fragment>
        {showFixedLogo && (
          <div className="z-50 fixed w-sidebar px-5 pt-6">
            <OsmosisFullLogo onClick={() => router.push("/")} />
          </div>
        )}
        <Drawer showSidebar={showSidebar} isMobile={isMobile} height={height}>
          {showBlockLogo && (
            <div className="grow-0 z-50 w-sidebar mx-auto">
              <OsmosisFullLogo width={166} onClick={() => router.push("/")} />
            </div>
          )}
          <ul className="w-full flex flex-col gap-3 mt-20">
            {menus.map(
              (
                {
                  label,
                  link,
                  icon,
                  iconSelected,
                  selectionTest,
                  amplitudeEvent,
                },
                index
              ) => {
                const selected = selectionTest
                  ? selectionTest.test(router.pathname)
                  : false;
                return (
                  <li
                    key={index}
                    className={classNames(
                      "px-4 py-3 flex items-center cursor-pointer",
                      {
                        "rounded-full bg-wosmongton-500": selected,
                      }
                    )}
                    onClick={() => router.push(link)}
                  >
                    <Head>
                      {selected && <title key="title">{label}</title>}
                    </Head>
                    <Link href={link} passHref>
                      <a
                        className={classNames(
                          "flex items-center hover:opacity-100",
                          selected ? "opacity-100" : "opacity-75"
                        )}
                        target={selectionTest ? "_self" : "_blank"}
                        onClick={(e) => {
                          e.stopPropagation();

                          if (amplitudeEvent) {
                            logEvent(amplitudeEvent);
                          }
                        }}
                      >
                        <div
                          className={classNames(
                            "w-5 h-5 z-10",
                            selected ? "opacity-100" : "opacity-40"
                          )}
                        >
                          <Image
                            src={iconSelected ?? icon}
                            width={20}
                            height={20}
                            alt="menu icon"
                          />
                        </div>
                        <p
                          className={classNames(
                            "ml-2.5 text-base overflow-x-hidden font-semibold transition-all max-w-24",
                            {
                              "text-osmoverse-400 group-hover:text-white-mid":
                                !selected,
                            }
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
        </Drawer>
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
          <div className="fixed ml-sidebar md:ml-0 h-content w-screen bg-black/30" />
        )}
        <NavBar className="ml-sidebar" title={selectedMenuItem?.label ?? ""} />
        <div className="ml-sidebar md:ml-0 h-content">{children}</div>
      </React.Fragment>
    );
  }
);

const OsmosisFullLogo: FunctionComponent<{
  width?: number;
  height?: number;
  onClick?: () => void;
}> = ({ width = 178, height = 48, onClick }) => (
  <Image
    className="hover:cursor-pointer"
    src={IS_FRONTIER ? "/osmosis-logo-frontier.svg" : "/osmosis-logo-main.svg"}
    alt="osmosis logo"
    width={width}
    height={height}
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
  />
);

const Drawer: FunctionComponent<{
  showSidebar: boolean;
  isMobile: boolean;
  height: number;
}> = ({ children, showSidebar, isMobile, height }) => {
  const windowLoading = height <= 0;
  if (windowLoading) {
    return null;
  } else if (isMobile === true) {
    return (
      <>
        <div
          className={classNames(
            "absolute z-40 inset-0 h-full transform w-full bg-backdrop -translate-x-full",
            {
              "-translate-x-0": showSidebar,
            }
          )}
        />
        <main
          className={classNames(
            "-translate-x-full fixed overflow-hidden z-40 inset-0 duration-300 transform ease-in-out w-full h-full",
            {
              "-translate-x-0": showSidebar,
            }
          )}
        >
          <section
            className={classNames(
              "w-sidebar shadow-xl absolute bg-white h-full delay-300 duration-150 ease-in-out transition-all transform bg-card flex flex-col overflow-x-hidden overflow-y-auto"
            )}
          >
            <article className="relative h-full flex flex-col">
              <div className="w-sidebar text-center pt-5 bg-card grow-0">
                <div className="invisible">
                  <OsmosisFullLogo width={166} />
                </div>
              </div>
              <div className="grow px-2 py-6 overflow-y-scroll">{children}</div>
            </article>
          </section>
        </main>
      </>
    );
  } else {
    return (
      <article className="fixed flex flex-col inset-y-0 z-40 bg-card px-2 py-6 w-sidebar overflow-x-hidden">
        {children}
      </article>
    );
  }
};
