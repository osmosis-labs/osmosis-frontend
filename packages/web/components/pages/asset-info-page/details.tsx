import { fromBech32 } from "@cosmjs/encoding";
import { Dec, PricePretty } from "@osmosis-labs/unit";
import { shorten } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React, { FunctionComponent, ReactNode, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { ClipboardButton } from "~/components/buttons/clipboard-button";
import { SkeletonLoader } from "~/components/loaders";
import { Markdown } from "~/components/markdown";
import { Tooltip } from "~/components/tooltip";
import { CustomClasses } from "~/components/types";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import {
  GOVERNANCE_MODULE_ADDRESS,
  TOKENFACTORY_BURN_ADDRESS,
} from "~/config/tokenfactory";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useAssetInfo } from "~/hooks/use-asset-info";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

type AdminState =
  | { kind: "alloyed" }
  | { kind: "renounced" }
  | { kind: "governance" }
  | { kind: "contract" }
  | { kind: "wallet" };

function classifyAdmin(
  admin: string,
  isAlloyed: boolean
): AdminState | undefined {
  if (isAlloyed) return { kind: "alloyed" };
  if (admin === "" || admin === TOKENFACTORY_BURN_ADDRESS)
    return { kind: "renounced" };
  if (admin === GOVERNANCE_MODULE_ADDRESS) return { kind: "governance" };

  try {
    const length = fromBech32(admin).data.length;
    if (length === 32) return { kind: "contract" };
    if (length === 20) return { kind: "wallet" };
  } catch {
    return undefined;
  }
  return undefined;
}

const TEXT_CHAR_LIMIT = 450;

