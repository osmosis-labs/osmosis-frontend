import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import type { Bridge } from "@osmosis-labs/bridge";
import { MinimalAsset } from "@osmosis-labs/types";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { SupportedAsset } from "~/components/bridge/use-bridges-supported-assets";
import { Tooltip } from "~/components/tooltip";
import { EntityImage } from "~/components/ui/entity-image";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { getLogoURIs } from "~/utils/logo-uri";

import { SupportedAssetWithAmount } from "./amount-and-review-screen";

interface BridgeReceiveAssetDropdownProps {
  direction: "deposit" | "withdraw";
  fromAsset: SupportedAssetWithAmount;
  toAsset: SupportedAsset;
  setToAsset: (asset: SupportedAsset) => void;
  assetsInOsmosis: MinimalAsset[];
  counterpartySupportedAssetsByChainId: Record<string, SupportedAsset[]>;
}

/**
 * Map a bridge provider id to a short, user-facing route name. Used to tell
 * apart withdraw variants that share the same counterparty denom (e.g. the
 * Nomic and Int3face routes both report `denom: "BTC"`, and the Wormhole and
 * Int3face routes both report `denom: "SOL"`), where the only real
 * differentiator is which bridge performs the transfer. Includes the named
 * custom bridges; generic routers (Skip/Squid/IBC) stay unlabeled.
 */
const bridgeRouteName: Partial<Record<Bridge, string>> = {
  Nomic: "Nomic",
  Int3face: "Int3face",
  Wormhole: "Wormhole",
};

/**
 * Resolve a short, user-facing route name for a withdraw row, given the
 * currently-selected Osmosis variant. Returns the first named bridge from the
 * row's `supportedVariants[fromAddress]` map, or undefined for generic routes.
 *
 * Each row is one destination address, and rows are keyed/deduped per address,
 * so a row carries at most one named bridge — picking the first match is
 * unambiguous. (A destination denom can have several named bridges, e.g. SOL
 * via Wormhole and via Int3face, but those are separate rows.)
 */
const getWithdrawRouteLabel = (
  asset: SupportedAsset,
  fromAddress: string
): string | undefined => {
  const bridge = Object.keys(asset.supportedVariants[fromAddress] ?? {}).find(
    (bridge) => bridgeRouteName[bridge as Bridge]
  );
  return bridge ? bridgeRouteName[bridge as Bridge] : undefined;
};

