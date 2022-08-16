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
        "fixed flex place-content-evenly right-3 top-3 text-white-high md:w-[330px] w-[596px] rounded-2xl",
        {
          "border border-enabledGold": !IS_FRONTIER,
          "bg-background": !IS_FRONTIER,
        },
        IS_FRONTIER ? "py-3" : "py-2"
      )}
    >
      {IS_FRONTIER && (
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
      )}
      <div className="flex items-center md:px-1 px-2 md:gap-1 gap-4">
        <div className="pt-1.5 mx-2 shrink-0">
          <Image
            alt="info"
            src={
              IS_FRONTIER
                ? "/icons/info-white-emphasis.svg"
                : "/icons/info-secondary-200.svg"
            }
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
            className={classNames("text-xs font-body gap-1", {
              "text-white-mid": !IS_FRONTIER,
            })}
          >
            {message}
          </div>
        </div>
        {!IS_FRONTIER && (
          <button
            className="shrink-0 w-[40px] cursor-pointer"
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
