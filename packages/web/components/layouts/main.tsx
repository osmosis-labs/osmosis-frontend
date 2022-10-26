import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  useWindowSize,
  useAmplitudeAnalytics,
  useCurrentLanguage,
} from "../../hooks";
import { AmplitudeEvent, IS_FRONTIER } from "../../config";
import { NavBar } from "../navbar";

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
    useCurrentLanguage();

    const { height, isMobile } = useWindowSize();

    const smallVerticalScreen = height < 850;

    const showFixedLogo = !smallVerticalScreen && !isMobile;
    const showBlockLogo = smallVerticalScreen && !isMobile;

    const selectedMenuItem = menus.find(
      ({ selectionTest }) => selectionTest?.test(router.pathname) ?? false
    );

    return (
      <React.Fragment>
        {showFixedLogo && (
          <div className="z-50 fixed w-sidebar px-5 pt-6">
            <OsmosisFullLogo onClick={() => router.push("/")} />
          </div>
        )}
        <article className="fixed md:hidden flex flex-col inset-y-0 z-40 bg-osmoverse-800 px-2 py-6 w-sidebar overflow-x-hidden">
          {showBlockLogo && (
            <div className="grow-0 ml-2 z-50 w-sidebar mx-auto">
              <OsmosisFullLogo width={166} onClick={() => router.push("/")} />
            </div>
          )}
          <MenuItems menus={menus} />
        </article>
        <NavBar
          className="ml-sidebar md:ml-0"
          title={selectedMenuItem?.label ?? ""}
        />
        <div className="ml-sidebar md:ml-0 h-content md:h-content-mobile bg-osmoverse-900">
          {children}
        </div>
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

const MenuItems: FunctionComponent<MainLayoutProps> = ({ menus }) => {
  const router = useRouter();
  const { logEvent } = useAmplitudeAnalytics();

  return (
    <ul className="w-full flex flex-col gap-3 mt-20">
      {menus.map(
        (
          { label, link, icon, iconSelected, selectionTest, amplitudeEvent },
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
              <Head>{selected && <title key="title">{label}</title>}</Head>
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
  );
};
