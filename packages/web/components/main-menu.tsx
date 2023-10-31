import { Popover } from "@headlessui/react";
import { isMobile } from "@walletconnect/browser-utils";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";

import { Pill } from "~/components/indicators/pill";
import { MainLayoutMenu } from "~/components/types";
import { useTranslation } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { ExternalLinkModal } from "~/modals/external-links-modal";

const MenuLink: FunctionComponent<{
  href: string | any;
  secondaryLogo?: React.ReactNode;
  children: (showSecondary: boolean) => React.ReactNode;
  selectionTest?: RegExp;
  displayExternalModal?: boolean;
  showMore?: boolean;
}> = ({
  href,
  children,
  secondaryLogo,
  selectionTest,
  displayExternalModal,
  showMore,
}) => {
  const [showSecondary, setShowSecondary] = useState(false);
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // component has mounted. Needed because of NextJS SSR.
  }, []);

  const shouldShowHover = !!secondaryLogo;

  const handleLinkClick = (e: React.MouseEvent) => {
    if (displayExternalModal) {
      e.preventDefault();
      setShowExternalModal(true);
    } else if (typeof href === "function") {
      e.preventDefault();
      href(e);
    }
    // If href is a string, do nothing and let the Link handle the navigation
  };

  if (isMounted && showMore && isMobile()) {
    return null; // Don't render more menu on mobile per discussion with Syed.
  }

  return (
    <Link
      href={typeof href === "string" ? href : "/"}
      passHref
      target={selectionTest ? "_self" : "_blank"}
      className="h-full w-full flex-shrink flex-grow"
    >
      <div
        className={`${!showMore && "h-12 px-4 py-3"}`}
        onMouseEnter={() => shouldShowHover && setShowSecondary(true)}
        onMouseLeave={() => shouldShowHover && setShowSecondary(false)}
        onClick={handleLinkClick}
      >
        {children(showSecondary)}
      </div>
      {displayExternalModal && typeof href === "string" && (
        <ExternalLinkModal
          url={href}
          isOpen={showExternalModal}
          onRequestClose={() => {
            setShowExternalModal(false);
          }}
        />
      )}
    </Link>
  );
};

const MorePopover: FunctionComponent<{
  item: MainLayoutMenu;
  secondaryMenus: MainLayoutMenu[];
}> = ({ item, secondaryMenus }) => {
  return (
    <Popover className="relative flex">
      <Popover.Button className="h-full w-full px-4 py-3 focus:outline-none">
        <MenuItemContent menu={item} />
      </Popover.Button>
      <Popover.Panel className="top-navbar-mobile absolute top-[-10px] right-[20px] flex w-52 flex-col gap-2 rounded-3xl bg-osmoverse-800 py-4 px-3">
        {secondaryMenus.map((menu: MainLayoutMenu) => {
          const {
            link,
            selectionTest,
            secondaryLogo,
            displayExternalModal,
            showMore,
          } = menu;
          return (
            <MenuLink
              href={link}
              secondaryLogo={secondaryLogo}
              selectionTest={selectionTest}
              displayExternalModal={displayExternalModal}
              showMore={showMore}
              key={menu.label}
            >
              {() => <MenuItemContent menu={menu} />}
            </MenuLink>
          );
        })}
      </Popover.Panel>
    </Popover>
  );
};

const MenuItemContent: React.FC<{
  selected?: Boolean;
  showSecondary?: Boolean;
  menu: MainLayoutMenu;
}> = ({ selected, showSecondary, menu }) => {
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
            showSecondary ? "opacity-0" : "opacity-100"
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
            showSecondary ? "opacity-100" : "opacity-0"
          }`}
        >
          {secondaryLogo}
        </div>
      </div>
      <div
        className={classNames(
          "max-w-24 ml-2.5 overflow-hidden overflow-x-hidden text-base font-semibold transition-all transition-transform duration-300 ease-in-out",
          {
            "text-white-full/60 group-hover:text-white-mid": !selected,
            "w-full": isNew || Boolean(badge),
          }
        )}
      >
        {isNew ? (
          <div className="flex items-center justify-between">
            {label}
            <Pill>
              <span className="button px-[8px] py-[2px]">{t("menu.new")}</span>
            </Pill>
          </div>
        ) : (
          <>
            <div
              className={`flex items-center justify-between transition-transform duration-300 ease-in-out ${
                showSecondary && subtext ? "-translate-y-0.5 transform" : ""
              }`}
            >
              {label}
              {badge}
            </div>
            <div
              className={`transition-visibility transition-opacity duration-300 ease-in-out ${
                showSecondary && subtext
                  ? "visible h-5 opacity-100"
                  : "invisible h-0 opacity-0"
              } text-white-opacity-70 mt-1 text-sm`}
            >
              {subtext}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const MainMenu: FunctionComponent<{
  onClickItem?: () => void;
  menus: MainLayoutMenu[];
  secondaryMenuItems: MainLayoutMenu[];
  className?: string;
}> = ({ menus, onClickItem, className, secondaryMenuItems }) => {
  const router = useRouter();

  return (
    <ul
      className={classNames(
        "mt-20 flex w-full flex-col gap-3 md:mt-0 md:gap-0",
        className
      )}
    >
      {menus.map((menu, index) => {
        const {
          link,
          selectionTest,
          secondaryLogo,
          displayExternalModal,
          showMore,
        } = menu;
        const selected = selectionTest
          ? selectionTest.test(router.pathname)
          : false;

        return (
          <li
            key={index}
            className={classNames("flex cursor-pointer items-center", {
              "rounded-full bg-osmoverse-700": selected,
            })}
            onClick={(e) => {
              onClickItem?.();

              if (typeof link === "function") {
                link(e);
              }
            }}
          >
            <MenuLink
              href={link}
              secondaryLogo={secondaryLogo}
              selectionTest={selectionTest}
              displayExternalModal={displayExternalModal}
              showMore={showMore}
            >
              {(showSecondary: Boolean) => {
                if (showMore) {
                  return (
                    <MorePopover
                      item={menu}
                      secondaryMenus={secondaryMenuItems}
                    />
                  );
                } else {
                  return (
                    <MenuItemContent
                      menu={menu}
                      selected={selected}
                      showSecondary={showSecondary}
                    />
                  );
                }
              }}
            </MenuLink>
          </li>
        );
      })}
    </ul>
  );
};
