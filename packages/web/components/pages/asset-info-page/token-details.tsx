import { Dec } from "@keplr-wallet/unit";
import { Asset } from "@osmosis-labs/server";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { ClipboardButton } from "~/components/buttons/clipboard-button";
import { SkeletonLoader } from "~/components/loaders";
import { Markdown } from "~/components/markdown";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useAssetInfo } from "~/hooks/use-asset-info";
import { formatPretty } from "~/utils/formatter";

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

export const TokenStats = observer(() => {
  const { t } = useTranslation();

  const { coingeckoCoin, isLoadingCoingeckoCoin } = useAssetInfo();

  return (
    <ul className="flex flex-wrap items-end gap-20 self-stretch 2xl:gap-y-6">
      <li className="flex flex-col items-start gap-3">
        <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
          {t("tokenInfos.marketCapRank")}
        </p>
        <SkeletonLoader className="w-full" isLoaded={!isLoadingCoingeckoCoin}>
          <h5 className="w-full text-xl font-h5 leading-8">
            {coingeckoCoin?.marketCapRank
              ? `#${coingeckoCoin.marketCapRank}`
              : "-"}
          </h5>
        </SkeletonLoader>
      </li>
      <li className="flex flex-col items-start gap-3">
        <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
          {t("tokenInfos.marketCap")}
        </p>
        <SkeletonLoader className="w-full" isLoaded={!isLoadingCoingeckoCoin}>
          <h5 className="w-full text-xl font-h5 leading-8">
            {coingeckoCoin?.marketCap
              ? formatPretty(coingeckoCoin.marketCap, {
                  maximumSignificantDigits: 3,
                  notation: "compact",
                  compactDisplay: "short",
                  scientificMagnitudeThreshold: 30,
                })
              : "-"}
          </h5>
        </SkeletonLoader>
      </li>
      <li className="flex flex-col items-start gap-3">
        <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
          {t("tokenInfos.circulatingSupply")}
        </p>
        <SkeletonLoader className="w-full" isLoaded={!isLoadingCoingeckoCoin}>
          <h5 className="w-full text-xl font-h5 leading-8">
            {coingeckoCoin?.circulatingSupply
              ? formatPretty(new Dec(coingeckoCoin.circulatingSupply), {
                  maximumSignificantDigits: 3,
                  notation: "compact",
                  compactDisplay: "short",
                  scientificMagnitudeThreshold: 30,
                })
              : "-"}
          </h5>
        </SkeletonLoader>
      </li>
    </ul>
  );
});
