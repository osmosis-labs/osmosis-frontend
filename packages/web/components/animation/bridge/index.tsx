import { Menu } from "@headlessui/react";
import classNames from "classnames";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Icon } from "~/components/assets";
import {
  BaseBridgeProviderOption,
  TransferProps,
} from "~/components/complex/transfer";
import { CustomClasses } from "~/components/types";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { truncateString } from "~/utils/string";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface BridgeAnimationProps<
  BridgeProviderOption extends BaseBridgeProviderOption
> extends CustomClasses {
  transferPath: [
    { address: string; networkName: string; iconUrl?: string },
    { address: string; networkName: string; iconUrl?: string }
  ];
  bridgeProviders?: TransferProps<BridgeProviderOption>["bridgeProviders"];
  selectedBridgeProvidersId?: TransferProps<BridgeProviderOption>["selectedBridgeProvidersId"];
  onSelectBridgeProvider?: TransferProps<BridgeProviderOption>["onSelectBridgeProvider"];
}

/** Illustrates a bespoke or IBC bridge transfer for user info. */
export const BridgeAnimation = <
  BridgeProviderOption extends BaseBridgeProviderOption
>(
  props: BridgeAnimationProps<BridgeProviderOption>
) => {
  const {
    transferPath: [from, to],
    className,
    selectedBridgeProvidersId,
    bridgeProviders,
    onSelectBridgeProvider,
  } = props;
  const { isMobile } = useWindowSize();
  const { t } = useTranslation();

  const longFromName = from.networkName.length > 7;
  const longToName = to.networkName.length > 7;

  // constants
  const overlayedIconSize = isMobile
    ? { height: 36, width: 36 }
    : { height: 45, width: 45 };

  // dynamic load JSON animation data - keep base bundle small
  const [animData, setAnimData] = useState<object | null>(null);
  useEffect(() => {
    if (!animData) {
      import("./lottie-transfer.json").then(setAnimData);
    }
  }, [animData]);

  const selectedProvider = bridgeProviders?.find(
    (provider) => provider.id === selectedBridgeProvidersId
  );
  const filteredBridgeProviders = bridgeProviders?.filter(
    (provider) => provider.id !== selectedBridgeProvidersId
  );

  return (
    <div
      className={classNames(
        "relative h-[110px] w-[600px] md:w-[300px]",
        className
      )}
    >
      <div className="absolute left-[10%] h-full w-1/3 text-center md:left-[2.5%]">
        <span
          className={classNames(
            "whitespace-nowrap transition-opacity duration-300",
            longFromName || longToName
              ? isMobile
                ? "caption"
                : "subtitle1"
              : "md:subtitle2",
            longFromName
              ? "left-[90px] md:-left-[4px]"
              : "left-[122px] md:left-[10px]"
          )}
        >
          {t("assets.transfer.from")} {truncateString(from.networkName, 22)}
        </span>
      </div>

      <div className="absolute right-[10%] h-full w-1/3 text-center md:-right-[1%]">
        <span
          className={classNames(
            "w-fit whitespace-nowrap transition-opacity duration-300",
            longFromName || longToName
              ? isMobile
                ? "caption"
                : "subtitle1"
              : "md:subtitle2",
            "left-[405px] md:left-[210px]"
          )}
        >
          {t("assets.transfer.to")} {truncateString(to.networkName, 22)}
        </span>
      </div>

      <div className="absolute left-[105px] top-[20px] md:left-[30px]">
        <div className="transition-opacity duration-300">
          <Lottie
            style={{ height: isMobile ? 80 : 85, width: isMobile ? 255 : 400 }}
            animationData={animData}
            autoplay
            loop
          />
        </div>
      </div>
      {from.iconUrl && (
        <div className="absolute left-[139px] top-[40px] transition-opacity duration-300 md:left-[40px] md:top-[42px]">
          <Image alt="token icon" src={from.iconUrl} {...overlayedIconSize} />
        </div>
      )}
      {to.iconUrl && (
        <div className="absolute left-[424px] top-[40px] transition-opacity duration-300 md:left-[237px] md:top-[42px]">
          <Image alt="token icon" src={to.iconUrl} {...overlayedIconSize} />
        </div>
      )}
      {filteredBridgeProviders && selectedProvider && (
        <div
          className="absolute left-1/2 flex -translate-x-[33%] transform place-content-between items-center"
          title={t("assets.ibcTransfer.provider")}
        >
          {filteredBridgeProviders?.length === 0 ? (
            <p className="subtitle-2 flex flex-col items-center gap-4">
              <span className="rounded-lg bg-osmoverse-700 px-2 text-osmoverse-200">
                {selectedProvider.name}
              </span>
              <Image
                src={selectedProvider.logo}
                alt={`${selectedProvider.name} logo`}
                {...overlayedIconSize}
              />
            </p>
          ) : (
            <Menu>
              {({ open }) => (
                <div className="relative">
                  <Menu.Button className="flex flex-col items-center gap-4">
                    <div className="subtitle-2 flex items-center gap-1.5 rounded-lg bg-osmoverse-700 px-2 text-osmoverse-200">
                      {selectedProvider.name}
                      <Icon
                        className="flex shrink-0 items-center"
                        id={open ? "chevron-up" : "chevron-down"}
                        height={10}
                        width={10}
                      />
                    </div>
                    <Image
                      src={selectedProvider.logo}
                      alt={`${selectedProvider.name} logo`}
                      {...overlayedIconSize}
                    />
                  </Menu.Button>

                  <Menu.Items className="absolute top-1/3 -right-px mb-2 flex w-max select-none flex-col overflow-hidden rounded-xl border border-osmoverse-700 bg-osmoverse-700">
                    {filteredBridgeProviders.map((provider, index) => (
                      <Menu.Item key={provider.id}>
                        {({ active }) => (
                          <button
                            onClick={() => onSelectBridgeProvider?.(provider)}
                            className={classNames(
                              "flex cursor-pointer items-center gap-2 py-1 pl-2  pr-4 transition-colors",
                              {
                                "bg-osmoverse-600": active,
                                "rounded-b-xlinset":
                                  index === filteredBridgeProviders.length - 1,
                              }
                            )}
                          >
                            <div className="flex flex-shrink-0">
                              <Image
                                src={provider.logo}
                                alt={`${provider.name} logo`}
                                width={16}
                                height={16}
                              />
                            </div>
                            {provider.name}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </div>
              )}
            </Menu>
          )}
        </div>
      )}
    </div>
  );
};
