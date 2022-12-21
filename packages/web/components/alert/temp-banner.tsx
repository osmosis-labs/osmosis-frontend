import Image from "next/image";
import { FunctionComponent, ReactElement } from "react";
import classNames from "classnames";
import { IS_FRONTIER } from "../../config";
import { useLocalStorageState } from "../../hooks";

/** Banner that displays a message once per closing to localStorage.  */
export const TempBanner: FunctionComponent<{
  title: string | ReactElement;
  message: string | ReactElement;
  localStorageKey: string;
  /** Ignore localstorage and always show banner. */
  shouldPersist?: boolean;
}> = ({ title, message, localStorageKey, shouldPersist = false }) => {
  const [showBanner, setShowBanner] = useLocalStorageState(
    localStorageKey,
    true
  );

  if (!showBanner && !shouldPersist) {
    return null;
  }

  return (
    <div
      style={{
        zIndex: 1000,
        backgroundImage: IS_FRONTIER
          ? "linear-gradient(to bottom, #F8C259 0%, #B38203 100%)"
          : undefined,
      }}
      className={classNames(
        "fixed right-3 top-3 flex w-[596px] place-content-between rounded-2xl text-white-high md:w-[330px]",
        {
          "bg-osmoverse-900": !IS_FRONTIER,
        },
        IS_FRONTIER ? "py-3" : "py-2"
      )}
    >
      {IS_FRONTIER && !shouldPersist && (
        <button
          className="absolute -top-1.5 -left-1.5 w-[20px] cursor-pointer"
          onClick={() => setShowBanner(false)}
        >
          <Image
            alt="close"
            src="/icons/close-circle.svg"
            height={20}
            width={20}
          />
        </button>
      )}
      <div className="flex w-full place-content-between items-center gap-4 px-2 md:gap-1 md:px-1">
        <div className="flex items-center gap-4 md:gap-1">
          <div className="mx-2 shrink-0 pt-1.5">
            <Image
              alt="info"
              src="/icons/info-white-emphasis.svg"
              height={20}
              width={20}
            />
          </div>
          <div className="flex flex-col gap-1">
            {typeof title === "string" ? (
              <h6 className="md:subtitle1">{title}</h6>
            ) : (
              <>{title}</>
            )}
            <div
              className={classNames("font-body gap-1 text-xs", {
                "text-white-mid": !IS_FRONTIER,
              })}
            >
              {message}
            </div>
          </div>
        </div>
        {!IS_FRONTIER && !shouldPersist && (
          <button
            className="flex w-[40px] shrink-0 cursor-pointer items-center"
            onClick={() => setShowBanner(false)}
          >
            <Image
              alt="close"
              src="/icons/close-circle-large.svg"
              height={40}
              width={40}
            />
          </button>
        )}
      </div>
    </div>
  );
};
