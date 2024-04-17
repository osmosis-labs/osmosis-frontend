import { Popover } from "@headlessui/react";
import { runIfFn } from "@osmosis-labs/utils";
import { isFunction } from "@osmosis-labs/utils";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useState,
} from "react";

import { Pill } from "~/components/indicators/pill";
import { AmplitudeEvent } from "~/config";
import { useTranslation, useWindowSize } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";

export type MainLayoutMenu = {
  label: string;
  link: string | MouseEventHandler;
  icon: ReactNode;
  selectionTest?: RegExp;
  amplitudeEvent?: AmplitudeEvent;
  isNew?: Boolean;
  badge?: ReactNode;
  secondaryLogo?: ReactNode;
  subtext?: string;
  showMore?: boolean;
};

export type MaybeRenderProp<P> =
  | React.ReactNode
  | ((props: P) => React.ReactNode);

export const MainMenu: FunctionComponent<{
  menus: MainLayoutMenu[];
  secondaryMenuItems: MainLayoutMenu[];
  className?: string;
}> = ({ menus, className, secondaryMenuItems }) => {
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
              if (isFunction(link)) link(e);
            }}
          >
            <MenuLink
              href={link}
              secondaryLogo={secondaryLogo}
              selectionTest={selectionTest}
              showMore={showMore}
            >
              {({ showSubTitle, selected }) =>
                showMore ? (
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
                )
              }
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
      className={classNames("w-full", {
        "h-12 px-5 py-3": !showMore,
      })}
      onMouseEnter={() => shouldShowHover && setShowSubTitle(true)}
      onMouseLeave={() => shouldShowHover && setShowSubTitle(false)}
      onClick={onClickLink}
    >
      {runIfFn(children, { showSubTitle, selected })}
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
  selected?: boolean;
  showSubTitle?: boolean;
  menu: MainLayoutMenu;
}> = ({ selected, showSubTitle, menu }) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const { label, icon, amplitudeEvent, isNew, badge, secondaryLogo, subtext } =
    menu;

  return (
    <div
      className={classNames(
        "hover:text-white flex h-7 w-full items-center gap-4 transition-all duration-300 ease-in-out",
        selected ? "text-white" : "text-osmoverse-300"
      )}
      onClick={() => {
        if (amplitudeEvent) {
          logEvent(amplitudeEvent);
        }
      }}
    >
      <div className="relative h-6 w-6">
        {/* Main Icon */}
        <div
          className={classNames(
            "transition-all duration-300 ease-in-out",
            showSubTitle ? "opacity-0" : "opacity-100"
          )}
        >
          {icon}
        </div>
        {/* Secondary Logo */}
        {secondaryLogo && (
          <div
            className={classNames(
              "absolute top-0 left-0 transition-all duration-300 ease-in-out",
              showSubTitle ? "opacity-100" : "opacity-0"
            )}
          >
            {secondaryLogo}
          </div>
        )}
      </div>
      <div
        className={classNames(
          "body2 w-full overflow-hidden overflow-x-hidden transition-all duration-300 ease-in-out"
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
                "flex w-full place-content-between items-center transition-transform duration-300 ease-in-out",
                { "-translate-y-0.5 transform": showSubTitle && subtext }
              )}
            >
              {label}
              {badge}
            </div>
            {subtext && (
              <div
                className={classNames(
                  "transition-visibility text-white-opacity-70 text-xs font-medium transition-opacity duration-300 ease-in-out",
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
