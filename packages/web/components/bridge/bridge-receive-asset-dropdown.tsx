import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { MinimalAsset } from "@osmosis-labs/types";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { SupportedAsset } from "~/components/bridge/use-bridges-supported-assets";
import { Tooltip } from "~/components/tooltip";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useStore } from "~/stores";

import { SupportedAssetWithAmount } from "./amount-and-review-screen";

interface BridgeReceiveAssetDropdownProps {
  direction: "deposit" | "withdraw";
  fromAsset: SupportedAssetWithAmount;
  toAsset: SupportedAsset;
  setToAsset: (asset: SupportedAsset) => void;
  assetsInOsmosis: MinimalAsset[];
  counterpartySupportedAssetsByChainId: Record<string, SupportedAsset[]>;
}

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
                              className={classNames(
                                "flex items-center gap-3 rounded-lg py-2 px-3 text-left data-[active]:bg-osmoverse-600",
                                isSelected && "bg-osmoverse-700"
                              )}
                              onClick={onClick}
                            >
                              <Image
                                src={asset.coinImageUrl ?? "/"}
                                alt={`${asset.coinDenom} logo`}
                                width={32}
                                height={32}
                              />
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
                      (asset, index, assets) => {
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

                        const revealAddress = assets[0].denom === asset.denom;

                        return (
                          <MenuItem key={asset.denom}>
                            <button
                              className={classNames(
                                "flex items-center gap-3 rounded-lg py-2 px-3 text-left data-[active]:bg-osmoverse-600",
                                isSelected && "bg-osmoverse-700"
                              )}
                              onClick={onClick}
                            >
                              <Image
                                src={representativeAsset.coinImageUrl ?? "/"}
                                alt={`${asset.denom} logo`}
                                width={32}
                                height={32}
                              />
                              <div className="flex flex-col">
                                <p className="body1 md:body2">
                                  {t("transfer.withdrawAs")} {asset.denom}
                                </p>
                                {isCanonicalAsset ? (
                                  <p className="body2 text-osmoverse-300">
                                    {t("transfer.recommended")}
                                  </p>
                                ) : revealAddress ? (
                                  <p className="body2 text-osmoverse-300">
                                    {asset.address}
                                  </p>
                                ) : null}
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
