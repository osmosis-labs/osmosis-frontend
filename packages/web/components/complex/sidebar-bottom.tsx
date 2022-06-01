import Image from "next/image";
import { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { WalletStatus } from "@keplr-wallet/stores";
import { PricePretty, Dec } from "@keplr-wallet/unit";
import { useStore } from "../../stores";
import { IS_FRONTIER } from "../../config";

export const SidebarBottom: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();

  const account = accountStore.getAccount(chainStore.osmosis.chainId);
  const queries = queriesStore.get(chainStore.osmosis.chainId);
  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);
  const osmoPrice = fiat
    ? new PricePretty(
        fiat,
        new Dec(
          priceStore.getPrice(
            chainStore.osmosis.stakeCurrency.coinGeckoId ?? "osmosis"
          ) ?? 0
        )
      )
    : undefined;

  return (
    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
      {osmoPrice && (
        <div className="flex place-content-between text-caption mb-4">
          <div className="flex gap-2">
            <div>
              <Image alt="osmo" src="/tokens/osmo.svg" height={24} width={24} />
            </div>
            <span className="my-auto">
              {chainStore.osmosis.stakeCurrency.coinDenom.toUpperCase()}
            </span>
          </div>
          <span className="my-auto">{osmoPrice.toString()}</span>
        </div>
      )}
      <div className="w-full">
        {account.walletStatus === WalletStatus.Loaded ? (
          <div>
            <div className="flex items-center mb-2">
              <div className="p-4">
                <Image
                  src="/icons/wallet.svg"
                  alt="wallet"
                  width={20}
                  height={20}
                />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-white-high text-base">
                  {account.name}
                </p>
                <p className="opacity-50 text-white-emphasis text-sm">
                  {queries.queryBalances
                    .getQueryBech32Address(account.bech32Address)
                    .stakable.balance.trim(true)
                    .maxDecimals(2)
                    .shrink(true)
                    .upperCase(true)
                    .toString()}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                account.disconnect();
              }}
              className="button bg-transparent border border-opacity-30 border-secondary-200 h-9 w-full rounded-md py-2 px-1 flex items-center justify-center mb-5"
            >
              <Image
                src="/icons/sign-out-secondary.svg"
                alt="sign-out"
                width={20}
                height={20}
              />
              <p className="text-sm max-w-24 ml-3 text-secondary-200 font-semibold overflow-x-hidden truncate transition-all">
                Sign Out
              </p>
            </button>
          </div>
        ) : (
          <button
            className="button flex items-center justify-center w-full h-9 py-3.5 rounded-md bg-primary-200 mb-5"
            onClick={(e) => {
              e.preventDefault();
              account.init();
            }}
          >
            <Image
              src="/icons/wallet.svg"
              alt="connect wallet icon"
              width={20}
              height={20}
            />
            <span className="ml-2.5 text-white-high font-semibold">
              Connect Wallet
            </span>
          </button>
        )}
      </div>
      {IS_FRONTIER ? (
        <p className="py-2 text-base text-white-high text-left flex items-center place-content-evenly">
          <a
            href="https://medium.com/osmosis/introducing-osmosis-frontier-d9da158b22d0"
            target="_blank"
            rel="noreferrer"
          >
            Learn More <br /> About the <br />
            <span
              style={{
                background: "-webkit-linear-gradient(#F8C259, #B38203)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
              }}
            >
              Osmosis Frontier
            </span>
          </a>
          <div className="w-[12px]">
            <Image
              alt="link"
              src="/icons/link-deco-white.svg"
              height={12}
              width={12}
            />
          </div>
        </p>
      ) : (
        <Links />
      )}
    </div>
  );
});

const Links: FunctionComponent = () => (
  <>
    <div className="flex place-content-between transition-all overflow-x-hidden w-full">
      <a
        href="https://twitter.com/osmosiszone"
        target="_blank"
        className="opacity-80 hover:opacity-100 cursor-pointer m-auto"
        rel="noreferrer"
      >
        <Image src="/icons/twitter.svg" alt="twitter" width={32} height={32} />
      </a>
      <a
        href="https://medium.com/@Osmosis"
        target="_blank"
        className="opacity-80 hover:opacity-100 cursor-pointer px-1 m-auto"
        rel="noreferrer"
      >
        <Image src="/icons/medium.svg" alt="medium" width={36} height={36} />
      </a>
      <a
        href="https://gov.osmosis.zone/"
        target="_blank"
        className="opacity-80 hover:opacity-100 cursor-pointer m-auto"
        rel="noreferrer"
      >
        <Image
          className="w-9 h-9"
          src="/icons/commonwealth.svg"
          alt="commonwealth"
          width={32}
          height={32}
        />
      </a>
      <a
        href="https://discord.gg/osmosis"
        target="_blank"
        className="opacity-80 hover:opacity-100 cursor-pointer m-auto"
        rel="noreferrer"
      >
        <Image src="/icons/discord.svg" alt="discord" width={36} height={36} />
      </a>
      <a
        href="https://t.me/osmosis_chat"
        target="_blank"
        className="opacity-80 hover:opacity-100 cursor-pointer m-auto"
        rel="noreferrer"
      >
        <Image
          src="/icons/telegram.svg"
          alt="telegram"
          width={36}
          height={36}
        />
      </a>
    </div>
    <p className="py-2 text-caption text-white-high text-center">
      <a
        className="opacity-30 hover:opacity-40"
        href="https://www.coingecko.com"
        target="_blank"
        rel="noreferrer"
      >
        Price Data by CoinGecko
      </a>
    </p>
  </>
);
