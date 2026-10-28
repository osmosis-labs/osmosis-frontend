import { runIfFn } from "@osmosis-labs/utils";
import { isFunction } from "@osmosis-labs/utils";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  MouseEventHandler,
  ReactNode,
  useState,
} from "react";

import { Pill } from "~/components/indicators/pill";
import { useTranslation } from "~/hooks";

export type MainLayoutMenu = {
  label: string;
  link: string | MouseEventHandler;
  icon: ReactNode;
  selectionTest?: RegExp;
  isNew?: boolean;
  badge?: ReactNode;
  secondaryLogo?: ReactNode;
  subtext?: string;
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
  const { link, selectionTest, secondaryLogo } = menu;

  return (
    <li
      className="flex cursor-pointer items-center"
      onClick={(e) => {
        if (isFunction(link)) link(e);
      }}
    >
      <MenuLink
        href={link}
        secondaryLogo={secondaryLogo}
        selectionTest={selectionTest}
      >
        {({ showSubTitle, selected }) => (
          <MenuItemContent
            menu={menu}
            selected={selected}
            showSubTitle={showSubTitle}
            isSecondary={isSecondary}
          />
        )}
      </MenuLink>
    </li>
  );
};

type MaybeRenderProp<P> = React.ReactNode | ((props: P) => React.ReactNode);

const MenuLink: FunctionComponent<{
  href: string | any;
  secondaryLogo?: React.ReactNode;
  children: MaybeRenderProp<{ showSubTitle: boolean; selected: boolean }>;
  selectionTest?: RegExp;
}> = ({ href, children, secondaryLogo, selectionTest }) => {
  const router = useRouter();
  const [showSubTitle, setShowSubTitle] = useState(false);
  const shouldShowHover = !!secondaryLogo;

  const onClickLink = (e: React.MouseEvent) => {
    // If href is a string, do nothing and let the Link handle the navigation
    if (!isFunction(href)) return;

    e.preventDefault();
    href(e);
  };

  const selected = selectionTest ? selectionTest.test(router.pathname) : false;

  const hoverHandlers = {
    onMouseEnter: () => shouldShowHover && setShowSubTitle(true),
    onMouseLeave: () => shouldShowHover && setShowSubTitle(false),
  };

  return (
    <Link
      href={typeof href === "string" ? href : "/"}
      passHref
      target={selectionTest ? "_self" : "_blank"}
      className="flex w-full items-center h-12 px-5 py-3 md:px-3 md:py-2"
      {...hoverHandlers}
      onClick={onClickLink}
    >
      {runIfFn(children, { showSubTitle, selected })}
    </Link>
  );
};

const MenuItemContent: React.FC<{
  selected?: boolean;
  showSubTitle?: boolean;
  menu: MainLayoutMenu;
  isSecondary?: boolean;
}> = ({ selected, showSubTitle, menu, isSecondary }) => {
  const { t } = useTranslation();

  const { label, icon, isNew, badge, secondaryLogo, subtext } = menu;

  return (
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
      <div className="relative h-6 w-6">
        {/* Main Icon */}
        <div
          className={classNames(
            "transition-all duration-100 ease-in-out",
            showSubTitle ? "opacity-0" : "opacity-100"
          )}
        >
          {icon}
        </div>
        {/* Secondary Logo */}
        {secondaryLogo && (
          <div
            className={classNames(
              "absolute top-0 left-0 transition-all duration-100 ease-in-out",
              showSubTitle ? "opacity-100" : "opacity-0"
            )}
          >
            {secondaryLogo}
          </div>
        )}
      </div>
      <div
        className={classNames(
          "body2 w-full overflow-hidden overflow-x-hidden transition-all duration-100 ease-in-out"
        )}
      >
        {isNew ? (
          <div className="flex w-full items-center justify-between">
            {label}
            <Pill>
              <span className="button px-2 py-[2px]">{t("menu.new")}</span>
            </Pill>
          </div>
        ) : (
          <>
            <div
              className={classNames(
                "flex w-full place-content-between items-center transition-transform duration-100 ease-in-out",
                { "-translate-y-0.5 transform": showSubTitle && subtext }
              )}
            >
              {label}
              {badge}
            </div>
            {subtext && (
              <div
                className={classNames(
                  "transition-visibility text-white-opacity-70 text-xs font-medium transition-opacity duration-100 ease-in-out",
                  showSubTitle && subtext
                    ? "visible h-5 opacity-100"
                    : "invisible h-0 opacity-0"
                )}
              >
                {subtext}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
