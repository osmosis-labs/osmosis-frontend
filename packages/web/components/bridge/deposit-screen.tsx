import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { isNumeric } from "@osmosis-labs/utils";
import classNames from "classnames";
import { FunctionComponent, ReactNode, useState } from "react";

import { Icon } from "~/components/assets";
import { BridgeNetworkSelect } from "~/components/bridge/bridge-network-select";
import { MoreDepositOptions } from "~/components/bridge/more-deposit-options";
import { InputBox } from "~/components/input";
import { Spinner } from "~/components/loaders";
import { Button } from "~/components/ui/button";
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api } from "~/utils/trpc";

export const DepositScreen = () => {
  const {
    accountStore,
    chainStore: {
      osmosis: { chainId },
    },
  } = useStore();
  const wallet = accountStore.getWallet(chainId);
  const [isMoreOptionsVisible, setIsMoreOptionsVisible] = useState(false);

  const { data: asset, isLoading } = api.edge.assets.getAssetWithPrice.useQuery(
    {
      findMinDenomOrSymbol: "USDC",
    }
  );
  const { data: osmosisChain } = api.edge.chains.getChain.useQuery({
    findChainNameOrId: "osmosis",
  });
  const { data: nobleChain } = api.edge.chains.getChain.useQuery({
    findChainNameOrId: "noble",
  });

  const [inputUnit, setInputUnit] = useState<"crypto" | "fiat">("fiat");
  const [cryptoAmount, setCryptoAmount] = useState<string>("0");
  const [fiatAmount, setFiatAmount] = useState<string>("0");

  if (isLoading || !asset || !osmosisChain || !nobleChain) {
    return null;
  }

  const cryptoAmountPretty = new CoinPretty(
    asset,
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
      const priceInFiat = asset.currentPrice.toDec();
      const nextFiatAmount = new Dec(nextValue);
      const nextCryptoAmount = nextFiatAmount
        .quo(priceInFiat)
        .mul(DecUtils.getTenExponentN(asset.coinDecimals))
        .toString();

      setCryptoAmount(trimPlaceholderZeros(nextCryptoAmount));
    } else {
      // Update the fiat amount based on the crypto amount
      const priceInFiat = asset.currentPrice.toDec();
      const nextCryptoAmount = new Dec(nextValue);
      const nextFiatAmount = nextCryptoAmount.mul(priceInFiat).toString();

      setFiatAmount(trimPlaceholderZeros(nextFiatAmount));
    }

    type === "fiat" ? setFiatAmount(nextValue) : setCryptoAmount(nextValue);
  };

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col items-center justify-center p-4 text-white-full">
      <h5 className="mb-6 flex items-center justify-center gap-3">
        <span>Deposit</span>{" "}
        <img className="h-8 w-8" src={asset.coinImageUrl} alt="token image" />{" "}
        <span>{asset.coinDenom}</span>
      </h5>

      <div className="mb-6 flex w-full flex-col gap-2">
        <div className="flex w-full gap-2">
          <span className="body1 flex-1 text-osmoverse-300">From network</span>
          {/* Render to match the height of the right arrow for the network selectors */}
          <Icon id="arrow-right" className="invisible" />
          <span className="body1 flex-1 text-osmoverse-300">To network</span>
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
                      cryptoAmountPretty?.toDec().toString() ?? "0"
                    )}{" "}
                    {cryptoAmountPretty?.denom}
                  </>
                ) : (
                  fiatAmountPretty.toString()
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
            Max
          </button>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-osmoverse-1000">
          {[
            {
              label: "USDC.e",
              amount: "$80.00 available",
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
          <span className="body1 text-osmoverse-300">Transfer with</span>
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Spinner className="text-wosmongton-500" />
            <span className="body1 text-osmoverse-300">Estimating time</span>
          </div>

          <span className="body1 text-osmoverse-300">Calculating fees</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button className="w-full text-h6 font-h6">Review deposit</Button>
          <Button
            variant="ghost"
            className="w-full text-lg font-h6 text-wosmongton-200 hover:text-white-full"
            onClick={() => setIsMoreOptionsVisible(true)}
          >
            More deposit options
          </Button>
          <MoreDepositOptions
            isOpen={isMoreOptionsVisible}
            onRequestClose={() => setIsMoreOptionsVisible(false)}
          />
        </div>
      </div>
    </div>
  );
};

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
