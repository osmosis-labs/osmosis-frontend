import Image from "next/image";
import { FunctionComponent, useState, useEffect } from "react";
import { IS_FRONTIER } from "../../config";

const LOCALSTORAGE_KEY = "show_frontier_banner";

export const FrontierBanner: FunctionComponent = () => {
  const [showBanner, setShowBannerLocal] = useState(IS_FRONTIER);

  const setShowBanner = (show: boolean) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(show));
    }
    setShowBannerLocal(show);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldShow = window.localStorage.getItem(LOCALSTORAGE_KEY);

      if (shouldShow) {
        try {
          const show = JSON.parse(shouldShow);
          setShowBannerLocal(show);
        } catch {
          console.error("Problem parsing", LOCALSTORAGE_KEY);
        }
      }
    }
  }, []);

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
        <div className="pt-1.5 mx-2 shrink-0">
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
