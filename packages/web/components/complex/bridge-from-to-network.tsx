import { Menu } from "@headlessui/react";
import { truncateString } from "@osmosis-labs/utils";
import classNames from "classnames";
import Image from "next/image";

import { BridgeAnimation } from "~/components/animation/bridge";
import { Icon } from "~/components/assets";
import {
  BaseBridgeProviderOption,
  TransferProps,
} from "~/components/complex/transfer";
import { CustomClasses } from "~/components/types";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";

interface BridgeFromToNetworkProps<
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

export const BridgeFromToNetwork = <
  BridgeProviderOption extends BaseBridgeProviderOption
>(
  props: BridgeFromToNetworkProps<BridgeProviderOption>
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

  // constants
  const overlayedIconSize = isMobile
    ? { height: 36, width: 36 }
    : { height: 45, width: 45 };

  const selectedProvider = bridgeProviders?.find(
    (provider) => provider.id === selectedBridgeProvidersId
  );
  const filteredBridgeProviders = bridgeProviders?.filter(
    (provider) => provider.id !== selectedBridgeProvidersId
  );

  return (
    <div
      className={classNames(
        "relative flex w-full flex-col text-osmoverse-400",
        className
      )}
    >
      <BridgeAnimation />

      <div className="flex flex-1 text-center">
        {/* From Network */}
        <div className="z-10 flex flex-1 flex-col items-center gap-4 pl-4 md:pl-8 sm:pl-0">
          <span
            className={classNames(
              "whitespace-nowrap text-osmoverse-100 transition-opacity duration-300",
              "md:subtitle2"
            )}
          >
            {t("assets.transfer.from")} {truncateString(from.networkName, 22)}
          </span>

          {from.iconUrl && (
            <div
              className="transition-opacity duration-300"
              style={overlayedIconSize}
            >
              <Image
                alt="token icon"
                src={from.iconUrl}
                {...overlayedIconSize}
              />
            </div>
          )}
        </div>

        {/* Provider select */}
        {filteredBridgeProviders && selectedProvider && (
          <div
            className="absolute left-1/2 z-20 flex -translate-x-[33%] transform place-content-between items-center sm:top-[60%] sm:-translate-x-1/2"
            title={t("assets.ibcTransfer.provider")}
          >
            {filteredBridgeProviders?.length === 0 ? (
              <p className="subtitle-2 flex flex-col items-center gap-4 sm:gap-2">
                <span className="rounded-lg bg-osmoverse-700 px-2 text-osmoverse-200 sm:order-2">
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
                                    index ===
                                    filteredBridgeProviders.length - 1,
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

        {/* To Network */}
        <div className="z-10 flex flex-1 flex-col items-center gap-4 pr-5 text-center md:pr-8 sm:pr-0">
          <span
            className={classNames(
              "w-fit whitespace-nowrap text-osmoverse-100 transition-opacity duration-300",
              "md:subtitle2"
            )}
          >
            {t("assets.transfer.to")} {truncateString(to.networkName, 22)}
          </span>
          {to.iconUrl && (
            <div
              className="transition-opacity duration-300"
              style={overlayedIconSize}
            >
              <Image alt="token icon" src={to.iconUrl} {...overlayedIconSize} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
