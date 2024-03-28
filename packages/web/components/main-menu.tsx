import { Popover } from "@headlessui/react";
import { runIfFn } from "@osmosis-labs/utils";
import { isFunction } from "@osmosis-labs/utils";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";

import { Pill } from "~/components/indicators/pill";
import { MainLayoutMenu } from "~/components/types";
import { useTranslation, useWindowSize } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";

export type MaybeRenderProp<P> =
  | React.ReactNode
  | ((props: P) => React.ReactNode);

export const MainMenu: FunctionComponent<{
  onClickItem?: () => void;
  menus: MainLayoutMenu[];
  secondaryMenuItems: MainLayoutMenu[];
  className?: string;
}> = ({ menus, onClickItem, className, secondaryMenuItems }) => {
  return (
    <ul
      className={classNames(
        "mt-20 flex w-full flex-col gap-3 md:mb-0 md:mt-0 md:gap-0",
        className
      )}
    >
      {menus.map((menu, index) => {
        const { link, selectionTest, secondaryLogo, showMore } = menu;

        return (
          <li
            key={index}
            className="flex cursor-pointer items-center"
            onClick={(e) => {
              onClickItem?.();
              if (isFunction(link)) link(e);
            }}
          >
            <MenuLink
              href={link}
              secondaryLogo={secondaryLogo}
              selectionTest={selectionTest}
              showMore={showMore}
            >
              {({ showSubTitle, selected }) => (
                <>
                  {showMore ? (
                    <MorePopover
                      item={menu}
                      secondaryMenus={secondaryMenuItems}
                    />
                  ) : (
                    <MenuItemContent
                      menu={menu}
                      selected={selected}
                      showSubTitle={showSubTitle}
                    />
                  )}
                </>
              )}
            </MenuLink>
          </li>
        );
      })}
    </ul>
  );
};

const MenuLink: FunctionComponent<{
  href: string | any;
  secondaryLogo?: React.ReactNode;
  children: MaybeRenderProp<{ showSubTitle: boolean; selected: boolean }>;
  selectionTest?: RegExp;
  showMore?: boolean;
}> = ({ href, children, secondaryLogo, selectionTest, showMore }) => {
  const router = useRouter();
  const [showSubTitle, setShowSubTitle] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { isMobile } = useWindowSize();

  useEffect(() => {
    setIsMounted(true); // component has mounted. Needed because of NextJS SSR.
  }, []);

  const shouldShowHover = !!secondaryLogo;

  const onClickLink = (e: React.MouseEvent) => {
    // If href is a string, do nothing and let the Link handle the navigation
    if (!isFunction(href)) return;

    e.preventDefault();
    href(e);
  };

  if (isMounted && showMore && isMobile) {
    return null; // Don't render more menu on mobile per discussion with Syed.
  }

  const selected = selectionTest ? selectionTest.test(router.pathname) : false;

  return (
    <Link
      href={typeof href === "string" ? href : "/"}
      passHref
      target={selectionTest ? "_self" : "_blank"}
      className={classNames("h-full w-full flex-shrink flex-grow", {
        "rounded-full bg-osmoverse-700": selected,
      })}
    >
      <div
        className={showMore ? undefined : "flex h-12 items-center px-3 py-3"}
        onMouseEnter={() => shouldShowHover && setShowSubTitle(true)}
        onMouseLeave={() => shouldShowHover && setShowSubTitle(false)}
        onClick={onClickLink}
      >
        {runIfFn(children, { showSubTitle, selected })}
      </div>
    </Link>
  );
};

const MorePopover: FunctionComponent<{
  item: MainLayoutMenu;
  secondaryMenus: MainLayoutMenu[];
}> = ({ item, secondaryMenus }) => {
  return (
    <Popover className="relative flex">
      {({ open }) => (
        <>
          <Popover.Button
            className={classNames(
              "h-full w-full px-4 py-3 focus:outline-none",
              open && "rounded-full bg-osmoverse-800"
            )}
          >
            <MenuItemContent menu={item} selected={open} />
          </Popover.Button>
          <Popover.Panel className="top-navbar-mobile absolute bottom-[3.5rem] flex w-full flex-col gap-2 rounded-3xl bg-osmoverse-800 py-2 px-2">
            {secondaryMenus.map((menu: MainLayoutMenu) => {
              const { link, selectionTest, secondaryLogo, showMore } = menu;
              return (
                <MenuLink
                  href={link}
                  secondaryLogo={secondaryLogo}
                  selectionTest={selectionTest}
                  showMore={showMore}
                  key={menu.label}
                >
                  <MenuItemContent menu={menu} />
                </MenuLink>
              );
            })}
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

const MenuItemContent: React.FC<{
  selected?: Boolean;
  showSubTitle?: Boolean;
  menu: MainLayoutMenu;
}> = ({ selected, showSubTitle, menu }) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const {
    label,
    icon,
    iconSelected,
    amplitudeEvent,
    isNew,
    badge,
    secondaryLogo,
    subtext,
  } = menu;

  return (
    <div
      role="link" // this makes it keyboard accessible
      tabIndex={0}
      className={classNames(
        "flex h-7 w-full items-center hover:opacity-100",
        selected ? "opacity-100" : "opacity-75"
      )}
      onClick={() => {
        if (amplitudeEvent) {
          logEvent(amplitudeEvent);
        }
      }}
    >
      <div className="relative h-5 w-5">
        {/* Main Icon */}
        <div
          className={`absolute top-0 left-0 transition-opacity duration-300 ease-in-out ${
            showSubTitle ? "opacity-0" : "opacity-100"
          }`}
        >
          {typeof icon === "string" ? (
            <Image
              src={iconSelected ?? icon}
              width={20}
              height={20}
              alt="menu icon"
            />
          ) : (
            icon
          )}
        </div>
        {/* Secondary Logo */}
        <div
          className={`absolute top-0 left-0 transition-opacity duration-300 ease-in-out ${
            showSubTitle ? "opacity-100" : "opacity-0"
          }`}
        >
          {secondaryLogo}
        </div>
      </div>
      <div
        className={classNames(
          "max-w-24 ml-2.5 overflow-hidden overflow-x-hidden font-semibold transition-all duration-300 ease-in-out",
          {
            "text-white-full/60 group-hover:text-white-mid": !selected,
            "w-full": isNew || Boolean(badge),
          }
        )}
      >
        {isNew ? (
          <div className="flex w-full items-center justify-between">
            {label}
            <Pill>
              <span className="button px-[8px] py-[2px]">{t("menu.new")}</span>
            </Pill>
          </div>
        ) : (
          <>
            <div
              className={`flex items-center justify-between transition-transform duration-300 ease-in-out ${
                showSubTitle && subtext ? "-translate-y-0.5 transform" : ""
              }`}
            >
              {label}
              {badge}
            </div>
            <div
              className={`transition-visibility mt-0 transition-opacity duration-300 ease-in-out ${
                showSubTitle && subtext
                  ? "visible h-5 opacity-100"
                  : "invisible h-0 opacity-0"
              } text-white-opacity-70 text-xs font-medium`}
            >
              {subtext}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
