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
  UserEvent,
  useMatomoAnalytics,
  useAmplitudeAnalytics,
} from "../../hooks";
import { SidebarBottom } from "../complex/sidebar-bottom";
import { AmplitudeEvent, IS_FRONTIER } from "../../config";
export type MainLayoutMenu = {
  label: string;
  link: string;
  icon: string;
  iconSelected?: string;
  selectionTest?: RegExp;
  userAnalyticsEvent?: UserEvent;
  amplitudeEvent?: AmplitudeEvent;
};

export interface MainLayoutProps {
  menus: MainLayoutMenu[];
}

export const MainLayout: FunctionComponent<MainLayoutProps> = observer(
  ({ children, menus }) => {
    const router = useRouter();
    const { trackEvent } = useMatomoAnalytics();
    const { logEvent } = useAmplitudeAnalytics();
    const { height, isMobile } = useWindowSize();
    const [_, isScrolledTop] = useWindowScroll();
    const [showSidebar, setShowSidebar] = useBooleanWithWindowEvent(false);

    const smallVerticalScreen = height < 850;

    const showFixedLogo = !smallVerticalScreen || isMobile;

    const showBlockLogo = smallVerticalScreen && !isMobile;

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
          <div className="grow h-full flex flex-col justify-between">
            <ul className="my-auto">
              {menus.map(
                ({
                  label,
                  link,
                  icon,
                  iconSelected,
                  selectionTest,
                  userAnalyticsEvent,
                  amplitudeEvent,
                }) => {
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
                          onClick={() => {
                            if (userAnalyticsEvent) {
                              trackEvent(userAnalyticsEvent);
                            }
                            if (amplitudeEvent) {
                              logEvent(amplitudeEvent);
                            }
                          }}
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
                              "ml-2.5 text-base overflow-x-hidden font-semibold transition-all max-w-24",
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
          <div className="fixed ml-sidebar md:ml-0 h-screen w-screen bg-black/30" />
        )}
        <div className="ml-sidebar md:ml-0 h-screen">{children}</div>
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
              <div className="grow px-5 py-6 overflow-y-scroll">{children}</div>
            </article>
          </section>
        </main>
      </>
    );
  } else {
    return (
      <article className="fixed flex flex-col inset-y-0 z-40 bg-card px-5 py-6 w-sidebar overflow-x-hidden">
        {children}
      </article>
    );
  }
};