export const BridgeReceiveAssetDropdown: FunctionComponent<BridgeReceiveAssetDropdownProps> =
  observer(
    ({
      direction,
      fromAsset,
      toAsset,
      setToAsset,
      assetsInOsmosis,
      counterpartySupportedAssetsByChainId,
    }) => {
      const { logEvent } = useAmplitudeAnalytics();
      const { accountStore } = useStore();
      const { t } = useTranslation();

      return (
        <Menu>
          {({ open }) => (
            <div className="relative w-full">
              <MenuButton className="w-full">
                <div className="flex items-center justify-between">
                  <Tooltip
                    content={
                      <div>
                        <h1 className="caption mb-1">
                          {t("transfer.receiveAsset")}
                        </h1>
                        <p className="caption text-osmoverse-300">
                          {direction === "deposit"
                            ? t("transfer.depositAssetDescription")
                            : t("transfer.withdrawAssetDescription")}
                        </p>
                      </div>
                    }
                    enablePropagation
                  >
                    <div className="flex items-center gap-2">
                      <span className="body1 md:body2 text-osmoverse-300">
                        {t("transfer.receiveAsset")}
                      </span>
                      <Icon
                        className={classNames("opacity-0 transition-opacity", {
                          "opacity-100":
                            direction === "deposit"
                              ? toAsset.address ===
                                Object.keys(fromAsset.supportedVariants)[0]
                              : toAsset.address ===
                                counterpartySupportedAssetsByChainId[
                                  toAsset.chainId
                                ].map(({ address }) => address)[0],
                        })}
                        id="generate-stars"
                        width={24}
                      />
                    </div>
                  </Tooltip>

                  <div className="flex items-center gap-2">
                    <span className="subtitle1 md:body2 text-white-full">
                      {toAsset?.denom}
                    </span>
                    <Icon
                      id="chevron-down"
                      width={12}
                      height={12}
                      className={classNames(
                        "text-osmoverse-300 transition-transform duration-150",
                        {
                          "rotate-180": open,
                        }
                      )}
                    />
                  </div>
                </div>
              </MenuButton>

              <MenuItems className="absolute top-full right-0 z-[1000] mt-3 flex max-h-64 min-w-[285px] flex-col gap-1 overflow-auto rounded-2xl bg-osmoverse-825 px-2 py-2">
                {direction === "deposit" ? (
                  <>
                    {Object.keys(fromAsset.supportedVariants).map(
                      (variantCoinMinimalDenom, index) => {
                        const asset = assetsInOsmosis.find(
                          (asset) =>
                            asset.coinMinimalDenom === variantCoinMinimalDenom
                        )!;

                        const onClick = () => {
                          logEvent([EventName.DepositWithdraw.variantSelected]);
                          setToAsset({
                            chainType: "cosmos",
                            address: asset.coinMinimalDenom,
                            decimals: asset.coinDecimals,
                            chainId: accountStore.osmosisChainId,
                            denom: asset.coinDenom,
                            supportedVariants: {},
                            transferTypes: [],
                          });
                        };

                        const isConvert =
                          false ??
                          asset.coinMinimalDenom === asset.variantGroupKey;
                        const isSelected =
                          toAsset?.address === asset.coinMinimalDenom;

                        const isCanonicalAsset = index === 0;

                        return (
                          <MenuItem key={asset.coinDenom}>
                            <button
                              type="button"
                              className={classNames(
                                "flex items-center gap-3 rounded-lg py-2 px-3 text-left data-[active]:bg-osmoverse-600",
                                isSelected && "bg-osmoverse-700"
                              )}
                              onClick={onClick}
                            >
                              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                                <EntityImage
                                  logoURIs={getLogoURIs(asset.coinImageUrl)}
                                  name={asset.coinName}
                                  symbol={asset.coinDenom}
                                  width={32}
                                  height={32}
                                />
                              </div>
                              <div className="flex flex-col">
                                <p className="body1 md:body2">
                                  {isConvert
                                    ? t("transfer.convertTo")
                                    : t("transfer.depositAs")}{" "}
                                  {asset.coinDenom}
                                </p>
                                {isCanonicalAsset && (
                                  <p className="body2 text-osmoverse-300">
                                    {t("transfer.recommended")}
                                  </p>
                                )}
                              </div>
                            </button>
                          </MenuItem>
                        );
                      }
                    )}
                  </>
                ) : (
                  <>
                    {counterpartySupportedAssetsByChainId[toAsset.chainId].map(
                      (asset, index) => {
                        const onClick = () => {
                          setToAsset(asset);
                        };

                        const isSelected = toAsset?.address === asset.address;

                        const isCanonicalAsset = index === 0;
                        const representativeAsset =
                          assetsInOsmosis.find(
                            (a) =>
                              a.coinMinimalDenom === asset.address ||
                              asset.denom === a.coinDenom
                          ) ?? assetsInOsmosis[0];

                        const routeLabel = getWithdrawRouteLabel(
                          asset,
                          fromAsset.address
                        );

                        return (
                          <MenuItem key={asset.address}>
                            <button
                              className={classNames(
                                "flex items-center gap-3 rounded-lg py-2 px-3 text-left data-[active]:bg-osmoverse-600",
                                isSelected && "bg-osmoverse-700"
                              )}
                              onClick={onClick}
                            >
                              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                                <EntityImage
                                  logoURIs={getLogoURIs(
                                    representativeAsset.coinImageUrl
                                  )}
                                  name={asset.denom}
                                  symbol={asset.denom}
                                  width={32}
                                  height={32}
                                />
                              </div>
                              <div className="flex flex-col">
                                <p className="body1 md:body2">
                                  {t("transfer.withdrawAs")} {asset.denom}
                                  {routeLabel
                                    ? ` ${t("transfer.withdrawViaRoute", {
                                        route: routeLabel,
                                      })}`
                                    : ""}
                                </p>
                                {isCanonicalAsset && (
                                  <p className="body2 text-osmoverse-300">
                                    {t("transfer.recommended")}
                                  </p>
                                )}
                              </div>
                            </button>
                          </MenuItem>
                        );
                      }
                    )}
                  </>
                )}
              </MenuItems>
            </div>
          )}
        </Menu>
      );
    }
  );
