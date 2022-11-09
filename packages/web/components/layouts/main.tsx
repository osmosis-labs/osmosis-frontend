import Image from "next/image";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useWindowSize, useCurrentLanguage } from "../../hooks";
import { IS_FRONTIER } from "../../config";
import { MainMenu } from "../main-menu";
import { NavBar } from "../navbar";
import { MainLayoutMenu } from "../types";

export const MainLayout: FunctionComponent<{
  menus: MainLayoutMenu[];
}> = observer(({ children, menus }) => {
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
        <MainMenu menus={menus} />
      </article>
      <NavBar
        className="ml-sidebar md:ml-0"
        title={selectedMenuItem?.label ?? ""}
        menus={menus}
      />
      <div className="ml-sidebar md:ml-0 h-content md:h-content-mobile bg-osmoverse-900">
        {children}
      </div>
    </React.Fragment>
  );
});

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
