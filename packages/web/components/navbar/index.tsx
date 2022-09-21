import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { useStore } from "../../stores";
import { CustomClasses } from "../types";

export const NavBar: FunctionComponent<{ title: string } & CustomClasses> = ({
  title,
  className,
}) => {
  const { navBarStore } = useStore();

  return (
    <>
      <div
        className={classNames(
          "fixed z-[1000] flex place-content-between items-center bg-osmoverse h-[88px] w-[calc(100vw_-_12.875rem)] px-8",
          className
        )}
      >
        <h4>{title}</h4>

        <div className="flex items-center">
          <Button iconUrl="/icons/setting.svg" />
        </div>
      </div>
      {/* Back-layer element to occupy space for the caller */}
      <div className="bg-osmoverse h-[88px]" />
    </>
  );
};

const Button: FunctionComponent<{ iconUrl: string }> = ({ iconUrl }) => (
  <button>
    <Image alt="settings" src={iconUrl} height={24} width={24} />
  </button>
);
