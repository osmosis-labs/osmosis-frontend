import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";

import { MainMenu } from "~/components/main-menu";
import { NavBar } from "~/components/navbar";
import NavbarOsmoPrice from "~/components/navbar-osmo-price";
import { MainLayoutMenu } from "~/components/types";
import { useCurrentLanguage, useWindowSize } from "~/hooks";

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
        <div className="fixed z-50 w-sidebar px-5 pt-6">
          <OsmosisFullLogo onClick={() => router.push("/")} />
        </div>
      )}
      <article className="fixed inset-y-0 z-40 flex w-sidebar flex-col overflow-x-hidden bg-osmoverse-800 px-2 py-6 md:hidden">
        {showBlockLogo && (
          <div className="z-50 mx-auto ml-2 w-sidebar grow-0">
            <OsmosisFullLogo width={166} onClick={() => router.push("/")} />
          </div>
        )}
        <MainMenu menus={menus} />
        <div className="flex flex-1 flex-col justify-end">
          <NavbarOsmoPrice />
        </div>
      </article>
      <NavBar
        className="ml-sidebar md:ml-0"
        title={selectedMenuItem?.label ?? ""}
        menus={menus}
      />
      <div className="ml-sidebar h-content bg-osmoverse-900 md:ml-0 md:h-content-mobile">
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
    src="/osmosis-logo-main.svg"
    alt="osmosis logo"
    width={width}
    height={height}
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
  />
);
