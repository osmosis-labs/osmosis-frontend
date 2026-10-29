import { isFunction } from "@osmosis-labs/utils";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, MouseEventHandler, ReactNode } from "react";

export type MainLayoutMenu = {
  label: string;
  link: string | MouseEventHandler;
  icon: ReactNode;
  selectionTest?: RegExp;
  hideOnMobile?: boolean;
};

export const MainMenu: FunctionComponent<{
  menus: MainLayoutMenu[];
  secondaryMenuItems: MainLayoutMenu[];
  className?: string;
}> = ({ menus, className, secondaryMenuItems }) => {
  return (
    <>
      <ul
        className={classNames(
          "mt-20 flex w-full flex-col gap-3 md:mb-0 md:mt-0 md:gap-0",
          className
        )}
      >
        {menus.map((menu, index) => (
          <MenuListItem key={index} menu={menu} />
        ))}
      </ul>
      {secondaryMenuItems.length > 0 && (
        <ul className="mt-3 flex w-full flex-col gap-3 border-t border-osmoverse-800 pt-3 md:mt-2 md:gap-0 md:pt-2">
          {secondaryMenuItems.map((menu) => (
            <MenuListItem key={menu.label} menu={menu} isSecondary />
          ))}
        </ul>
      )}
    </>
  );
};

const MenuListItem: FunctionComponent<{
  menu: MainLayoutMenu;
  isSecondary?: boolean;
}> = ({ menu, isSecondary }) => {
  const { link, selectionTest } = menu;
  const router = useRouter();

  const selected = selectionTest ? selectionTest.test(router.pathname) : false;

  const onClickLink = (e: React.MouseEvent) => {
    // If link is a string, do nothing and let the Link handle the navigation
    if (!isFunction(link)) return;

    e.preventDefault();
    link(e);
  };

  return (
    <li
      className="flex cursor-pointer items-center"
      onClick={(e) => {
        if (isFunction(link)) link(e);
      }}
    >
      <Link
        href={typeof link === "string" ? link : "/"}
        passHref
        target={selectionTest ? "_self" : "_blank"}
        className="flex w-full items-center h-12 px-5 py-3 md:px-3 md:py-2"
        onClick={onClickLink}
      >
        <MenuItemContent
          menu={menu}
          selected={selected}
          isSecondary={isSecondary}
        />
      </Link>
    </li>
  );
};

const MenuItemContent: FunctionComponent<{
  selected: boolean;
  menu: MainLayoutMenu;
  isSecondary?: boolean;
}> = ({ selected, menu, isSecondary }) => (
  <div
    className={classNames(
      "flex h-7 w-full items-center gap-4 transition-all duration-100 ease-in-out md:gap-2",
      selected
        ? "text-white-high"
        : isSecondary
          ? "text-osmoverse-400 hover:text-white-high"
          : "text-osmoverse-300 hover:text-white-high"
    )}
  >
    <div className="h-6 w-6">{menu.icon}</div>
    <div className="body2 w-full overflow-hidden">{menu.label}</div>
  </div>
);