export const AssetDetails = observer(({ className }: CustomClasses) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const {
    title,
    websiteURL,
    twitterUrl,
    telegramURL,
    discordURL,
    githubURL,
    mediumURL,
    coingeckoURL,
    details,
    asset,
    description,
  } = useAssetInfo();

  const isTokenFactory =
    asset?.coinMinimalDenom?.startsWith("factory/") ?? false;
  // Detect alloyed via either the asset-list flag or the canonical
  // `factory/{creator}/alloyed/{sub}` denom path. The path check guards
  // against the flag occasionally not propagating through the trpc layer.
  const isAlloyed =
    (asset?.isAlloyed ?? false) ||
    (isTokenFactory &&
      (asset?.coinMinimalDenom?.split("/")[2] ?? "") === "alloyed");
  // Alloyed assets are governance-controlled — skip the admin query
  const { data: authorityMetadata } =
    api.local.tokenfactory.getDenomAuthorityMetadata.useQuery(
      { denom: asset?.coinMinimalDenom ?? "" },
      { enabled: isTokenFactory && !isAlloyed && !!asset?.coinMinimalDenom }
    );
  const admin = authorityMetadata?.admin;
  const adminState = useMemo(() => {
    if (!isTokenFactory || !asset?.coinMinimalDenom) return undefined;
    if (isAlloyed) return classifyAdmin("", true);
    if (admin === undefined) return undefined;
    return classifyAdmin(admin, false);
  }, [isTokenFactory, isAlloyed, admin, asset?.coinMinimalDenom]);

  const isExpandable = description && description.length > TEXT_CHAR_LIMIT;

  const expandedText = useMemo(() => {
    if (isExpandable && !isExpanded) {
      return description ? description.substring(0, TEXT_CHAR_LIMIT) : "";
    }

    return description;
  }, [isExpandable, isExpanded, description]);

  const toggleExpand = () => {
    logEvent([
      EventName.TokenInfo.viewMoreClicked,
      { tokenName: asset.coinDenom },
    ]);
    setIsExpanded(!isExpanded);
  };

  return (
    <section
      className={`flex flex-col items-start gap-3 self-stretch xl:gap-6 1.5xs:gap-6 ${className}`}
    >
      {title && (
        <div className="flex flex-col items-start gap-3 self-stretch 1.5xs:gap-4">
          <div className="flex items-center gap-3 1.5xs:flex-col 1.5xs:items-start 1.5xs:gap-4">
            <h5>{t("tokenInfos.aboutDenom", { name: title })}</h5>
            <div className="flex items-center gap-2">
              {websiteURL ? (
                <Button
                  size="sm-icon"
                  variant="secondary"
                  aria-label={t("tokenInfos.ariaView", { name: "website" })}
                  asChild
                >
                  <Link href={websiteURL} target="_blank" rel="external">
                    <Icon className="h-4 w-4 fill-osmoverse-400" id="web" />
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
                      className="h-4 w-4 fill-osmoverse-400"
                      id="coingecko"
                    />
                  </Link>
                </Button>
              ) : null}
              {twitterUrl ? (
                <Button
                  size="sm-icon"
                  variant="secondary"
                  aria-label={t("tokenInfos.ariaViewOn", { name: "X" })}
                  asChild
                >
                  <Link href={twitterUrl} target="_blank" rel="external">
                    <Icon className="h-4 w-4 fill-osmoverse-400" id="X" />
                  </Link>
                </Button>
              ) : null}
              {telegramURL ? (
                <Button
                  size="sm-icon"
                  variant="secondary"
                  aria-label={t("tokenInfos.ariaViewOn", { name: "Telegram" })}
                  asChild
                >
                  <Link href={telegramURL} target="_blank" rel="external">
                    <Icon
                      className="h-4 w-4 stroke-osmoverse-400"
                      id="telegram"
                    />
                  </Link>
                </Button>
              ) : null}
              {discordURL ? (
                <Button
                  size="sm-icon"
                  variant="secondary"
                  aria-label={t("tokenInfos.ariaViewOn", { name: "Discord" })}
                  asChild
                >
                  <Link href={discordURL} target="_blank" rel="external">
                    <Icon className="h-4 w-4 fill-osmoverse-400" id="discord" />
                  </Link>
                </Button>
              ) : null}
              {githubURL ? (
                <Button
                  size="sm-icon"
                  variant="secondary"
                  aria-label={t("tokenInfos.ariaViewOn", { name: "GitHub" })}
                  asChild
                >
                  <Link href={githubURL} target="_blank" rel="external">
                    <Icon className="h-4 w-4 fill-osmoverse-400" id="github" />
                  </Link>
                </Button>
              ) : null}
              {mediumURL ? (
                <Button
                  size="sm-icon"
                  variant="secondary"
                  aria-label={t("tokenInfos.ariaViewOn", { name: "Medium" })}
                  asChild
                >
                  <Link href={mediumURL} target="_blank" rel="external">
                    <Icon className="h-4 w-4 fill-osmoverse-400" id="medium" />
                  </Link>
                </Button>
              ) : null}
              {asset.coinMinimalDenom.includes("/") ? (
                <ClipboardButton
                  aria-label="Clipboard"
                  defaultIcon="code"
                  value={asset.coinMinimalDenom}
                >
                  {shorten(asset.coinMinimalDenom)}
                </ClipboardButton>
              ) : (
                false
              )}
              {adminState ? (
                <AdminBadge state={adminState} admin={admin ?? ""} />
              ) : null}
            </div>
          </div>
          {details?.description ? (
            <div
              className={`${
                !isExpanded && isExpandable && "tokendetailshadow"
              } relative self-stretch`}
            >
              <div className="breakspaces self-stretch break-words text-body1 font-body1 text-osmoverse-200 transition-all">
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
});

const AdminBadge: FunctionComponent<{ state: AdminState; admin: string }> = ({
  state,
  admin,
}) => {
  const { t } = useTranslation();

  const { iconId, iconClassName, titleKey, bodyKey } = (() => {
    switch (state.kind) {
      case "alloyed":
        return {
          iconId: "alloyed" as const,
          iconClassName: "fill-osmoverse-400 text-osmoverse-400",
          titleKey: "tokenInfos.adminBadge.alloyedTitle",
          bodyKey: "tokenInfos.adminBadge.alloyedBody",
        };
      case "renounced":
        return {
          iconId: "check-mark-slim" as const,
          iconClassName: "stroke-osmoverse-400 text-osmoverse-400",
          titleKey: "tokenInfos.adminBadge.renouncedTitle",
          bodyKey: "tokenInfos.adminBadge.renouncedBody",
        };
      case "governance":
        return {
          iconId: "vote" as const,
          iconClassName: "fill-osmoverse-400 text-osmoverse-400",
          titleKey: "tokenInfos.adminBadge.governanceTitle",
          bodyKey: "tokenInfos.adminBadge.governanceBody",
        };
      case "contract":
        return {
          iconId: "setting" as const,
          iconClassName: "fill-osmoverse-400 text-osmoverse-400",
          titleKey: "tokenInfos.adminBadge.contractTitle",
          bodyKey: "tokenInfos.adminBadge.contractBody",
        };
      case "wallet":
        return {
          iconId: "alert-triangle" as const,
          iconClassName: "fill-rust-400 text-rust-400",
          titleKey: "tokenInfos.adminBadge.walletTitle",
          bodyKey: "tokenInfos.adminBadge.walletBody",
        };
    }
  })();

  const showLink = state.kind !== "renounced" && state.kind !== "alloyed";
  const tooltipContent = (
    <div className="flex max-w-[18rem] flex-col gap-1">
      <p className="body2 font-semibold text-osmoverse-100">{t(titleKey)}</p>
      <p className="caption text-osmoverse-300">{t(bodyKey)}</p>
      {showLink && (
        <p className="caption break-all text-osmoverse-400">{admin}</p>
      )}
    </div>
  );

  const iconEl = (
    <Icon id={iconId} className={classNames("h-4 w-4", iconClassName)} />
  );

  if (!showLink) {
    return (
      <Tooltip content={tooltipContent}>
        <Button
          size="sm-icon"
          variant="secondary"
          aria-label={t(titleKey)}
          asChild
        >
          <span>{iconEl}</span>
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={tooltipContent}>
      <Button
        size="sm-icon"
        variant="secondary"
        aria-label={t(titleKey)}
        asChild
      >
        <Link
          href={`https://www.mintscan.io/osmosis/address/${admin}`}
          target="_blank"
          rel="noopener noreferrer external"
        >
          {iconEl}
        </Link>
      </Button>
    </Tooltip>
  );
};

const formatCompact = (value: PricePretty | Dec | number) => {
  return formatPretty(typeof value === "number" ? new Dec(value) : value, {
    maximumSignificantDigits: 3,
    notation: "compact",
    compactDisplay: "short",
    scientificMagnitudeThreshold: 30,
  });
};

export const AssetStats = observer((props: CustomClasses) => {
  const { className } = props;
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    coinGeckoId,
    coingeckoCoin,
    isLoadingCoingeckoCoin = true,
    denom: tokenDenom,
  } = useAssetInfo();

  const { data: market, isLoading: isLoadingMarket } =
    api.edge.assets.getMarketAsset.useQuery({
      findMinDenomOrSymbol: tokenDenom,
    });

  const stats: Stat[] = useMemo(() => {
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
        value: market?.volume24h ? formatCompact(market?.volume24h) : "-",
        isLoading: isLoadingMarket,
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
        value: market?.totalSupply
          ? formatCompact(market.totalSupply.toDec())
          : "-",
        isLoading: isLoadingMarket,
      },
      {
        title: t("tokenInfos.liquidityOnOsmosis"),
        value: market?.liquidity ? formatCompact(market?.liquidity) : "-",
        isLoading: isLoadingMarket,
      },
    ];

    return isExpanded ? data : data.slice(0, 4);
  }, [
    market,
    coingeckoCoin,
    isLoadingCoingeckoCoin,
    coinGeckoId,
    isExpanded,
    isLoadingMarket,
    t,
  ]);

  return (
    <section className={classNames("flex flex-col gap-8", className)}>
      <header>
        <h6>{t("tokenInfos.info.title")}</h6>
      </header>
      <ul className="flex flex-col gap-6">
        {stats.map((stat) => (
          <Stat key={stat.title} {...stat} />
        ))}

        <Stat
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

type Stat = {
  title: string;
  value: ReactNode;
  isLoading?: boolean;
  slotLeft?: ReactNode;
  slotRight?: ReactNode;
};

const Stat: FunctionComponent<Stat> = ({
  title,
  value,
  slotLeft,
  slotRight,
  isLoading = false,
}) => (
  <li className="flex items-center justify-between gap-4">
    <h5 className="text-body1 font-body1 text-osmoverse-300">{title}</h5>

    <SkeletonLoader className="flex min-w-10 justify-end" isLoaded={!isLoading}>
      <div className="flex items-center gap-2">
        {slotLeft}
        <p className="text-body1 font-body1 text-osmoverse-100">{value}</p>
        {slotRight}
      </div>
    </SkeletonLoader>
  </li>
);
