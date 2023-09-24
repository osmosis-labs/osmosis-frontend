import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { Pill } from "~/components/indicators/pill";
import { MainLayoutMenu } from "~/components/types";
import { useAmplitudeAnalytics } from "~/hooks";

export const MainMenu: FunctionComponent<{
  onClickItem?: () => void;
  menus: MainLayoutMenu[];
  className?: string;
}> = ({ menus, onClickItem, className }) => {
  const router = useRouter();
  const { logEvent } = useAmplitudeAnalytics();

  const t = useTranslation();

  return (
    <ul
      className={classNames(
        "mt-20 flex w-full flex-col gap-3 md:mt-0 md:gap-0",
        className
      )}
    >
      {menus.map(
        (
          {
            label,
            link,
            icon,
            iconSelected,
            selectionTest,
            amplitudeEvent,
            isNew,
            badge,
          },
          index
        ) => {
          const selected = selectionTest
            ? selectionTest.test(router.pathname)
            : false;

          return (
            <li
              key={index}
              className={classNames(
                "flex cursor-pointer items-center px-4 py-3",
                {
                  "rounded-full bg-osmoverse-700": selected,
                }
              )}
              onClick={(e) => {
                onClickItem?.();
                if (typeof link === "string" && !link.startsWith("http")) {
                  router.push(link);
                } else if (typeof link === "function") {
                  link(e);
                }
              }}
            >
              <LinkOrDiv href={link}>
                <a
                  className={classNames(
                    "flex w-full items-center hover:opacity-100",
                    selected ? "opacity-100" : "opacity-75"
                  )}
                  target={selectionTest ? "_self" : "_blank"}
                  href={
                    typeof link === "string" && link.startsWith("http")
                      ? link
                      : undefined
                  }
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (amplitudeEvent) {
                      logEvent(amplitudeEvent);
                    }
                  }}
                >
                  <div
                    className={classNames(
                      "z-10 h-5 w-5",
                      selected ? "opacity-100" : "opacity-60"
                    )}
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
                  <div
                    className={classNames(
                      "max-w-24 ml-2.5 overflow-x-hidden text-base font-semibold transition-all",
                      {
                        "text-white-full/60 group-hover:text-white-mid":
                          !selected,
                        "w-full": isNew || Boolean(badge),
                      }
                    )}
                  >
                    {isNew ? (
                      <div className="flex items-center justify-between">
                        {label}
                        <Pill>
                          <span className="button px-[8px] py-[2px]">
                            {t("new")}
                          </span>
                        </Pill>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        {label}
                        {badge}
                      </div>
                    )}
                  </div>
                  {!selectionTest && typeof link === "string" && (
                    <div className="ml-2 shrink-0">
                      <Icon
                        id="external-link"
                        aria-label="external link"
                        width={12}
                        height={12}
                      />
                    </div>
                  )}
                </a>
              </LinkOrDiv>
            </li>
          );
        }
      )}
    </ul>
  );
};

const LinkOrDiv: FunctionComponent<{ href: string | any }> = ({
  href,
  children,
}) =>
  typeof href === "string" && !href.startsWith("http") ? (
    <Link href={href} passHref>
      {children}
    </Link>
  ) : (
    <>{children}</>
  );
