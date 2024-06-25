import { Menu } from "@headlessui/react";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { BridgeChain } from "@osmosis-labs/bridge";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNil, isNumeric, noop } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, ReactNode, useEffect, useState } from "react";

import { Icon } from "~/components/assets";
import { BridgeNetworkSelect } from "~/components/bridge/immersive/bridge-network-select";
import { MoreBridgeOptions } from "~/components/bridge/immersive/more-bridge-options";
import { useBridgesSupportedAssets } from "~/components/bridge/immersive/use-bridges-supported-assets";
import { InputBox } from "~/components/input";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { useConnectWalletModalRedirect, useTranslation } from "~/hooks";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api } from "~/utils/trpc";

interface AmountScreenProps {
  direction: "deposit" | "withdraw";
  selectedDenom: string;

  /**
   * Includes both the canonical asset and its variants.
   */
  assetsInOsmosis: MinimalAsset[] | undefined;
}

export const AmountScreen = observer(
  ({ direction, assetsInOsmosis, selectedDenom }: AmountScreenProps) => {
    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);
    const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);
    const { t } = useTranslation();

    const { accountActionButton: connectWalletButton, walletConnected } =
      useConnectWalletModalRedirect(
        {
          className: "w-full",
        },
        noop
      );

    const [sourceAsset, setSourceAsset] = useState<MinimalAsset>();
    const [receiveAsset, setReceiveAsset] = useState<MinimalAsset>();
    const [fromChain, setFromChain] = useState<BridgeChain>();
    const [toChain, setToChain] = useState<BridgeChain>();

    const [inputUnit, setInputUnit] = useState<"crypto" | "fiat">("fiat");
    const [cryptoAmount, setCryptoAmount] = useState<string>("0");
    const [fiatAmount, setFiatAmount] = useState<string>("0");

    const { data: osmosisChain } = api.edge.chains.getChain.useQuery({
      findChainNameOrId: accountStore.osmosisChainId,
    });

    const canonicalAsset = assetsInOsmosis?.[0];
    const {
      price: assetInOsmosisPrice,
      isLoading: isLoadingCanonicalAssetPrice,
    } = usePrice(receiveAsset);

    const { supportedAssetsByChainId, supportedChains } =
      useBridgesSupportedAssets({
        assets: assetsInOsmosis,
        chain: {
          chainId: accountStore.osmosisChainId,
          chainType: "cosmos",
        },
      });

    useEffect(() => {
      if (!isNil(assetsInOsmosis) && setReceiveAsset) {
        // TODO: Get canonical asset from supported assets
        setReceiveAsset(
          assetsInOsmosis.find((asset) => asset.coinDenom === selectedDenom)!
        );
      }
    }, [assetsInOsmosis, selectedDenom]);

    useEffect(() => {
      if (isNil(toChain) && !isNil(osmosisChain)) {
        setToChain({
          chainId: osmosisChain.chain_id,
          chainName: osmosisChain.pretty_name,
          chainType: "cosmos",
        });
      }
    }, [accountStore.osmosisChainId, osmosisChain, toChain]);

    useEffect(() => {
      if (isNil(toChain) && !isNil(osmosisChain)) {
        setToChain({
          chainId: osmosisChain.chain_id,
          chainName: osmosisChain.pretty_name,
          chainType: "cosmos",
        });
      }
    }, [accountStore.osmosisChainId, osmosisChain, toChain]);

    useEffect(() => {
      if (isNil(fromChain) && !isNil(supportedChains)) {
        const firstChain = supportedChains[0];
        setFromChain({
          chainId: firstChain.chainId,
          chainName: firstChain.prettyName,
          chainType: firstChain.chainType,
        } as BridgeChain);
      }
    }, [fromChain, supportedChains]);

    if (
      isLoadingCanonicalAssetPrice ||
      isNil(supportedAssetsByChainId) ||
      !assetsInOsmosis ||
      !canonicalAsset ||
      !assetInOsmosisPrice ||
      !fromChain ||
      !toChain
    ) {
      return <AmountScreenSkeletonLoader />;
    }

    const cryptoAmountPretty = new CoinPretty(
      canonicalAsset,
      cryptoAmount === ""
        ? new Dec(0)
        : new Dec(cryptoAmount).mul(
            DecUtils.getTenExponentN(canonicalAsset.coinDecimals)
          )
    );

    const fiatAmountPretty = new PricePretty(
      DEFAULT_VS_CURRENCY,
      new Dec(fiatAmount === "" ? 0 : fiatAmount)
    );

    const supportedAssets =
      supportedAssetsByChainId[
        direction === "deposit" ? fromChain.chainId : toChain.chainId
      ];

    const parseFiatAmount = (value: string) => {
      return value.replace("$", "");
    };

    const formatFiatAmount = (value: string) => {
      return `$${value}`;
    };

    const onInput = (type: "fiat" | "crypto") => (value: string) => {
      let nextValue = type === "fiat" ? parseFiatAmount(value) : value;
      if (!isNumeric(nextValue) && nextValue !== "") return;

      if (nextValue.startsWith("0") && !nextValue.startsWith("0.")) {
        nextValue = nextValue.slice(1);
      }
      if (nextValue === "") {
        nextValue = "0";
      }
      if (nextValue === ".") {
        nextValue = "0.";
      }

      if (type === "fiat") {
        // Update the crypto amount based on the fiat amount
        const priceInFiat = assetInOsmosisPrice.toDec();
        const nextFiatAmount = new Dec(nextValue);
        const nextCryptoAmount = nextFiatAmount.quo(priceInFiat).toString();

        setCryptoAmount(trimPlaceholderZeros(nextCryptoAmount));
      } else {
        // Update the fiat amount based on the crypto amount
        const priceInFiat = assetInOsmosisPrice.toDec();
        const nextCryptoAmount = new Dec(nextValue);
        const nextFiatAmount = nextCryptoAmount.mul(priceInFiat).toString();

        setFiatAmount(trimPlaceholderZeros(nextFiatAmount));
      }

      type === "fiat" ? setFiatAmount(nextValue) : setCryptoAmount(nextValue);
    };

    const dropdownActiveItemIcon = (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ammelia-400">
        <Icon id="check-mark" className="text-osmoverse-700" width={14} />
      </div>
    );

    return (
      <div className="mx-auto flex w-full flex-col items-center justify-center p-4 text-white-full">
        <h5 className="mb-6 flex items-center justify-center gap-3">
          <span>
            {direction === "deposit"
              ? t("transfer.deposit")
              : t("transfer.withdraw")}
          </span>{" "}
          <Image
            width={32}
            height={32}
            src={canonicalAsset.coinImageUrl ?? "/"}
            alt="token image"
          />{" "}
          <span>{canonicalAsset.coinDenom}</span>
        </h5>

        <div className="mb-6 flex w-full flex-col gap-2">
          <div className="flex w-full gap-2">
            <span className="body1 flex-1 text-osmoverse-300">
              {t("transfer.fromNetwork")}
            </span>
            <Icon id="arrow-right" className="invisible" />
            <span className="body1 flex-1 text-osmoverse-300">
              {t("transfer.toNetwork")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ChainSelectorButton
              chainLogo={""}
              chains={supportedChains}
              onSelectChain={(nextChain) => {
                setFromChain(nextChain);
              }}
              readonly={direction === "withdraw"}
            >
              {fromChain.chainName}
            </ChainSelectorButton>

            <Icon id="arrow-right" className="text-osmoverse-300" />

            <ChainSelectorButton
              chainLogo=""
              chains={supportedChains}
              onSelectChain={(nextChain) => {
                setToChain(nextChain);
              }}
              readonly={direction === "deposit"}
            >
              {toChain.chainName}
            </ChainSelectorButton>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6">
          <div className="relative flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="text-center text-4xl font-bold">
                {inputUnit === "fiat" ? (
                  <>
                    <InputBox
                      currentValue={formatFiatAmount(fiatAmount)}
                      onInput={onInput("fiat")}
                      classes={{ input: "text-center" }}
                      className="mr-4 border-none bg-transparent text-center"
                    />
                  </>
                ) : (
                  <div className="flex items-center">
                    <p className="ml-1 w-full text-right align-middle text-2xl text-osmoverse-500">
                      {cryptoAmountPretty?.denom}
                    </p>
                    <InputBox
                      currentValue={cryptoAmount}
                      onInput={onInput("crypto")}
                      className="w-full border-none bg-transparent text-center"
                      classes={{
                        input: "px-0",
                        trailingSymbol:
                          "ml-1 align-middle text-2xl text-osmoverse-500 text-left absolute right-0",
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="relative flex w-full justify-center">
                <button
                  className="body1 flex items-center gap-2 text-center text-wosmongton-200"
                  onClick={() => {
                    setInputUnit(inputUnit === "fiat" ? "crypto" : "fiat");
                  }}
                >
                  <span>
                    {inputUnit === "fiat" ? (
                      <>
                        {trimPlaceholderZeros(
                          cryptoAmountPretty?.toDec().toString(2) ?? "0"
                        )}{" "}
                        {cryptoAmountPretty?.denom}
                      </>
                    ) : (
                      fiatAmountPretty.maxDecimals(2).toString()
                    )}
                  </span>
                  <span>
                    <Icon
                      id="switch"
                      className="text-wosmongton-200"
                      width={16}
                      height={16}
                    />
                  </span>
                </button>

                <button className="body2 absolute right-0 top-1/2 -translate-y-1/2 transform rounded-5xl border border-osmoverse-700 py-2 px-3 text-wosmongton-200 transition duration-200 hover:border-osmoverse-850 hover:bg-osmoverse-850 hover:text-white-full">
                  {t("transfer.max")}
                </button>
              </div>
            </div>
          </div>

          {supportedAssets.length > 1 && (
            <div className="flex flex-wrap items-center justify-between rounded-2xl bg-osmoverse-1000">
              {supportedAssets.map(({ denom }, index) => {
                const isActive = denom === supportedAssets[0].denom;
                return (
                  <button
                    key={index}
                    className={classNames(
                      "subtitle1 flex w-1/3 flex-col items-center rounded-lg py-3 px-2",
                      {
                        "bg-osmoverse-825 text-wosmongton-100": isActive,
                        "text-osmoverse-100": !isActive,
                      }
                    )}
                  >
                    <span>{denom}</span>
                    <span className="body2 text-osmoverse-300">0.00$</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="body1 text-osmoverse-300">
              {direction === "deposit"
                ? t("transfer.transferWith")
                : t("transfer.transferTo")}
            </span>
            <div className="flex items-center gap-2 rounded-lg">
              <img
                src={wallet?.walletInfo.logo}
                alt={wallet?.walletInfo.prettyName}
                className="h-6 w-6"
              />
              <span>{wallet?.walletInfo.prettyName}</span>
              <Icon
                id="chevron-down"
                width={12}
                height={12}
                className="text-osmoverse-300"
              />
            </div>
          </div>

          {!isNil(assetsInOsmosis) && assetsInOsmosis.length > 1 && (
            <Menu>
              {({ open }) => (
                <div className="relative w-full">
                  <Menu.Button className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="body1 text-osmoverse-300">
                          {t("transfer.receiveAsset")}
                        </span>
                        <Tooltip
                          content={
                            <div>
                              <h1 className="caption mb-1">
                                {t("transfer.receiveAsset")}
                              </h1>
                              <p className="caption text-osmoverse-300">
                                {t("transfer.receiveAssetDescription")}
                              </p>
                            </div>
                          }
                        >
                          <Icon id="info" width={16} />
                        </Tooltip>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="body1 text-white-full">
                          {receiveAsset?.coinDenom}
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
                  </Menu.Button>

                  <Menu.Items className="absolute top-full right-0 z-[1000] mt-3 flex max-h-64 flex-col gap-1 overflow-auto rounded-2xl bg-osmoverse-825 px-2 py-2">
                    {assetsInOsmosis.map((asset, index) => {
                      const onClick = () => {
                        setReceiveAsset(asset);
                      };

                      const isConvert =
                        asset.coinMinimalDenom === asset.variantGroupKey;
                      const isSelected =
                        receiveAsset?.coinDenom === asset.coinDenom;

                      // Is canonical asset
                      if (index === 0) {
                        return (
                          <Menu.Item key={asset.coinDenom}>
                            <button
                              className={classNames(
                                "flex items-center justify-between gap-3 rounded-lg py-2 px-3 text-left hover:bg-osmoverse-800",
                                isSelected && "bg-osmoverse-700"
                              )}
                              onClick={onClick}
                            >
                              <div className="flex items-center gap-2">
                                <Image
                                  src={asset.coinImageUrl ?? "/"}
                                  alt={`${asset.coinDenom} logo`}
                                  width={32}
                                  height={32}
                                />
                                <div className="flex flex-col">
                                  <p className="body1">
                                    {isConvert
                                      ? t("transfer.convertTo")
                                      : t("transfer.depositAs")}{" "}
                                    {asset.coinDenom}
                                  </p>
                                  <p className="body2 text-osmoverse-300">
                                    {t("transfer.recommended")}
                                  </p>
                                </div>
                              </div>
                              {isSelected && dropdownActiveItemIcon}
                            </button>
                          </Menu.Item>
                        );
                      }

                      return (
                        <Menu.Item key={asset.coinDenom}>
                          <button
                            className={classNames(
                              "flex items-center gap-3 rounded-lg py-2 px-3 hover:bg-osmoverse-800",
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
                            <p className="body1">
                              {isConvert
                                ? t("transfer.convertTo")
                                : t("transfer.depositAs")}{" "}
                              {asset.coinDenom}
                            </p>
                            {isSelected && dropdownActiveItemIcon}
                          </button>
                        </Menu.Item>
                      );
                    })}
                  </Menu.Items>
                </div>
              )}
            </Menu>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Spinner className="text-wosmongton-500" />
              <span className="body1 text-osmoverse-300">
                {t("transfer.estimatingTime")}
              </span>
            </div>

            <span className="body1 text-osmoverse-300">
              {t("transfer.calculatingFees")}
            </span>
          </div>

          <div className="flex flex-col items-center gap-4">
            {!walletConnected ? (
              connectWalletButton
            ) : (
              <>
                <Button className="w-full text-h6 font-h6">
                  {direction === "deposit"
                    ? t("transfer.reviewDeposit")
                    : t("transfer.reviewWithdraw")}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-lg font-h6 text-wosmongton-200 hover:text-white-full"
                  onClick={() => setIsMoreOptionsVisible(true)}
                >
                  {direction === "deposit"
                    ? t("transfer.moreDepositOptions")
                    : t("transfer.moreWithdrawOptions")}
                </Button>
                <MoreBridgeOptions
                  type={direction}
                  isOpen={isMoreOptionsVisible}
                  // TODO: Use the receive asset when implemented
                  asset={canonicalAsset}
                  onRequestClose={() => setIsMoreOptionsVisible(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

const ChainSelectorButton: FunctionComponent<{
  readonly: boolean;
  children: ReactNode;
  chainLogo: string;
  chains: ReturnType<typeof useBridgesSupportedAssets>["supportedChains"];
  onSelectChain: (chain: BridgeChain) => void;
}> = ({ readonly, children, chainLogo: _chainLogo, chains, onSelectChain }) => {
  const [isNetworkSelectVisible, setIsNetworkSelectVisible] = useState(false);

  if (readonly) {
    return (
      <div className="subtitle1 flex-1 rounded-[48px] border border-osmoverse-700 py-2 px-4 text-osmoverse-200">
        {children}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setIsNetworkSelectVisible(true);
        }}
        className="subtitle1 group flex flex-1 items-center justify-between rounded-[48px] bg-osmoverse-825 py-2 px-4 text-start transition-colors duration-200 hover:bg-osmoverse-850"
      >
        <span>{children}</span>
        <Icon
          id="chevron-down"
          className="text-wosmongton-200 transition-colors duration-200 group-hover:text-white-full"
          width={12}
          height={12}
        />
      </button>
      {!isNil(chains) && !isNil(onSelectChain) && (
        <BridgeNetworkSelect
          isOpen={isNetworkSelectVisible}
          chains={chains}
          onSelectChain={(chain) => {
            onSelectChain(chain);
            setIsNetworkSelectVisible(false);
          }}
          onRequestClose={() => setIsNetworkSelectVisible(false)}
        />
      )}
    </>
  );
};

const AmountScreenSkeletonLoader = () => {
  return (
    <div className="flex flex-col items-center gap-6">
      <SkeletonLoader className="h-8 w-full max-w-sm" />
      <SkeletonLoader className="h-20 w-full" />
      <SkeletonLoader className="h-24 w-full" />
      <SkeletonLoader className="h-24 w-full" />
      <SkeletonLoader className="h-6 w-full" />
      <SkeletonLoader className="h-6 w-full" />
      <SkeletonLoader className="h-14 w-full" />
      <SkeletonLoader className="h-14 w-full" />
    </div>
  );
};
