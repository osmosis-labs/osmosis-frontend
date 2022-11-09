import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { IS_FRONTIER } from "../config";
import { useAmplitudeAnalytics } from "../hooks";
import { MainLayoutMenu } from "./types";

export const MainMenu: FunctionComponent<{
  menus: MainLayoutMenu[];
}> = ({ menus }) => {
  const router = useRouter();
  const { logEvent } = useAmplitudeAnalytics();

  return (
    <ul className="w-full flex flex-col gap-3 md:gap-0 mt-20 md:mt-0">
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
              onClick={(e) => {
                if (typeof link === "string" && !link.startsWith("http")) {
                  router.push(link);
                } else if (typeof link === "function") {
                  link(e);
                }
              }}
            >
              <Head>{selected && <title key="title">{label}</title>}</Head>
              <LinkOrDiv href={link}>
                <a
                  className={classNames(
                    "flex items-center hover:opacity-100",
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
                      "w-5 h-5 z-10",
                      selected ? "opacity-100" : "opacity-60"
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
                        "text-white-full/60 group-hover:text-white-mid":
                          !selected,
                      }
                    )}
                  >
                    {label}
                  </p>
                  {!selectionTest && typeof link === "string" && (
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
