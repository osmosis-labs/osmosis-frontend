import classNames from "classnames";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import { Announcement, AnnouncementInterface } from "~/config";
import { useDisclosure, useTranslation } from "~/hooks";
import { ExternalLinkModal, handleExternalLink } from "~/modals";
import { noop } from "~/utils/function";

// We need to use a localstorage solution that gets the value on first call, as opposed to useLocalStorageState, that uses `useEffect`
const useLocalStorage = (key: string, initialValue: any) => {
  const storedValue =
    typeof window !== "undefined" ? localStorage?.getItem(key) : null;
  const initial = storedValue ? JSON.parse(storedValue) : initialValue;

  const [value, setValue] = useState(initial);

  const updateValue = (newValue: any) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, updateValue];
};

const useAnnouncement = (): [AnnouncementInterface | undefined, () => void] => {
  const router = useRouter();

  // prevent SSR to render an Announcement
  const [csr, setCsr] = useState(false);

  const [announcementState, setAnnouncementState] = useLocalStorage(
    Announcement?.localStorageKey || "announcement.warning",
    true
  );

  useEffect(() => {
    setCsr(true);
  }, [setCsr]);

  if (Announcement === undefined || csr === false) {
    return [undefined, noop];
  }

  const matchesRoute =
    !Announcement.pageRoute || router.pathname === Announcement.pageRoute;
  return [
    matchesRoute && announcementState ? Announcement : undefined,
    () => {
      setAnnouncementState(false);
    },
  ];
};

export const AnnouncementBanner: FunctionComponent<{
  backElementClassNames?: string;
}> = ({ backElementClassNames }) => {
  const [announcement, closeBanner] = useAnnouncement();
  const { t } = useTranslation();
  const {
    isOpen: isLeavingOsmosisOpen,
    onClose: onCloseLeavingOsmosis,
    onOpen: onOpenLeavingOsmosis,
  } = useDisclosure();

  if (!announcement) {
    return (
      <div
        className={classNames(
          "bg-osmoverse-900",
          "h-navbar md:h-navbar-mobile",
          backElementClassNames
        )}
      />
    );
  }

  const { link, enTextOrLocalizationPath, isWarning, persistent, bg } =
    announcement;

  const linkText = t(
    link?.enTextOrLocalizationKey ?? "Click here to learn more"
  );

  const handleLeaveClick = () =>
    handleExternalLink({
      url: link?.url ?? "",
      openModal: onOpenLeavingOsmosis,
    });

  return (
    <>
      <div
        className={classNames(
          "bg-osmoverse-900",
          "h-[124px]",
          backElementClassNames
        )}
      />
      <div
        className={classNames(
          "fixed top-[71px] z-[51] float-right my-auto ml-sidebar flex w-[calc(100vw_-_14.58rem)] items-center px-8 py-[14px] md:top-[57px] md:ml-0 md:w-full sm:gap-3 sm:px-2",
          {
            "bg-gradient-negative": isWarning,
            "bg-gradient-neutral": !isWarning,
          },
          bg
        )}
      >
        <div className="flex w-full place-content-center items-center gap-1.5 text-center text-subtitle1 lg:gap-1 lg:text-xs lg:tracking-normal md:text-left md:text-xxs sm:items-start">
          <span>{t(enTextOrLocalizationPath)}</span>
          {Boolean(link) && (
            <div className="flex cursor-pointer items-center gap-2">
              {link?.isExternal ? (
                <button className="underline" onClick={handleLeaveClick}>
                  {linkText}
                </button>
              ) : (
                <a
                  className="underline"
                  href={link?.url}
                  rel="noreferrer"
                  // target="_blank"
                >
                  {linkText}
                </a>
              )}
              <Icon id="arrow-right" height={24} width={24} />
            </div>
          )}
        </div>
        {!persistent && !isWarning && (
          <IconButton
            className="flex w-fit cursor-pointer items-center py-0 text-white-full"
            onClick={closeBanner}
            aria-label="Close"
            icon={<Icon id="close-small" height={24} width={24} />}
            size="unstyled"
            mode="unstyled"
          />
        )}
        {link?.isExternal && (
          <ExternalLinkModal
            url={link.url}
            onRequestClose={onCloseLeavingOsmosis}
            isOpen={isLeavingOsmosisOpen}
          />
        )}
      </div>
    </>
  );
};

export default AnnouncementBanner;
