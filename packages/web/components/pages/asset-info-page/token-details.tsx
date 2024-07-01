import { Dec, PricePretty } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/server";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { ReactNode, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { ClipboardButton } from "~/components/buttons/clipboard-button";
import { SkeletonLoader } from "~/components/loaders";
import { Markdown } from "~/components/markdown";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useAssetInfo } from "~/hooks/use-asset-info";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

const TEXT_CHAR_LIMIT = 450;

export interface TokenDetailsProps {
  token: Asset;
  className?: string;
}

const _TokenDetails = ({ className }: TokenDetailsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const { title, websiteURL, twitterUrl, coingeckoURL, details, token } =
    useAssetInfo();

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

  const toggleExpand = () => {
    logEvent([
      EventName.TokenInfo.viewMoreClicked,
      { tokenName: token.coinDenom },
    ]);
    setIsExpanded(!isExpanded);
  };

  const shortBase = useMemo(() => {
    if (token.coinMinimalDenom) {
      if (!token.coinMinimalDenom.includes("/")) {
        return token.coinMinimalDenom;
      }

      const [prefix, ...rest] = token.coinMinimalDenom.split("/");

      const hash = rest.join("");

      return `${prefix}/${hash.slice(0, 2)}...${hash.slice(-5)}`;
    }
  }, [token.coinMinimalDenom]);

  return (
    <section
      className={`flex flex-col items-start gap-3 self-stretch xl:gap-6 1.5xs:gap-6 ${className}`}
    >
      {title && (
        <div className="flex flex-col items-start gap-3 self-stretch 1.5xs:gap-4">
          <div className="flex items-center gap-3 1.5xs:flex-col 1.5xs:items-start 1.5xs:gap-4">
            <h5>{t("tokenInfos.aboutDenom", { name: title })}</h5>
            <div className="flex items-center gap-2">
              {twitterUrl ? (
                <Button
                  size="sm-icon"
                  variant="secondary"
                  aria-label={t("tokenInfos.ariaViewOn", { name: "X" })}
                  asChild
                >
                  <Link href={twitterUrl} target="_blank" rel="external">
                    <Icon className="h-4 w-4 text-osmoverse-400" id="X" />
                  </Link>
                </Button>
              ) : null}
              {websiteURL ? (
                <Button
                  size="sm-icon"
                  variant="secondary"
                  aria-label={t("tokenInfos.ariaView", { name: "website" })}
                  asChild
                >
                  <Link href={websiteURL} target="_blank" rel="external">
                    <Icon className="h-4 w-4 text-osmoverse-400" id="web" />
                  </Link>
                </Button>
              ) : null}
              {coingeckoURL ? (
                <Button
                  size="sm-icon"
                  variant="secondary"
                  aria-label={t("tokenInfos.ariaViewOn", {
                    name: "CoinGecko",
                  })}
                  asChild
                >
                  <Link href={coingeckoURL} target="_blank" rel="external">
                    <Icon
                      className="h-4 w-4 text-osmoverse-400"
                      id="coingecko"
                    />
                  </Link>
                </Button>
              ) : null}
              {shortBase ? (
                <ClipboardButton
                  aria-label="Clipboard"
                  defaultIcon="code"
                  value={token.coinMinimalDenom}
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
              <div className="breakspaces self-stretch text-body1 font-body1 text-osmoverse-200 transition-all">
                <Markdown>{expandedText ?? ""}</Markdown>
              </div>
              {isExpandable && (
                <button
                  className={`${
                    !isExpanded && "bottom-0"
                  } absolute z-10 flex items-center gap-2 self-stretch`}
                  onClick={toggleExpand}
                >
                  <p className="text-subtitle1 font-subtitle1 text-wosmongton-300">
                    {isExpanded
                      ? t("tokenInfos.collapse")
                      : t("components.show.more")}
                  </p>
                  <div className={`${isExpanded && "rotate-180"}`}>
                    <Icon
                      id="caret-down"
                      className="text-wosmongton-300"
                      height={16}
                      width={16}
                    />
                  </div>
                </button>
              )}
            </div>
          ) : (
            false
          )}
        </div>
      )}
    </section>
  );
};

export const TokenDetails = observer(_TokenDetails);

const formatCompact = (value: PricePretty | Dec | number) => {
  return formatPretty(typeof value === "number" ? new Dec(value) : value, {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
    scientificMagnitudeThreshold: 30,
  });
};

