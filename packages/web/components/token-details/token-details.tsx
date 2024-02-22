import { FiatCurrency } from "@keplr-wallet/types";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import ClipboardButton from "~/components/buttons/clipboard-button";
import LinkIconButton from "~/components/buttons/link-icon-button";
import Markdown from "~/components/markdown";
import { COINGECKO_PUBLIC_URL, EventName, TWITTER_PUBLIC_URL } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useCurrentLanguage } from "~/hooks";
import { CoingeckoCoin } from "~/server/queries/coingecko/coin";
import { TokenCMSData } from "~/server/queries/external";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

const TEXT_CHAR_LIMIT = 450;

export interface TokenDetailsProps {
  denom: string;
  tokenDetailsByLanguage?: { [key: string]: TokenCMSData } | null;
  coingeckoCoin?: CoingeckoCoin | null;
  className?: string;
}

const TokenDetails = ({
  denom,
  tokenDetailsByLanguage,
  className,
  coingeckoCoin,
}: TokenDetailsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const language = useCurrentLanguage();
  const { queriesExternalStore, priceStore, chainStore } = useStore();
  const { logEvent } = useAmplitudeAnalytics();

  const details = useMemo(() => {
    return tokenDetailsByLanguage
      ? tokenDetailsByLanguage[language]
      : undefined;
  }, [language, tokenDetailsByLanguage]);

  const isExpandable = useMemo(
    () => details?.description && details?.description.length > TEXT_CHAR_LIMIT,
    [details]
  );

  const expandedText = useMemo(() => {
    if (isExpandable && !isExpanded) {
      return details?.description
        ? details.description.substring(0, TEXT_CHAR_LIMIT)
        : "";
    }

    return details?.description;
  }, [isExpandable, isExpanded, details]);

  const chain = chainStore.getChainFromCurrency(denom);

  const balances = useMemo(() => chain?.currencies ?? [], [chain?.currencies]);

  const coinGeckoId = useMemo(
    () =>
      details?.coingeckoID
        ? details?.coingeckoID
        : balances.find(
            (bal) => bal.coinDenom.toUpperCase() === denom.toUpperCase()
          )?.coinGeckoId,
    [balances, details?.coingeckoID, denom]
  );

  const usdFiat = priceStore.getFiatCurrency("usd");
  const coingeckoCoinInfo = coinGeckoId
    ? queriesExternalStore.queryCoinGeckoCoinsInfos.get(coinGeckoId)
    : undefined;
  const marketCapRank = coingeckoCoinInfo?.marketCapRank;
  const totalValueLocked = coingeckoCoinInfo?.totalValueLocked;
  const circulatingSupply = coingeckoCoinInfo?.circulatingSupply;
  const marketCap =
    queriesExternalStore.queryMarketCaps.get(denom) ??
    coingeckoCoinInfo?.marketCap;

  const toggleExpand = () => {
    logEvent([EventName.TokenInfo.viewMoreClicked, { tokenName: denom }]);
    setIsExpanded(!isExpanded);
  };

  const twitterUrl = useMemo(() => {
    if (details?.twitterURL) {
      return details.twitterURL;
    }

    if (coingeckoCoin?.links?.twitter_screen_name) {
      return `${TWITTER_PUBLIC_URL}/${coingeckoCoin.links.twitter_screen_name}`;
    }
  }, [coingeckoCoin?.links?.twitter_screen_name, details?.twitterURL]);

  const websiteURL = useMemo(() => {
    if (details?.websiteURL) {
      return details.websiteURL;
    }

    if (
      coingeckoCoin?.links?.homepage &&
      coingeckoCoin.links.homepage.length > 0
    ) {
      return coingeckoCoin.links.homepage.filter((link) => link.length > 0)[0];
    }
  }, [coingeckoCoin?.links?.homepage, details?.websiteURL]);

  const coingeckoURL = useMemo(() => {
    if (coinGeckoId) {
      return `${COINGECKO_PUBLIC_URL}/en/coins/${coinGeckoId}`;
    }
  }, [coinGeckoId]);

  const currency = useMemo(() => {
    const currencies = ChainList.map(
      (info) => info.keplrChain.currencies
    ).reduce((a, b) => [...a, ...b]);

    const currency = currencies.find(
      (el) => el.coinDenom.toUpperCase() === denom.toUpperCase()
    );

    return currency;
  }, [denom]);

  const name = useMemo(() => {
    if (details) {
      return details.name;
    }

    if (!currency) {
      return undefined;
    }

    const asset = getAssetFromAssetList({
      coinMinimalDenom: currency?.coinMinimalDenom,
      assetLists: AssetLists,
    });

    return asset?.rawAsset.name;
  }, [details, currency]);

  const shortBase = useMemo(() => {
    if (currency?.base) {
      if (!currency.base.includes("/")) {
        return currency.base;
      }

      const [prefix, ...rest] = currency.base.split("/");

      const hash = rest.join("");

      return `${prefix}/${hash.slice(0, 2)}...${hash.slice(-5)}`;
    }
  }, [currency]);

  return (
    <section
      className={`flex flex-col items-start gap-3 self-stretch rounded-5xl border border-osmoverse-800 bg-osmoverse-900 p-10 xl:gap-6 md:p-6 1.5xs:gap-6 ${className}`}
    >
      <TokenStats
        usdFiat={usdFiat}
        marketCap={marketCap}
        marketCapRank={marketCapRank}
        totalValueLocked={totalValueLocked}
        circulatingSupply={circulatingSupply}
      />
      {name && (
        <div className="flex flex-col items-start self-stretch">
          <div className="flex flex-col items-start gap-4.5 self-stretch 1.5xs:gap-6">
            <div className="flex items-center gap-8 1.5xs:flex-col 1.5xs:items-start 1.5xs:gap-4">
              <h6 className="text-lg font-h6 leading-6 text-osmoverse-100">
                {t("tokenInfos.aboutDenom", { name })}
              </h6>
              <div className="flex items-center gap-2">
                {twitterUrl && (
                  <LinkIconButton
                    href={twitterUrl}
                    target="_blank"
                    mode="icon-social"
                    size="md-icon-social"
                    aria-label={t("tokenInfos.ariaViewOn", { name: "X" })}
                    icon={
                      <Icon className="h-4 w-4 text-osmoverse-400" id="X" />
                    }
                  />
                )}
                {websiteURL && (
                  <LinkIconButton
                    href={websiteURL}
                    target="_blank"
                    mode="icon-social"
                    size="md-icon-social"
                    aria-label={t("tokenInfos.ariaView", { name: "website" })}
                    icon={
                      <Icon className="h-6 w-6 text-osmoverse-400" id="web" />
                    }
                  />
                )}
                {coingeckoURL && (
                  <LinkIconButton
                    href={coingeckoURL}
                    target="_blank"
                    mode="icon-social"
                    size="md-icon-social"
                    aria-label={t("tokenInfos.ariaViewOn", {
                      name: "CoinGecko",
                    })}
                    icon={
                      <Icon
                        className="h-10.5 w-10.5 text-osmoverse-300"
                        id="coingecko"
                      />
                    }
                  />
                )}
                {shortBase ? (
                  <ClipboardButton
                    aria-label="Clipboard"
                    defaultIcon="code"
                    value={currency?.base}
                  >
                    {shortBase}
                  </ClipboardButton>
                ) : (
                  false
                )}
              </div>
            </div>
            {details?.description ? (
              <div
                className={`${
                  !isExpanded && isExpandable && "tokendetailshadow"
                } relative self-stretch`}
              >
                <div className="breakspaces font-base self-stretch font-subtitle1 text-osmoverse-200 transition-all">
                  <Markdown>{expandedText ?? ""}</Markdown>
                </div>
                {isExpandable && (
                  <button
                    className={`${
                      !isExpanded && "bottom-0"
                    } absolute z-10 flex items-center gap-1 self-stretch`}
                    onClick={toggleExpand}
                  >
                    <p className="font-base leading-6 text-wosmongton-300">
                      {isExpanded
                        ? t("tokenInfos.collapse")
                        : t("components.show.more")}
                    </p>
                    <div className={`${isExpanded && "rotate-180"}`}>
                      <Icon
                        id="caret-down"
                        className="text-wosmongton-300"
                        height={24}
                        width={24}
                      />
                    </div>
                  </button>
                )}
              </div>
            ) : (
              false
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default observer(TokenDetails);

interface TokenStatsProps {
  usdFiat?: FiatCurrency;
  marketCapRank?: number;
  totalValueLocked?: number;
  marketCap?: number;
  circulatingSupply?: number;
}

const TokenStats: FunctionComponent<TokenStatsProps> = observer(
  ({ usdFiat, marketCap, marketCapRank, circulatingSupply }) => {
    const { t } = useTranslation();
    return (
      <ul className="flex flex-wrap items-end gap-20 self-stretch 2xl:gap-y-6">
        <li className="flex flex-col items-start gap-3">
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
            {t("tokenInfos.marketCapRank")}
          </p>
          <h5 className="text-xl font-h5 leading-8">
            {marketCapRank ? `#${marketCapRank}` : t("tokenInfos.noData")}
          </h5>
        </li>
        <li className="flex flex-col items-start gap-3">
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
            {t("tokenInfos.marketCap")}
          </p>
          <h5 className="text-xl font-h5 leading-8">
            {marketCap && usdFiat
              ? formatPretty(new PricePretty(usdFiat, new Dec(marketCap)))
              : t("tokenInfos.noData")}
          </h5>
        </li>
        <li className="flex flex-col items-start gap-3">
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
            {t("tokenInfos.circulatingSupply")}
          </p>
          <h5 className="text-xl font-h5 leading-8">
            {circulatingSupply
              ? formatPretty(new Dec(circulatingSupply), {
                  maximumSignificantDigits: 3,
                  notation: "compact",
                  compactDisplay: "short",
                })
              : t("tokenInfos.noData")}
          </h5>
        </li>
        {/* <li className="flex flex-col items-start gap-3">
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
            {t("tokenInfos.tvl")}
          </p>
          <h5 className="text-xl font-h5 leading-8">
            {totalValueLocked && usdFiat
              ? formatPretty(
                  new PricePretty(usdFiat, new Dec(totalValueLocked))
                )
              : t("tokenInfos.noData")}
          </h5>
        </li> */}
      </ul>
    );
  }
);
