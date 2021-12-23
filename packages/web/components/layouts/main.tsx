import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import classNames from "classnames";

export type MainLayoutMenu = {
  // TODO
  // icon:string
  label: string;
  link: string;
  selectionTest: RegExp;
};

export type MainLayoutProps = React.PropsWithChildren<{
  menus: MainLayoutMenu[];
}>;

export function MainLayout({ children, menus }: MainLayoutProps) {
  const router = useRouter();

  return (
    <React.Fragment>
      <div className="fixed w-sidebar h-full bg-card flex flex-col">
        <ul className="px-[1rem]">
          {menus.map((menu, i) => {
            const selected = menu.selectionTest.test(router.pathname);

            return (
              <li key={i}>
                <Link href={menu.link} passHref>
                  <a>
                    <div
                      className={classNames(
                        "h-[3.75rem] flex flex-row items-center",
                        {
                          "text-white-high": selected,
                        }
                      )}
                    >
                      {menu.label}
                    </div>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="ml-sidebar">{children}</div>
    </React.Fragment>
  );
}
