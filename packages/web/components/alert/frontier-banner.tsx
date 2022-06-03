import Image from "next/image";
import { FunctionComponent, useState } from "react";
import { IS_FRONTIER } from "../../config";

export const FrontierBanner: FunctionComponent = () => {
  const [showBanner, setShowBanner] = useState(IS_FRONTIER);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      style={{
        zIndex: 1000,
        backgroundImage: "linear-gradient(to bottom, #F8C259 0%, #B38203 100%)",
      }}
      className="fixed flex place-content-evenly right-3 top-3 py-3 text-white-high md:w-[330px] w-[596px] z-50 rounded-2xl"
    >
      <button
        className="absolute w-[20px] -top-1.5 -left-1.5 cursor-pointer"
        onClick={() => setShowBanner(false)}
      >
        <Image
          alt="close"
          src="/icons/close-circle.svg"
          height={20}
          width={20}
        />
      </button>
      <div className="flex items-center md:px-1 px-2 md:gap-1 gap-4">
        <div className="shrink-0">
          <Image
            alt="info"
            src="/icons/info-white-emphasis.svg"
            height={20}
            width={20}
          />
        </div>
        <div className="flex flex-col gap-1">
          <h6 className="md:subtitle1">
            You{"'"}ve entered the Osmosis Frontier
          </h6>
          <div className="text-xs font-body flex flex-wrap gap-1">
            You{"'"}re viewing all permissionless assets.{" "}
            <a
              className="flex gap-2 items-center"
              href="https://app.osmosis.zone/"
              target="_self"
            >
              Click here to return to the main app.{" "}
              <Image
                alt="link"
                src="/icons/external-link-white.svg"
                height={10}
                width={10}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