export const TokenStats = observer(() => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    coinGeckoId,
    coingeckoCoin,
    isLoadingCoingeckoCoin = true,
    tokenDenom,
  } = useAssetInfo();

  const { data: tokenMarket, isLoading: isLoadingTokenMarket } =
    api.edge.assets.getMarketAsset.useQuery(
      {
        findMinDenomOrSymbol: tokenDenom,
      },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 1_000 * 60 * 15,
      }
    );

  const stats: TokenStatProps[] = useMemo(() => {
    const data = [
      {
        title: t("tokenInfos.marketCapRank"),
        value: coingeckoCoin?.marketCapRank
          ? `#${coingeckoCoin.marketCapRank}`
          : "-",
        slotLeft: (
          <Icon
            id="trophy"
            width={24}
            height={24}
            className="text-ammelia-400"
          />
        ),
        isLoading: isLoadingCoingeckoCoin && !!coinGeckoId,
      },
      {
        title: t("tokenInfos.marketCap"),
        value: coingeckoCoin?.marketCap
          ? formatCompact(coingeckoCoin.marketCap)
          : "-",
        isLoading: isLoadingCoingeckoCoin && !!coinGeckoId,
      },
      {
        title: t("tokenInfos.fullyDilutedValuation"),
        value: coingeckoCoin?.fullyDilutedValuation
          ? formatCompact(coingeckoCoin.fullyDilutedValuation)
          : "-",
        isLoading: isLoadingCoingeckoCoin && !!coinGeckoId,
      },
      {
        title: t("tokenInfos.volume24h"),
        value: coingeckoCoin?.volume24h
          ? formatCompact(coingeckoCoin?.volume24h)
          : "-",
        isLoading: isLoadingCoingeckoCoin && !!coinGeckoId,
      },
      {
        title: t("tokenInfos.volumeOnOsmosis"),
        value: tokenMarket?.volume24h
          ? formatCompact(tokenMarket?.volume24h)
          : "-",
        isLoading: isLoadingTokenMarket,
      },
      {
        title: t("tokenInfos.circulatingSupply"),
        value: coingeckoCoin?.circulatingSupply
          ? formatCompact(coingeckoCoin.circulatingSupply)
          : "-",
        isLoading: isLoadingCoingeckoCoin && !!coinGeckoId,
      },
      {
        title: t("tokenInfos.supplyOnOsmosis"),
        value: tokenMarket?.totalSupply
          ? formatCompact(tokenMarket.totalSupply.toDec())
          : "-",
        isLoading: isLoadingTokenMarket,
      },
      {
        title: t("tokenInfos.liquidityOnOsmosis"),
        value: tokenMarket?.liquidity
          ? formatCompact(tokenMarket?.liquidity)
          : "-",
        isLoading: isLoadingTokenMarket,
      },
    ];

    return isExpanded ? data : data.slice(0, 4);
  }, [
    tokenMarket,
    coingeckoCoin,
    isLoadingCoingeckoCoin,
    coinGeckoId,
    isExpanded,
    isLoadingTokenMarket,
    t,
  ]);

  return (
    <section className="flex flex-col gap-8">
      <header>
        <h6>{t("tokenInfos.info.title")}</h6>
      </header>
      <ul className="flex flex-col gap-6">
        {stats.map((stat, index) => (
          <TokenStat key={index} {...stat} />
        ))}

        <TokenStat
          title={t("tokenInfos.info.moreStats")}
          value={
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex gap-2 px-0 !text-subtitle1 font-subtitle1 text-wosmongton-300 hover:no-underline"
            >
              <div>
                {isExpanded
                  ? t("tokenInfos.info.collapse")
                  : t("tokenInfos.info.show")}
              </div>

              <div className={`${isExpanded && "rotate-180"}`}>
                <Icon
                  id="caret-down"
                  className="text-wosmongton-300"
                  height={16}
                  width={16}
                />
              </div>
            </Button>
          }
        />
      </ul>
    </section>
  );
});

interface TokenStatProps {
  title: string;
  value: ReactNode;
  isLoading?: boolean;
  slotLeft?: ReactNode;
  slotRight?: ReactNode;
}

const TokenStat = (props: TokenStatProps) => {
  const { title, value, slotLeft, slotRight, isLoading = false } = props;

  return (
    <li className="flex items-center justify-between gap-4">
      <h5 className="text-body1 font-body1 text-osmoverse-300">{title}</h5>

      <SkeletonLoader isLoaded={!isLoading}>
        <div className="flex items-center gap-2">
          {slotLeft}
          <p className="min-w-10 text-body1 font-body1 text-osmoverse-100">
            {value}
          </p>
          {slotRight}
        </div>
      </SkeletonLoader>
    </li>
  );
};
