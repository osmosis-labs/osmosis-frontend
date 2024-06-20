import { Menu } from "@headlessui/react";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNumeric } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, ReactNode, useState } from "react";

import { Icon } from "~/components/assets";
import { BridgeNetworkSelect } from "~/components/bridge/immersive/bridge-network-select";
import { MoreBridgeOptions } from "~/components/bridge/immersive/more-bridge-options";
import { InputBox } from "~/components/input";
import { Spinner } from "~/components/loaders";
import { Tooltip } from "~/components/tooltip";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { usePrice } from "~/hooks/queries/assets/use-price";
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api } from "~/utils/trpc";

interface AmountScreenProps {
  type: "deposit" | "withdraw";
  assetInOsmosis: MinimalAsset;
}

export const AmountScreen = observer(
  ({ type, assetInOsmosis }: AmountScreenProps) => {
    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);
    const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);
    const { t } = useTranslation();

    const { data: osmosisChain } = api.edge.chains.getChain.useQuery({
      findChainNameOrId: "osmosis",
    });
    const { data: nobleChain } = api.edge.chains.getChain.useQuery({
      findChainNameOrId: "noble",
    });

    const { price: assetInOsmosisPrice, isLoading } = usePrice(assetInOsmosis);

    const [inputUnit, setInputUnit] = useState<"crypto" | "fiat">("fiat");
    const [cryptoAmount, setCryptoAmount] = useState<string>("0");
    const [fiatAmount, setFiatAmount] = useState<string>("0");

    // TODO: Add skeleton loaders
    if (
      isLoading ||
      !assetInOsmosis ||
      !assetInOsmosisPrice ||
      !osmosisChain ||
      !nobleChain
    ) {
      return null;
    }

    const cryptoAmountPretty = new CoinPretty(
      assetInOsmosis,
      cryptoAmount === "" ? new Dec(0) : cryptoAmount
    );
    const fiatAmountPretty = new PricePretty(
      DEFAULT_VS_CURRENCY,
      new Dec(fiatAmount === "" ? 0 : fiatAmount)
    );

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
        const nextCryptoAmount = nextFiatAmount
          .quo(priceInFiat)
          .mul(DecUtils.getTenExponentN(assetInOsmosis.coinDecimals))
          .toString();

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

    return (
      <div className="mx-auto flex w-full flex-col items-center justify-center p-4 text-white-full">
        <h5 className="mb-6 flex items-center justify-center gap-3">
          <span>
            {type === "deposit"
              ? t("transfer.deposit")
              : t("transfer.withdraw")}
          </span>{" "}
          <Image
            width={32}
            height={32}
            src={assetInOsmosis.coinImageUrl ?? "/"}
            alt="token image"
          />{" "}
          <span>{assetInOsmosis.coinDenom}</span>
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
            <ChainSelectorButton chainLogo={""}>
              {nobleChain.pretty_name}
            </ChainSelectorButton>

            <Icon id="arrow-right" className="text-osmoverse-300" />

            <ChainSelectorButton chainLogo="" readonly>
              {osmosisChain.pretty_name}
            </ChainSelectorButton>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6">
          <div className="relative flex items-center justify-center px-16">
            <div className="flex flex-col items-center justify-self-center">
              <div className="flex items-center text-center text-4xl font-bold">
                {inputUnit === "fiat" ? (
                  <>
                    <InputBox
                      inputClassName="text-center"
                      currentValue={formatFiatAmount(fiatAmount)}
                      onInput={onInput("fiat")}
                      className="mr-4 border-none bg-transparent text-center"
                    />
                  </>
                ) : (
                  <>
                    <InputBox
                      rightEntry
                      currentValue={cryptoAmount}
                      onInput={onInput("crypto")}
                      className="border-none bg-transparent text-center"
                      trailingSymbol={
                        <span className="ml-1 mr-6 align-middle text-2xl text-osmoverse-500">
                          {cryptoAmountPretty?.denom}
                        </span>
                      }
                    />
                  </>
                )}
              </div>
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
            </div>

            <button className="body2 absolute right-0 rounded-5xl border border-osmoverse-700 py-2 px-3 text-wosmongton-200 transition duration-200 hover:border-osmoverse-850 hover:bg-osmoverse-850 hover:text-white-full">
              {t("transfer.max")}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-osmoverse-1000">
            {[
              {
                label: "USDC.e",
                amount: `$80.00 ${t("transfer.available")}`,
                active: true,
              },
              { label: "USDC", amount: "$30.00", active: false },
              { label: "USDC.axl", amount: "$10.00", active: false },
            ].map(({ label, amount, active }, index) => (
              <button
                key={index}
                className={classNames(
                  "subtitle1 flex w-full flex-col items-center rounded-lg p-2",
                  {
                    "bg-osmoverse-825 text-wosmongton-100": active,
                    "text-osmoverse-100": !active,
                  }
                )}
              >
                <span>{label}</span>
                <span className="body2 text-osmoverse-300">{amount}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <span className="body1 text-osmoverse-300">
              {type === "deposit"
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
                      <span className="body1 text-white-full">USDC</span>
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

                <Menu.Items className="absolute top-full right-0 z-[1000] mt-3 flex flex-col gap-1 rounded-2xl bg-osmoverse-825 px-2 py-2">
                  <Menu.Item>
                    <button className="flex items-center gap-3 rounded-lg bg-osmoverse-700 py-2 px-3 text-left">
                      <Image
                        src={assetInOsmosis.coinImageUrl ?? "/"}
                        alt={`${assetInOsmosis.coinDenom} logo`}
                        width={32}
                        height={32}
                      />
                      <div className="flex flex-col">
                        <p className="body1">
                          {t("transfer.convertTo")} {assetInOsmosis.coinDenom}
                        </p>
                        <p className="body2 text-osmoverse-300">
                          {t("transfer.recommended")}
                        </p>
                      </div>
                      <div className="ml-10 flex h-6 w-6 items-center justify-center rounded-full bg-ammelia-400">
                        <Icon
                          id="check-mark"
                          className="text-osmoverse-700"
                          width={14}
                        />
                      </div>
                    </button>
                  </Menu.Item>
                  <Menu.Item>
                    <button className="flex items-center gap-3 rounded-lg py-2 px-3 hover:bg-osmoverse-800">
                      {/* TODO: Add network suffix icon */}
                      <Image
                        src={assetInOsmosis.coinImageUrl ?? "/"}
                        alt={`${assetInOsmosis.coinDenom} logo`}
                        width={32}
                        height={32}
                      />
                      <p className="body1">
                        {t("transfer.convertTo")} {assetInOsmosis.coinDenom}.e
                      </p>
                    </button>
                  </Menu.Item>
                </Menu.Items>
              </div>
            )}
          </Menu>

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
            <Button className="w-full text-h6 font-h6">
              {type === "deposit"
                ? t("transfer.reviewDeposit")
                : t("transfer.reviewWithdraw")}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-lg font-h6 text-wosmongton-200 hover:text-white-full"
              onClick={() => setIsMoreOptionsVisible(true)}
            >
              {type === "deposit"
                ? t("transfer.moreDepositOptions")
                : t("transfer.moreWithdrawOptions")}
            </Button>
            <MoreBridgeOptions
              type={type}
              isOpen={isMoreOptionsVisible}
              onRequestClose={() => setIsMoreOptionsVisible(false)}
            />
          </div>
        </div>
      </div>
    );
  }
);

const ChainSelectorButton: FunctionComponent<{
  readonly?: boolean;
  children: ReactNode;
  chainLogo: string;
}> = ({ readonly, children, chainLogo: _chainLogo }) => {
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
      <BridgeNetworkSelect
        isOpen={isNetworkSelectVisible}
        onRequestClose={() => setIsNetworkSelectVisible(false)}
      />
    </>
  );
};
